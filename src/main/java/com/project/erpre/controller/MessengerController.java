package com.project.erpre.controller;

import com.project.erpre.model.dto.ChatDTO;
import com.project.erpre.model.dto.ChatMessageDTO;
import com.project.erpre.model.dto.EmployeeDTO;
import com.project.erpre.service.EmployeeService;
import com.project.erpre.service.MessengerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messengers")
public class MessengerController {

    private static final Logger logger = LoggerFactory.getLogger(MessengerController.class);

    private final MessengerService messengerService;
    private final EmployeeService employeeService;

    @Autowired
    public MessengerController(MessengerService messengerService, EmployeeService employeeService) {
        this.messengerService = messengerService;
        this.employeeService = employeeService;
    }

    // 1. 메신저 직원 조회 API (조직도)
    @GetMapping("/employeeList")
    public List<EmployeeDTO> getEmployeesWithDept() {
        return employeeService.getEmployeesWithDept();
    }

    // 2. 현재 참여하고 있는 채팅 목록 조회 및 검색 API
    @GetMapping("/chatList")
    public List<ChatDTO> getChatListByUser(String searchKeyword) {
        return messengerService.getChatListByUser(searchKeyword);
    }

    // 3. 특정 채팅방 상세 조회 API (새 창)
    @GetMapping("/chat/{chatNo}")
    public List<ChatMessageDTO> getChatDetails(@PathVariable Long chatNo, String searchKeyword) {
        return messengerService.getSelectedChat(chatNo, searchKeyword);
    }


}
