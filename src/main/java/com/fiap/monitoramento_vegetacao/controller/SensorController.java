package com.fiap.monitoramento_vegetacao.controller;

import com.fiap.monitoramento_vegetacao.model.Sensor;
import com.fiap.monitoramento_vegetacao.service.SensorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sensores")
public class SensorController {

    @Autowired
    private SensorService service;

    // CREATE: POST /api/sensores
    @PostMapping
    public ResponseEntity<Sensor> criarSensor(@RequestBody Sensor sensor) {
        Sensor novoSensor = service.criar(sensor);
        // Retorna HTTP 201 (Created) quando o recurso é criado com sucesso
        return new ResponseEntity<>(novoSensor, HttpStatus.CREATED);
    }

    // READ: GET /api/sensores
    @GetMapping
    public ResponseEntity<List<Sensor>> listarSensores() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // READ: GET /api/sensores/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Sensor> buscarPorId(@PathVariable Long id) {
        Optional<Sensor> sensor = service.buscarPorId(id);
        return sensor.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // UPDATE: PUT /api/sensores/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Sensor> atualizarSensor(@PathVariable Long id, @RequestBody Sensor sensor) {
        try {
            Sensor sensorAtualizado = service.atualizar(id, sensor);
            return ResponseEntity.ok(sensorAtualizado);
        } catch (RuntimeException e) {
            // Retorna HTTP 404 (Not Found) se tentar atualizar um ID que não existe
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE: DELETE /api/sensores/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarSensor(@PathVariable Long id) {
        try {
            service.deletar(id);
            // Retorna HTTP 204 (No Content) após deletar com sucesso
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}