package com.project.erpre.repository;

import com.project.erpre.model.dto.EmployeeDTO;
import com.project.erpre.model.entity.Employee;
import com.querydsl.core.Tuple;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeRepositoryCustom {

    // 1. 메신저 직원 조회 (검색)
    Page<Employee> getEmployeeList(Pageable pageable, String searchKeyword);

    // 2. 현재 로그인한 직원 조회
    Employee getLoginEmployee(String employeeId);

    // 3. 메신저 직원 조회 (조직도)
    List<Employee> getMessengerEmployeeList(String searchKeyword);

}
