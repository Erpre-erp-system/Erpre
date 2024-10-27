package com.project.erpre.controller;

import com.project.erpre.model.dto.WarehouseDTO;
import com.project.erpre.service.WarehouseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {

    private static final Logger logger = LoggerFactory.getLogger(WarehouseController.class); // Logger 선언

    @Autowired
    private WarehouseService warehouseService;

    // 창고 배정 모달에서 db 목록 가져오기
    @GetMapping("/list")
    public ResponseEntity<List<WarehouseDTO>> getAllWarehouses() {
        List<WarehouseDTO> warehouseList = warehouseService.getAllWarehouses();
        return ResponseEntity.ok(warehouseList);
    }

    // 창고명으로 창고 정보 가져오기
    @GetMapping("/info")
    public ResponseEntity<WarehouseDTO> getWarehouseInfo(@RequestParam String warehouseName) {
        WarehouseDTO warehouseDTO = warehouseService.getWarehouseInfoByName(warehouseName);
        if (warehouseDTO != null) {
            return ResponseEntity.ok(warehouseDTO);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 창고명으로 창고 담당자 목록 가져오기
    @GetMapping("/managers")
    public ResponseEntity<List<String>> getWarehouseManagers(@RequestParam String warehouseName) {
        List<String> managers = warehouseService.getWarehouseManagersByName(warehouseName);
        return ResponseEntity.ok(managers);
    }

}
