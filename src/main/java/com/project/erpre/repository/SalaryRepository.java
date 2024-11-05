package com.project.erpre.repository;

import com.project.erpre.model.entity.Salary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalaryRepository extends JpaRepository<Salary, Integer> {


    Page<Salary> findAllBySalaryDeleteYn(String salaryDeleteYn, Pageable pageable);

}
