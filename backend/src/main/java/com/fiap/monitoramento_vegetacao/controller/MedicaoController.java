package com.fiap.monitoramento_vegetacao.controller;

import com.fiap.monitoramento_vegetacao.dto.MedicaoResponseDTO;
import com.fiap.monitoramento_vegetacao.model.Medicao;
import com.fiap.monitoramento_vegetacao.service.MedicaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/medicoes")
public class MedicaoController {

    @Autowired
    private MedicaoService service;

    // POST /api/medicoes
    @PostMapping
    public ResponseEntity<MedicaoResponseDTO> registrarMedicao(@RequestBody Medicao medicao) {
        try {
            MedicaoResponseDTO novaMedicao = service.registrar(medicao);
            return new ResponseEntity<>(novaMedicao, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET /api/medicoes
    @GetMapping
    public ResponseEntity<List<MedicaoResponseDTO>> listarMedicoes() {
        return ResponseEntity.ok(service.listarTodas());
    }

    // GET /api/medicoes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<MedicaoResponseDTO> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET /api/medicoes/sensor/{id}
    @GetMapping("/sensor/{sensorId}")
    public ResponseEntity<List<MedicaoResponseDTO>> listarPorSensor(@PathVariable Long sensorId) {
        return ResponseEntity.ok(service.listarPorSensor(sensorId));
    }
}
