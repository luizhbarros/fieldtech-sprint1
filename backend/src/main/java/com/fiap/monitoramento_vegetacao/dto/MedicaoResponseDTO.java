package com.fiap.monitoramento_vegetacao.dto;

import com.fiap.monitoramento_vegetacao.model.Sensor;
import com.fiap.monitoramento_vegetacao.model.StatusMedicao;
import java.time.LocalDateTime;

public class MedicaoResponseDTO {

    private Long id;
    private Sensor sensor;
    private Double valor;
    private LocalDateTime data;
    private StatusMedicao status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Sensor getSensor() {
        return sensor;
    }

    public void setSensor(Sensor sensor) {
        this.sensor = sensor;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public StatusMedicao getStatus() {
        return status;
    }

    public void setStatus(StatusMedicao status) {
        this.status = status;
    }
}