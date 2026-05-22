package com.fiap.monitoramento_vegetacao.service;

import com.fiap.monitoramento_vegetacao.model.Sensor;
import com.fiap.monitoramento_vegetacao.repository.SensorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SensorService {

    @Autowired
    private SensorRepository repository;

    // CREATE: Cria um novo sensor
    public Sensor criar(Sensor sensor) {
        return repository.save(sensor);
    }

    // READ: Lista todos os sensores
    public List<Sensor> listarTodos() {
        return repository.findAll();
    }

    // READ: Busca um sensor específico por ID
    public Optional<Sensor> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // UPDATE: Atualiza os dados de um sensor existente
    public Sensor atualizar(Long id, Sensor sensorAtualizado) {
        return repository.findById(id).map(sensor -> {
            sensor.setNome(sensorAtualizado.getNome());
            sensor.setTipo(sensorAtualizado.getTipo());
            sensor.setLocal(sensorAtualizado.getLocal());
            sensor.setUnidade(sensorAtualizado.getUnidade());
            sensor.setLimiteMinimo(sensorAtualizado.getLimiteMinimo());
            sensor.setLimiteMaximo(sensorAtualizado.getLimiteMaximo());
            sensor.setAtivo(sensorAtualizado.getAtivo());
            return repository.save(sensor);
        }).orElseThrow(() -> new RuntimeException("Sensor com ID " + id + " não encontrado!"));
    }

    // DELETE: Remove um sensor
    public void deletar(Long id) {
        // Verifica se existe antes de deletar, boa prática para evitar erros silenciosos
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("Sensor com ID " + id + " não encontrado para deleção!");
        }
    }
}