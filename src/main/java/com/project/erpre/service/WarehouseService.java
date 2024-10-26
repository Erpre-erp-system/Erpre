package com.project.erpre.service;

import com.project.erpre.model.dto.EmployeeDTO;
import com.project.erpre.model.dto.WarehouseDTO;
import com.project.erpre.model.entity.Employee;
import com.project.erpre.model.entity.Warehouse;
import com.project.erpre.repository.EmployeeRepository;
import com.project.erpre.repository.WarehouseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    //WarehouseDTO -> Warehouse 엔티티로 변환하는 메서드
    private Warehouse convertToWarehouseEntity(WarehouseDTO warehouseDTO) {
        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseNo(warehouse.getWarehouseNo());
        warehouse.setWarehouseName(warehouse.getWarehouseName());
        warehouse.setWarehouseTel(warehouse.getWarehouseTel());
        warehouse.setWarehouseAddr(warehouse.getWarehouseAddr());
        warehouse.setWarehouseManagerName(warehouse.getWarehouseManagerName());
        return warehouse;
    }

    // Warehouse 엔티티 -> WarehouseDTO로 변환하는 메서드
    private WarehouseDTO convertToWarehouseDTO(Warehouse warehouse) {
        return WarehouseDTO.builder()
                .warehouseNo(warehouse.getWarehouseNo())
                .warehouseName(warehouse.getWarehouseName())
                .warehouseTel(warehouse.getWarehouseTel())
                .warehouseAddr(warehouse.getWarehouseAddr())
                .warehouseManagerName(warehouse.getWarehouseManagerName())
                .build();
    }

    //Employee 엔티티 -> EmployeeDTO로 변환하는 메서드(현재 로그인한 직원 조회 필요)
    private EmployeeDTO convertToEmployeeDTO(Employee employee) {
        return EmployeeDTO.builder()
                .employeeId(employee.getEmployeeId())
                .employeeName(employee.getEmployeeName())
                .build();
    }


    // 창고명으로 창고 정보 가져오기
    public WarehouseDTO getWarehouseInfoByName(String warehouseName) {
        Warehouse warehouse = warehouseRepository.findByWarehouseName(warehouseName);
        if (warehouse != null) {
            return convertToWarehouseDTO(warehouse);
        } else {
            return null;
        }
    }

    // 창고명으로 창고 담당자 목록 가져오기
    public List<String> getWarehouseManagersByName(String warehouseName) {
        Warehouse warehouse = warehouseRepository.findByWarehouseName(warehouseName);
        if (warehouse != null && warehouse.getWarehouseManagerName() != null) {
            // 창고 담당자명이 콤마로 구분된 문자열이라고 가정
            String managerNames = warehouse.getWarehouseManagerName();
            List<String> managerList = Arrays.asList(managerNames.split(","));
            return managerList;
        } else {
            // 기본 담당자 목록 반환 또는 빈 리스트 반환
            return Arrays.asList();
        }
    }

    //현재 로그인한 직원 조회
    public EmployeeDTO getLoginEmployee(String employeeId) {
        Employee employee = employeeRepository.getLoginEmployee(employeeId);
        return convertToEmployeeDTO(employee);
    }

}
