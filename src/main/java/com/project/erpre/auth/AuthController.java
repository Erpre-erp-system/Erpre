package com.project.erpre.auth;

import com.project.erpre.model.entity.Employee;
import com.project.erpre.repository.EmployeeRepository;
import com.project.erpre.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Controller
public class AuthController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AttendanceService attendanceService; // 근태쓰려구 주입

    @PostMapping("/api/login")
    @ResponseBody
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpSession session, HttpServletResponse response) {
        try {
            System.out.println("로그인 시도 ID:" + loginRequest.getEmployeeId());

            // 로그인 요청 처리
            Employee employee = employeeRepository.findByEmployeeId(loginRequest.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("해당 ID를 찾을 수 없습니다"));

            // 비밀번호 평문 비교
            if (!loginRequest.getEmployeePw().equals(employee.getEmployeePw())) {
                System.out.println("비밀번호가 일치하지 않습니다: " + loginRequest.getEmployeeId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("message", "비밀번호가 일치하지 않습니다."));
            }

            // Spring Security 인증 처리
            String role = employee.getJob().getJobRole();
            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }

            // Spring Security 인증 처리
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    employee.getEmployeeId(), loginRequest.getEmployeePw(),
                    Collections.singleton(new SimpleGrantedAuthority(employee.getJob().getJobRole()))); // 수정된 부분

            Authentication authentication = authenticationManager.authenticate(authenticationToken);
            SecurityContextHolder.getContext().setAuthentication(authentication); // SecurityContext에 인증 정보 설정

            // 로그인 성공 시 세션에 사용자 정보 저장
            session.setAttribute("employeeId", employee.getEmployeeId());
            session.setAttribute("employee", employee);

            // 로그인 성공 시 출근 기록 추가
            attendanceService.recordCheckIn(employee); // 출근 시간 기록

            // HTTP-only 쿠키 설정 (세션 ID를 쿠키에 설정)
            Cookie sessionCookie = new Cookie("SESSION", session.getId());
            sessionCookie.setHttpOnly(true); // JavaScript에서 쿠키에 접근하지 못하도록 설정
            sessionCookie.setSecure(false); // HTTPS에서만 사용 (개발 중에는 false로 설정)
            sessionCookie.setPath("/"); // 쿠키 유효 경로 설정
            sessionCookie.setMaxAge(60 * 60 * 24); // 쿠키 만료 시간 설정 (1일)

            // 응답에 쿠키 추가
            response.addCookie(sessionCookie);

            // 로그인 성공
            System.out.println("로그인 성공: " + loginRequest.getEmployeeId());

            // 로그인 성공시 응답으로 메시지와 권한 정보를 함께 반환
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("message", "로그인 성공");
            responseMap.put("role", role);

            return ResponseEntity.ok(responseMap);
        } catch (RuntimeException e) {
            // 특정 예외 처리
            System.out.println("런타임 예외 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        } catch (Exception e) {
            // 일반 예외 처리
            System.out.println("예외 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "로그인 처리 중 오류가 발생했습니다."));
        }
    }

    @PostMapping("/api/logout")
    @ResponseBody
    public ResponseEntity<?> logout(HttpSession session) {
        try {
            String employeeId = (String) session.getAttribute("employeeId");

            if (employeeId != null) {
                Employee employee = employeeRepository.findByEmployeeId(employeeId)
                        .orElseThrow(() -> new RuntimeException("해당 ID를 찾을 수 없습니다"));

                attendanceService.recordCheckOut(employee);
            }

            session.invalidate();
            return ResponseEntity.ok(Collections.singletonMap("message", "로그아웃 성공"));
        } catch (Exception e) {
            session.invalidate(); // 세션 무효화
            System.err.println("로그아웃 중 예외 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "로그아웃 처리 중 오류가 발생했습니다."));
        }
    }
}
