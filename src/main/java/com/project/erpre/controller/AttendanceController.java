package com.project.erpre.controller;

import com.project.erpre.model.entity.Attendance;
import com.project.erpre.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // 1. 전체 근태 데이터 조회 (페이지네이션 지원)
    @GetMapping("/allAttendances")
    public ResponseEntity<Page<Attendance>> getAllAttendances(
            @RequestParam(required = false) String date,
            Pageable pageable) {
        LocalDate queryDate = date != null ? LocalDate.parse(date) : null;
        Page<Attendance> attendanceList = attendanceService.getAllAttendances(queryDate, pageable);
        return ResponseEntity.ok(attendanceList);
    }

    // 2. 정상 근태 데이터 조회 (삭제되지 않은 데이터만 조회)
    @GetMapping("/activeAttendances")
    public ResponseEntity<Page<Attendance>> getActiveAttendances(
            @RequestParam(required = false) String date,
            Pageable pageable) {
        LocalDate queryDate = date != null ? LocalDate.parse(date) : null;
        Page<Attendance> activeAttendances = attendanceService.getActiveAttendances(queryDate, pageable);
        return ResponseEntity.ok(activeAttendances);
    }

    // 3. 삭제된 근태 데이터 조회
    @GetMapping("/deletedAttendances")
    public ResponseEntity<Page<Attendance>> getDeletedAttendances(
            @RequestParam(required = false) String date,
            Pageable pageable) {
        LocalDate queryDate = date != null ? LocalDate.parse(date) : null;
        Page<Attendance> deletedAttendances = attendanceService.getDeletedAttendances(queryDate, pageable);
        return ResponseEntity.ok(deletedAttendances);
    }

    // 4. 이름 및 날짜별 검색
    @GetMapping("/search")
    public ResponseEntity<Page<Attendance>> searchAttendances(
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) String attendanceDate,
            Pageable pageable) {
        LocalDate date = attendanceDate != null ? LocalDate.parse(attendanceDate) : null;
        Page<Attendance> filteredAttendances = attendanceService.searchAttendances(employeeName, date, pageable);
        return ResponseEntity.ok(filteredAttendances);
    }

    // 5. 선택된 근태 기록 삭제
    @PutMapping("/deleteAttendances")
    public ResponseEntity<Void> deleteSelectedAttendances(@RequestBody List<Integer> attendanceIds) {
        attendanceService.deleteLogicalAttendances(attendanceIds);
        return ResponseEntity.noContent().build();
    }
}
