package com.project.erpre.service;

import com.project.erpre.model.entity.Department;
import com.project.erpre.model.entity.Employee;
import com.project.erpre.model.dto.EmployeeDTO;
import com.project.erpre.model.entity.Job;
import com.project.erpre.repository.DepartmentRepository;
import com.project.erpre.repository.EmployeeRepository;
import com.project.erpre.repository.JobRepository;
import com.querydsl.core.Tuple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private JobRepository jobRepository;
            
    // EmployeeDTO -> Employee 엔티티로 변환하는 메서드
    private Employee convertToEntity(EmployeeDTO employeeDTO) {
        Employee employee = new Employee();
        employee.setEmployeeId(employeeDTO.getEmployeeId());
        employee.setEmployeePw(employeeDTO.getEmployeePw());
        employee.setEmployeeName(employeeDTO.getEmployeeName());
        employee.setEmployeeEmail(employeeDTO.getEmployeeEmail());
        employee.setEmployeeTel(employeeDTO.getEmployeeTel());

        // Department와 Job을 각각 조회해서 설정
        Department department = departmentRepository.findById(employeeDTO.getDepartmentId()).orElse(null);
        Job job = jobRepository.findById(employeeDTO.getJobId()).orElse(null);
        employee.setDepartment(department);
        employee.setJob(job);

        employee.setEmployeeInsertDate(employeeDTO.getEmployeeInsertDate());
        employee.setEmployeeUpdateDate(employeeDTO.getEmployeeUpdateDate());
        employee.setEmployeeDeleteYn(employeeDTO.getEmployeeDeleteYn());
        employee.setEmployeeDeleteDate(employeeDTO.getEmployeeDeleteDate());
        employee.setEmployeeStatus(employeeDTO.getEmployeeStatus());
        employee.setEmployeeStatusUpdateTime(employeeDTO.getEmployeeStatusUpdateTime());
        employee.setEmployeeStatusMessage(employeeDTO.getEmployeeStatusMessage());
        return employee;
    }

    // Employee 엔티티 -> EmployeeDTO로 변환하는 메서드
    private EmployeeDTO convertToDTO(Employee employee) {

        Integer jobId = null;
        String jobName = null;
        if (employee.getJob() != null) {
            jobId = employee.getJob().getJobId();
            jobName = employee.getJob().getJobName();
        }

        Integer departmentId = null;
        String departmentName = null;
        if (employee.getDepartment() != null) {
            departmentId = employee.getDepartment().getDepartmentId();
            departmentName = employee.getDepartment().getDepartmentName();
        }

        return EmployeeDTO.builder()
                .employeeId(employee.getEmployeeId())
                .employeePw(employee.getEmployeePw())
                .employeeName(employee.getEmployeeName())
                .employeeEmail(employee.getEmployeeEmail())
                .employeeTel(employee.getEmployeeTel())
                .jobId(jobId)
                .jobName(jobName)
                .departmentId(departmentId)
                .departmentName(departmentName)
                .employeeInsertDate(employee.getEmployeeInsertDate())
                .employeeUpdateDate(employee.getEmployeeUpdateDate())
                .employeeDeleteYn(employee.getEmployeeDeleteYn())
                .employeeDeleteDate(employee.getEmployeeDeleteDate())
                .employeeStatus(employee.getEmployeeStatus())
                .employeeStatusUpdateTime(employee.getEmployeeStatusUpdateTime())
                .employeeStatusMessage(employee.getEmployeeStatusMessage())
                .jobRole(employee.getJob().getJobRole())
                .jobName(employee.getJob().getJobName())
                .departmentName(employee.getDepartment().getDepartmentName())
                .build();
    }

    //재직자
    public Page<EmployeeDTO> getPageEmployees(int page, int size) {
        Pageable pageable = PageRequest.of(page -1 , size);
        Page<Employee> employeePage = employeeRepository.findByEmployeeDeleteYn("N", pageable);
        return employeePage.map(this::convertToDTO);
    }

    //전체직원
    public Page<EmployeeDTO> getAllPageEmployees(int page, int size) {
        Pageable pageable = PageRequest.of(page -1 , size);
        Page<Employee> employeePage = employeeRepository.findAll(pageable);
        return employeePage.map(this::convertToDTO);
    }

    //퇴직자만
    public Page<EmployeeDTO> getPageEmployeesY(int page, int size) {
        Pageable pageable = PageRequest.of(page -1 , size);
        Page<Employee> employeePage = employeeRepository.findByEmployeeDeleteYn("Y", pageable);
        return employeePage.map(this::convertToDTO);
    }

    //delete_yn만 바꾸기(논리적삭제)
    public void deleteLogicalEmployees(List<String> ids) {
        for (String id : ids) {
            Employee employee = employeeRepository.findById(id).orElse(null);
            if (employee != null) {
                employee.setEmployeeDeleteYn("Y");
                employee.setEmployeeDeleteDate(new Timestamp(System.currentTimeMillis()));
                employeeRepository.save(employee);  // update로 N -> Y로 바꿈
            }
        }
    }

    // 신규직원 등록
    public void registerEmployee(EmployeeDTO employeeDTO) {
        // Department와 Job 엔티티 조회
        Department department = departmentRepository.findById(employeeDTO.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("부서를 찾을 수 없습니다."));
        Job job = jobRepository.findById(employeeDTO.getJobId())
                .orElseThrow(() -> new RuntimeException("직급을 찾을 수 없습니다."));

        Employee employee = Employee.builder()
                .employeeId(employeeDTO.getEmployeeId())
                .employeePw(employeeDTO.getEmployeePw())
                .employeeName(employeeDTO.getEmployeeName())
                .employeeEmail(employeeDTO.getEmployeeEmail())
                .employeeTel(employeeDTO.getEmployeeTel())
                .employeeDeleteYn("N")  // 기본값 설정
                .employeeInsertDate(new Timestamp(System.currentTimeMillis()))
                .department(department) // 추가된 부분
                .job(job) // 추가된 부분
                .build();

        employeeRepository.save(employee);
    }

    // 수정모달에서 직원정보 수정
    public void updateEmployee(String employeeId, EmployeeDTO employeeDTO) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee != null) {
            employee.setEmployeePw(employeeDTO.getEmployeePw());
            employee.setEmployeeName(employeeDTO.getEmployeeName());
            employee.setEmployeeEmail(employeeDTO.getEmployeeEmail());
            employee.setEmployeeTel(employeeDTO.getEmployeeTel());
            employee.setEmployeeUpdateDate(new Timestamp(System.currentTimeMillis()));  // 수정일자 업데이트

            // Department와 Job 업데이트
            Department department = departmentRepository.findById(employeeDTO.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("부서를 찾을 수 없습니다."));
            Job job = jobRepository.findById(employeeDTO.getJobId())
                    .orElseThrow(() -> new RuntimeException("직급을 찾을 수 없습니다."));

            employee.setDepartment(department);
            employee.setJob(job);

            employeeRepository.save(employee);  // 수정된 정보 저장
        }
    }

    //수정모달에서 직원삭제
    public void deleteLogicalEmployee(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee != null) {
            employee.setEmployeeDeleteYn("Y");
            employee.setEmployeeDeleteDate(new Timestamp(System.currentTimeMillis()));  // 삭제일자 업데이트
            employeeRepository.save(employee);  // 논리적 삭제 저장
        }
    }

    // 중복 ID체크
    public boolean existsByEmployeeId(String employeeId) {
        return employeeRepository.existsById(employeeId);
    }


    // 전체 직원 수 가져오기
    public long getTotalEmployeeCount() {
        return employeeRepository.count();
    }

    // 최근 한달간 채용된 직원 수 가져오기
    public long getRecentHiresCount(int days) {
        return employeeRepository.countRecentHires(days);
    }

    // 최근 한달간 은퇴한 직원수 가져오기
    public long countDeletedEmployeesLast30Days() {
        return employeeRepository.countDeletedEmployeesLast30Days();
    }

    // 메신저 직원 조회 (검색)
    public Page<EmployeeDTO> getEmployeeList(int page, int size, String searchKeyword) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Employee> employees = employeeRepository.getEmployeeList(pageable, searchKeyword);

        List<EmployeeDTO> employeeDTO = employees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(employeeDTO, pageable, employees.getTotalElements());
    }

    // 🟢 검색어와 상태 필터에 따른 메신저 조직도 조회
    public List<EmployeeDTO> getMessengerEmployeeList(String status, String searchKeyword) {

        if (status == null || status.isEmpty()) { status = "all"; }

        return employeeRepository.getMessengerEmployeeList(status, searchKeyword)
               .stream()
               .map(this::convertToDTO)
               .collect(Collectors.toList());
    }

    // 현재 로그인한 직원 조회
    public EmployeeDTO getLoginEmployee(String employeeId) {
        Employee employee = employeeRepository.getLoginEmployee(employeeId);
        return convertToDTO(employee);
    }

}