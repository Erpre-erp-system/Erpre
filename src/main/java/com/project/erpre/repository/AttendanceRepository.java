package com.project.erpre.repository;

import com.project.erpre.model.entity.Attendance;
import com.project.erpre.model.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    // 이름으로 검색 (페이지네이션 지원)
    Page<Attendance> findByEmployee_EmployeeNameContainingIgnoreCase(String employeeName, Pageable pageable);

    // 날짜로 검색 (페이지네이션 지원)
    Page<Attendance> findByAttendanceDate(LocalDate attendanceDate, Pageable pageable);

    // 이름과 날짜로 검색 (페이지네이션 지원)
    Page<Attendance> findByEmployee_EmployeeNameContainingIgnoreCaseAndAttendanceDate(String employeeName, LocalDate attendanceDate, Pageable pageable);

    // 전체 근태 데이터 조회 (날짜로 필터링)
    Page<Attendance> findByAttendanceInsertDateBetween(LocalDateTime startDateTime, LocalDateTime endDateTime, Pageable pageable);

    // 정상 근태 조회 (삭제되지 않은 데이터만, 날짜로 필터링)
    Page<Attendance> findByAttendanceDeleteDateIsNullAndAttendanceInsertDateBetween(LocalDateTime startDateTime, LocalDateTime endDateTime, Pageable pageable);

    // 삭제된 근태 조회 (삭제된 데이터만, 날짜로 필터링)
    Page<Attendance> findByAttendanceDeleteYnAndAttendanceInsertDateBetween(String attendanceDeleteYn, LocalDateTime startDateTime, LocalDateTime endDateTime, Pageable pageable);

    // 삭제되지 않은 모든 근태 데이터 조회
    Page<Attendance> findByAttendanceDeleteDateIsNull(Pageable pageable);

    // 삭제된 모든 근태 데이터 조회
    Page<Attendance> findByAttendanceDeleteYn(String attendanceDeleteYn, Pageable pageable);

    // 당일 출근 기록 중 체크아웃 시간이 없는 기록 조회
    @Query("SELECT a FROM Attendance a WHERE a.employee.employeeId = :employeeId AND a.attendanceDate = :date AND a.checkOutTime IS NULL")
    Optional<Attendance> findTodayAttendanceByEmployeeId(@Param("employeeId") String employeeId,
                                                         @Param("date") LocalDate date);

    //출근한 직원 조회
    Optional<Attendance> findByEmployeeAndAttendanceDate(Employee employee, LocalDate attendanceDate);
}
