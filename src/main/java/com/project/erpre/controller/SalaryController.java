package com.project.erpre.controller;

import com.project.erpre.model.dto.SalaryDTO;
import com.project.erpre.service.SalaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salary")
public class SalaryController {

    @Autowired
    private SalaryService salaryService;

    // 🔍 페이지네이션과 필터링 적용: 기본은 active 상태, 즉 salary_delete_yn = 'N'인 데이터만 표시
    @GetMapping("/salaries")
    public ResponseEntity<List<SalaryDTO>> getSalaries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "active") String filter) {

        List<SalaryDTO> salaryDTOs;

        switch (filter) {
            case "active":
                salaryDTOs = salaryService.getActiveSalaries(page, size); // 🔍 salary_delete_yn = 'N' 데이터만 조회
                break;
            case "deleted":
                salaryDTOs = salaryService.getDeletedSalaries(page, size); // 🔍 salary_delete_yn = 'Y' 데이터 조회
                break;
            case "all": // 🔥 전체 데이터를 가져오는 조건 추가
                salaryDTOs = salaryService.getAllSalaries(page, size); // 🔥 전체 데이터 조회
                break;
            default:
                salaryDTOs = salaryService.getActiveSalaries(page, size); // 기본으로 active 상태만 조회
                break;
        }

        return ResponseEntity.ok(salaryDTOs);
    }

    @PostMapping("/salaries/delete")
    public ResponseEntity<Void> deleteSalaries(@RequestBody List<Integer> salaryIds) {
        salaryService.deleteSalaries(salaryIds);
        return ResponseEntity.ok().build();
    }
}
