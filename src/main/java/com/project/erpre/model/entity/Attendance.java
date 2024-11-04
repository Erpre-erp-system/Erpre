package com.project.erpre.model.entity;

import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "m_attendance", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"employee_id", "attendance_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString

public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id")
    private Integer attendanceId;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)  // 직원 외래키
    private Employee employee;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "total_hours_worked", precision = 5, scale = 2, nullable = false, columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private BigDecimal totalHoursWorked = BigDecimal.ZERO;

    @Column(name = "overtime_hours", precision = 5, scale = 2, nullable = false, columnDefinition = "DECIMAL(5,2) DEFAULT 0.00")
    private BigDecimal overtimeHours = BigDecimal.ZERO;

    @Column(name = "attendance_status", length = 20, nullable = false)
    private String attendanceStatus;

    @Column(name = "approval_status", length = 20, nullable = false, columnDefinition = "VARCHAR(20) DEFAULT '결재중'")
    private String approvalStatus = "결재중";

    @ManyToOne
    @JoinColumn(name = "approver_id")  // 승인자 외래키
    private Employee approver;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "reason")
    private String reason;

    @Column(name = "attendance_insert_date", nullable = false, updatable = false)
    private LocalDateTime attendanceInsertDate;

    @Column(name = "attendance_update_date")
    private LocalDateTime attendanceUpdateDate;

    @Column(name = "attendance_delete_yn", length = 20, nullable = false, columnDefinition = "VARCHAR(1) DEFAULT 'N'")
    private String attendanceDeleteYn = "N"; // 삭제 여부 기본값 'N'

    @Column(name = "attendance_delete_date")
    private Timestamp attendanceDeleteDate;

    @PrePersist
    public void prePersist() {
        this.attendanceInsertDate = LocalDateTime.now();
        if (this.attendanceDeleteYn == null) {
            this.attendanceDeleteYn = "N";
        }
        if (this.totalHoursWorked == null) {
            this.totalHoursWorked = BigDecimal.ZERO;
        }
        if (this.overtimeHours == null) {
            this.overtimeHours = BigDecimal.ZERO;
        }
    }
}
