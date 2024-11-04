package com.project.erpre.service;

import com.project.erpre.model.entity.Attendance;
import com.project.erpre.model.entity.Employee;
import com.project.erpre.repository.AttendanceRepository;
import com.project.erpre.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    // 전체 근태 데이터 조회 (페이지네이션 지원)
    public Page<Attendance> getAllAttendances(LocalDate date, Pageable pageable) {
        if (date != null) {
            LocalDateTime startDateTime = date.atStartOfDay();
            LocalDateTime endDateTime = date.atTime(LocalTime.MAX);
            return attendanceRepository.findByAttendanceInsertDateBetween(startDateTime, endDateTime, pageable);
        } else {
            return attendanceRepository.findAll(pageable);
        }
    }

    // 정상 근태 데이터 조회 (삭제되지 않은 데이터만)
    public Page<Attendance> getActiveAttendances(LocalDate date, Pageable pageable) {
        if (date != null) {
            LocalDateTime startDateTime = date.atStartOfDay();
            LocalDateTime endDateTime = date.atTime(LocalTime.MAX);
            return attendanceRepository.findByAttendanceDeleteDateIsNullAndAttendanceInsertDateBetween(startDateTime, endDateTime, pageable);
        } else {
            return attendanceRepository.findByAttendanceDeleteDateIsNull(pageable);
        }
    }

    // 삭제된 근태 데이터 조회 메서드
    public Page<Attendance> getDeletedAttendances(LocalDate date, Pageable pageable) {
        if (date != null) {
            LocalDateTime startDateTime = date.atStartOfDay();
            LocalDateTime endDateTime = date.atTime(LocalTime.MAX);
            return attendanceRepository.findByAttendanceDeleteYnAndAttendanceInsertDateBetween("Y", startDateTime, endDateTime, pageable);
        } else {
            return attendanceRepository.findByAttendanceDeleteYn("Y", pageable);
        }
    }

    // 이름 및 날짜별 검색 필터 (페이지네이션 지원)
    public Page<Attendance> searchAttendances(String employeeName, LocalDate attendanceDate, Pageable pageable) {
        if (employeeName != null && attendanceDate != null) {
            return attendanceRepository.findByEmployee_EmployeeNameContainingIgnoreCaseAndAttendanceDate(employeeName, attendanceDate, pageable);
        } else if (employeeName != null) {
            return attendanceRepository.findByEmployee_EmployeeNameContainingIgnoreCase(employeeName, pageable);
        } else if (attendanceDate != null) {
            return attendanceRepository.findByAttendanceDate(attendanceDate, pageable);
        } else {
            return attendanceRepository.findAll(pageable);
        }
    }

    //논리적삭제
    public void deleteLogicalAttendances(List<Integer> ids) {
        // 1. 모든 ID에 해당하는 Attendance 엔티티를 한 번에 조회
        List<Attendance> attendances = attendanceRepository.findAllById(ids);

        // 2. 조회된 각 Attendance 엔티티의 논리적 삭제 필드를 설정
        for (Attendance attendance : attendances) {
            attendance.setAttendanceDeleteYn("Y");
            attendance.setAttendanceDeleteDate(new Timestamp(System.currentTimeMillis())); // 삭제 일자 설정
        }

        // 3. 변경된 Attendance 엔티티들을 한 번에 저장
        attendanceRepository.saveAll(attendances);
    }

    // 출근 시간 기록
    @Transactional
    public void recordCheckIn(Employee employee) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> existingAttendanceOpt = attendanceRepository.findByEmployeeAndAttendanceDate(employee, today);

        if (existingAttendanceOpt.isEmpty()) {
            // 출근 기록이 없으므로 새로운 출근 기록 생성
            Attendance attendance = new Attendance();
            attendance.setEmployee(employee);
            attendance.setAttendanceDate(today);
            LocalDateTime checkInTime = LocalDateTime.now();
            attendance.setCheckInTime(checkInTime);

            // 출근 시간 비교를 위한 기준 시간 (09:00)
            LocalTime nineAM = LocalTime.of(9, 0);
            if (!checkInTime.toLocalTime().isAfter(nineAM)) {
                attendance.setAttendanceStatus("출근");
            } else {
                attendance.setAttendanceStatus("지각");
            }

            attendance.setTotalHoursWorked(BigDecimal.ZERO);
            attendance.setOvertimeHours(BigDecimal.ZERO);
            attendance.setAttendanceDeleteYn("N");
            attendanceRepository.save(attendance);
        } else {
            // 이미 출근 기록이 있으므로 무시
            System.out.println("이미 오늘 출근 기록이 있습니다: " + employee.getEmployeeId());
        }
    }

    @Transactional
    public void recordCheckOut(Employee employee) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> existingAttendanceOpt = attendanceRepository.findByEmployeeAndAttendanceDate(employee, today);

        if (existingAttendanceOpt.isPresent()) {
            Attendance attendance = existingAttendanceOpt.get();

            if (attendance.getCheckOutTime() != null) {
                // 이미 퇴근 기록이 있으므로 무시
                System.out.println("이미 오늘 퇴근 기록이 있습니다: " + employee.getEmployeeId());
                return;
            }

            LocalDateTime checkOutTime = LocalDateTime.now();
            attendance.setCheckOutTime(checkOutTime);
            attendance.setAttendanceUpdateDate(LocalDateTime.now());

            LocalTime nineAM = LocalTime.of(9, 0);
            LocalTime sixPM = LocalTime.of(18, 0);

            LocalDateTime checkInTime = attendance.getCheckInTime();
            LocalTime checkInLocalTime = checkInTime.toLocalTime();
            LocalTime checkOutLocalTime = checkOutTime.toLocalTime();

            // 총 근무 시간 계산 (점심시간 1시간 제외)
            long minutesWorked = java.time.Duration.between(checkInTime, checkOutTime).toMinutes();
            BigDecimal hoursWorked = BigDecimal.valueOf(minutesWorked).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

            // 점심시간 1시간 제외 (근무 시간이 4시간 이상인 경우)
            if (hoursWorked.compareTo(BigDecimal.valueOf(4)) >= 0) {
                hoursWorked = hoursWorked.subtract(BigDecimal.ONE);
            }

            attendance.setTotalHoursWorked(hoursWorked.max(BigDecimal.ZERO));

            // 초과 근무 시간 계산 (표준 근무 시간 8시간)
            BigDecimal standardHours = BigDecimal.valueOf(8);
            if (hoursWorked.compareTo(standardHours) > 0) {
                attendance.setOvertimeHours(hoursWorked.subtract(standardHours));
            } else {
                attendance.setOvertimeHours(BigDecimal.ZERO);
            }

            // 근무 상태 결정
            String attendanceStatus = determineAttendanceStatus(checkInLocalTime, checkOutLocalTime, nineAM, sixPM);
            attendance.setAttendanceStatus(attendanceStatus);

            attendanceRepository.save(attendance);
        } else {
            // 출근 기록이 없으므로 퇴근 기록을 생성하지 않음
            System.out.println("출근 기록이 없습니다: " + employee.getEmployeeId());
        }
    }

    // 근무 상태 결정 로직
    private String determineAttendanceStatus(LocalTime checkInTime, LocalTime checkOutTime, LocalTime nineAM, LocalTime sixPM) {
        boolean isLate = checkInTime.isAfter(nineAM);
        boolean isEarlyLeave = checkOutTime.isBefore(sixPM);

        if (isLate && !isEarlyLeave) {
            return "지각";
        } else if (!isLate && isEarlyLeave) {
            return "조퇴";
        } else if (isLate && isEarlyLeave) {
            return "지각 및 조퇴";
        } else if (!isLate && !isEarlyLeave) {
            return "정상근무";
        } else {
            return "근무상태 확인 필요";
        }
    }

    // 결근 및 미퇴근 처리 스케줄러
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정에 실행
    public void handleAbsentAndMissingCheckOut() {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        // 모든 직원 목록 조회
        List<Employee> allEmployees = employeeRepository.findAll();

        for (Employee employee : allEmployees) {
            Optional<Attendance> existingAttendanceOpt = attendanceRepository.findByEmployeeAndAttendanceDate(employee, yesterday);

            if (existingAttendanceOpt.isEmpty()) {
                // 어제 출근 기록이 없는 경우 결근 처리
                Attendance attendance = new Attendance();
                attendance.setEmployee(employee);
                attendance.setAttendanceDate(yesterday);
                attendance.setAttendanceStatus("결근");
                attendance.setTotalHoursWorked(BigDecimal.ZERO);
                attendance.setOvertimeHours(BigDecimal.ZERO);
                attendance.setAttendanceDeleteYn("N");
                attendance.setAttendanceInsertDate(LocalDateTime.now());
                attendanceRepository.save(attendance);
            } else {
                Attendance attendance = existingAttendanceOpt.get();

                if (attendance.getCheckOutTime() == null) {
                    // 퇴근 기록이 없으면 퇴근 시간을 18:00으로 설정
                    LocalDateTime defaultCheckOutTime = attendance.getAttendanceDate().atTime(18, 0);
                    attendance.setCheckOutTime(defaultCheckOutTime);
                    attendance.setAttendanceUpdateDate(LocalDateTime.now());

                    // 총 근무 시간 및 근무 상태 재계산
                    updateAttendanceForMissingCheckOut(attendance);
                    attendanceRepository.save(attendance);
                }
            }
        }
    }

    // 미처리된 퇴근 기록에 대한 근무 시간 및 상태 업데이트
    private void updateAttendanceForMissingCheckOut(Attendance attendance) {
        LocalDateTime checkInTime = attendance.getCheckInTime();
        LocalDateTime checkOutTime = attendance.getCheckOutTime();

        LocalTime nineAM = LocalTime.of(9, 0);
        LocalTime sixPM = LocalTime.of(18, 0);

        LocalTime checkInLocalTime = checkInTime.toLocalTime();
        LocalTime checkOutLocalTime = checkOutTime.toLocalTime();

        // 총 근무 시간 계산 (점심시간 1시간 제외)
        long minutesWorked = java.time.Duration.between(checkInTime, checkOutTime).toMinutes();
        BigDecimal hoursWorked = BigDecimal.valueOf(minutesWorked).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        // 점심시간 1시간 제외 (근무 시간이 4시간 이상인 경우)
        if (hoursWorked.compareTo(BigDecimal.valueOf(4)) >= 0) {
            hoursWorked = hoursWorked.subtract(BigDecimal.ONE);
        }

        attendance.setTotalHoursWorked(hoursWorked.max(BigDecimal.ZERO));

        // 초과 근무 시간 계산
        BigDecimal standardHours = BigDecimal.valueOf(8);
        if (hoursWorked.compareTo(standardHours) > 0) {
            attendance.setOvertimeHours(hoursWorked.subtract(standardHours));
        } else {
            attendance.setOvertimeHours(BigDecimal.ZERO);
        }

        // 근무 상태 결정
        String attendanceStatus = determineAttendanceStatus(checkInLocalTime, checkOutLocalTime, nineAM, sixPM);
        attendance.setAttendanceStatus(attendanceStatus);
    }
}
