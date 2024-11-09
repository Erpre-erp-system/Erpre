package com.project.erpre.model.dto;

import com.project.erpre.model.entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeDTO {

    private String employeeId;
    private String employeePw;
    private String employeeName;
    private String employeeEmail;
    private String employeeTel;
    private String employeeImageUrl;

    private Integer jobId;
    private String jobRole;
    private Integer departmentId;

    private String jobName;  // 직급 이름 (읽기용)
    private String departmentName;  // 부서 이름 (읽기용)

    private Timestamp employeeInsertDate;
    private Timestamp employeeUpdateDate;
    private String employeeDeleteYn; // 삭제 여부 기본값 'N'
    private Timestamp employeeDeleteDate; // 삭제 일시
    private String employeeStatus;
    private Timestamp employeeStatusUpdateTime;
    private String employeeStatusMessage;


    // 유저 정보 조회 생성자
    public EmployeeDTO(Employee employee) {
        this.employeeId = employee.getEmployeeId();
        this.employeeName = employee.getEmployeeName();
        this.employeeInsertDate = employee.getEmployeeInsertDate();
        this.jobName = employee.getJob().getJobName();
        this.departmentName = employee.getDepartment().getDepartmentName();
        this.employeeStatus = employee.getEmployeeStatus();
        this.employeeStatusUpdateTime = employee.getEmployeeStatusUpdateTime();
        this.employeeStatusMessage = employee.getEmployeeStatusMessage();
        this.employeeTel = employee.getEmployeeTel();
        this.employeeEmail = employee.getEmployeeEmail();
        this.employeeImageUrl = employee.getEmployeeImageUrl();
    }
}