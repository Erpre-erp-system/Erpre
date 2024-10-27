package com.project.erpre.repository;

import com.project.erpre.model.entity.QrCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QrCodeRepository extends JpaRepository<QrCode, UUID> {
}
