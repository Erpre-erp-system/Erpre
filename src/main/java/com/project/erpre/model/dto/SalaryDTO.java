package com.project.erpre.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SalaryDTO {

    private Integer salaryId;
    private EmployeeDTO employee;
    private DepartmentDTO department;
    private JobDTO job;
    private Integer baseSalary;
    private BigDecimal performanceIncentiveRate;
    private BigDecimal gradeIncentiveRate;
    private Integer bonus;
    private Integer totalPayment;
    private LocalDateTime deleteDate;
}
