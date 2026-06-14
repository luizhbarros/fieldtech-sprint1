package com.fiap.monitoramento_vegetacao.service;

import com.fiap.monitoramento_vegetacao.dto.MedicaoResponseDTO;
import com.fiap.monitoramento_vegetacao.model.Medicao;
import com.fiap.monitoramento_vegetacao.model.Sensor;
import com.fiap.monitoramento_vegetacao.model.StatusMedicao;
import com.fiap.monitoramento_vegetacao.repository.MedicaoRepository;
import com.fiap.monitoramento_vegetacao.repository.SensorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MedicaoService {

    @Autowired
    private MedicaoRepository medicaoRepository;

    @Autowired
    private SensorRepository sensorRepository;

    public MedicaoResponseDTO registrar(Medicao medicaoRequest) {
        Sensor sensor = sensorRepository.findById(medicaoRequest.getSensor().getId())
                .orElseThrow(() -> new RuntimeException("Sensor não encontrado com ID: " + medicaoRequest.getSensor().getId()));

        medicaoRequest.setSensor(sensor);
        if (medicaoRequest.getData() == null) {
            medicaoRequest.setData(LocalDateTime.now());
        }

        Medicao medicaoSalva = medicaoRepository.save(medicaoRequest);
        return converterParaDTO(medicaoSalva);
    }

    public List<MedicaoResponseDTO> listarTodas() {
        return medicaoRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public Optional<MedicaoResponseDTO> buscarPorId(Long id) {
        return medicaoRepository.findById(id).map(this::converterParaDTO);
    }

    public List<MedicaoResponseDTO> listarPorSensor(Long sensorId) {
        return medicaoRepository.findBySensorId(sensorId).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    // Algoritmo de Classificação da Sprint 2
    public StatusMedicao calcularStatus(Double valor, Sensor sensor) {
        if (sensor.getLimiteMinimo() == null || sensor.getLimiteMaximo() == null) {
            return StatusMedicao.NORMAL;
        }

        double min = sensor.getLimiteMinimo();
        double max = sensor.getLimiteMaximo();

        // 1. CRÍTICO: Fora das faixas permitidas pelo dispositivo
        if (valor < min || valor > max) {
            return StatusMedicao.CRITICO;
        }

        // 2. ALERTA: Dentro da faixa, porém próximo do limite (zona de 20% de proximidade)
        double amplitude = max - min;
        double margemTolerancia = amplitude * 0.2;

        if (valor >= (max - margemTolerancia) || valor <= (min + margemTolerancia)) {
            return StatusMedicao.ALERTA;
        }

        // 3. NORMAL: Operação estável e centralizada
        return StatusMedicao.NORMAL;
    }

    private MedicaoResponseDTO converterParaDTO(Medicao medicao) {
        MedicaoResponseDTO dto = new MedicaoResponseDTO();
        dto.setId(medicao.getId());
        dto.setSensor(medicao.getSensor());
        dto.setValor(medicao.getValor());
        dto.setData(medicao.getData());
        dto.setStatus(calcularStatus(medicao.getValor(), medicao.getSensor()));
        return dto;
    }
}