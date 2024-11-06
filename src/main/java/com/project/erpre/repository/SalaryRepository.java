package com.project.erpre.repository;

import com.project.erpre.model.entity.Salary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SalaryRepository extends JpaRepository<Salary, Integer> {


    Page<Salary> findAllBySalaryDeleteYn(String salaryDeleteYn, Pageable pageable);

    // 직전년도 실적 조회
    @Query("SELECT s.employee.employeeId, SUM(s.orderHTotalPrice) as totalOrderPrice " +
            "FROM Order s " +
            "WHERE s.orderHStatus = 'approved' AND YEAR(s.orderHInsertDate) = :year " +
            "GROUP BY s.employee.employeeId " +
            "ORDER BY totalOrderPrice DESC")
    List<Object[]> findTop5EmployeesByOrderAmount(@Param("year") int year);

    //직원 아이디로 조회
    Salary findByEmployeeEmployeeId(String employeeId);
}
