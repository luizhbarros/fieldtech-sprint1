package com.fiap.monitoramento_vegetacao.repository;

import com.fiap.monitoramento_vegetacao.model.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, Long> {
}
