package com.project.erpre.service;

import com.project.erpre.model.dto.DepartmentDTO;
import com.project.erpre.model.dto.EmployeeDTO;
import com.project.erpre.model.dto.JobDTO;
import com.project.erpre.model.dto.SalaryDTO;
import com.project.erpre.model.entity.Department;
import com.project.erpre.model.entity.Employee;
import com.project.erpre.model.entity.Job;
import com.project.erpre.model.entity.Salary;
import com.project.erpre.repository.SalaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalaryService {

    @Autowired
    private SalaryRepository salaryRepository;

    // 전체조회
    public List<SalaryDTO> getAllSalaries(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Salary> salariesPage = salaryRepository.findAll(pageable);

        return salariesPage.getContent().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // 🔍 페이지네이션 기능이 있는 기본 조회 메서드: salary_delete_yn = 'N'인 데이터만 조회
    public List<SalaryDTO> getActiveSalaries(int page, int size) {
        return getSalariesByDeleteYn("N", page, size);
    }

    // 🔍 salary_delete_yn 값에 따라 필터링된 데이터 반환 메서드 추가
    public List<SalaryDTO> getDeletedSalaries(int page, int size) {
        return getSalariesByDeleteYn("Y", page, size);
    }

    // 🔍 내부 메서드: salary_delete_yn 값에 따라 데이터를 페이지 단위로 조회
    public List<SalaryDTO> getSalariesByDeleteYn(String deleteYn, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Salary> salariesPage = salaryRepository.findAllBySalaryDeleteYn(deleteYn, pageable);

        return salariesPage.getContent().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // 🔍 Salary 엔티티를 SalaryDTO로 변환하는 메서드 (급여 계산 방식 유지)
    private SalaryDTO convertToDTO(Salary salary) {
        SalaryDTO dto = new SalaryDTO();
        dto.setSalaryId(salary.getSalaryId());

        Employee employee = salary.getEmployee();
        EmployeeDTO employeeDTO = new EmployeeDTO();
        employeeDTO.setEmployeeName(employee.getEmployeeName());
        dto.setEmployee(employeeDTO);

        Department department = employee.getDepartment();
        DepartmentDTO departmentDTO = new DepartmentDTO();
        departmentDTO.setDepartmentName(department.getDepartmentName());
        dto.setDepartment(departmentDTO);

        Job job = employee.getJob();
        JobDTO jobDTO = new JobDTO();
        jobDTO.setJobName(job.getJobName());
        jobDTO.setGradeIncentiveRate(job.getGradeIncentiveRate());
        dto.setJob(jobDTO);

        dto.setBaseSalary(job.getMinSalary());
        dto.setPerformanceIncentiveRate(salary.getPerformanceIncentiveRate());
        dto.setGradeIncentiveRate(job.getGradeIncentiveRate());
        dto.setBonus((int) (dto.getBaseSalary() * 0.1)); // 기본급의 10%

        // totalPayment 계산
        BigDecimal totalPayment = BigDecimal.valueOf(dto.getBaseSalary())
                .add(BigDecimal.valueOf(dto.getBonus()))
                .add(BigDecimal.valueOf(dto.getBaseSalary()).multiply(dto.getPerformanceIncentiveRate().divide(BigDecimal.valueOf(100))))
                .add(BigDecimal.valueOf(dto.getBaseSalary()).multiply(dto.getGradeIncentiveRate().divide(BigDecimal.valueOf(100))));

        dto.setTotalPayment(totalPayment.intValue());

        if (salary.getSalaryDeleteDate() != null) {
            dto.setDeleteDate(salary.getSalaryDeleteDate());
        }

        return dto;
    }

    // 🔍 삭제 요청 시 salary_delete_yn 값을 'Y'로 변경하고 삭제 일시 설정
    public void deleteSalaries(List<Integer> salaryIds) {
        List<Salary> salaries = salaryRepository.findAllById(salaryIds);
        for (Salary salary : salaries) {
            salary.setSalaryDeleteYn("Y");
            salary.setSalaryDeleteDate(LocalDateTime.now());
        }
        salaryRepository.saveAll(salaries);
    }
}
