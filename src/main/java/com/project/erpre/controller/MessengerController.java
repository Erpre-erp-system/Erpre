package com.project.erpre.controller;

import com.project.erpre.model.dto.ChatDTO;
import com.project.erpre.model.dto.ChatMessageDTO;
import com.project.erpre.model.dto.ChatParticipantDTO;
import com.project.erpre.model.dto.EmployeeDTO;
import com.project.erpre.model.entity.ChatParticipant;
import com.project.erpre.service.EmployeeService;
import com.project.erpre.service.MessengerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

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

    /////////////////////////////////////////////////////////////////////// 🟢 공통

    // 1. 메신저 직원 조회 API (조직도)
    @GetMapping("/employeeList")
    public ResponseEntity<Page<EmployeeDTO>> getEmployeesWithDept(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String searchKeyword
    ) {
        try {
            Page<EmployeeDTO> result = employeeService.getEmployeesWithDept(page - 1, size, searchKeyword);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    // 특정 채팅방 상세 조회 API (새 창)
    @GetMapping("/chat/{chatNo}")
    public List<ChatMessageDTO> getChatDetails(@PathVariable Long chatNo, String searchKeyword) {
        return messengerService.getSelectedChat(chatNo, searchKeyword);
    }


    /////////////////////////////////////////////////////////////////////// 🔴 채팅

    // 현재 참여하고 있는 채팅 목록 조회 및 검색 API
    @GetMapping("/chat/chatList")
    public List<ChatDTO> getChatListByUser(@RequestParam(required = false) String searchKeyword) {
        return messengerService.getChatListByUser(searchKeyword);
    }

    // 새 채팅방 생성
    @PostMapping("/chat/create")
    public ResponseEntity<ChatDTO> createChatRoom(@RequestBody List<String> participantIds) {
        ChatDTO newChatRoom = messengerService.createChatRoom(participantIds);
        return ResponseEntity.ok(newChatRoom);
    }

    // 채팅방 이름 변경
    @PutMapping("/chat/update/title")
    public ResponseEntity<Void> updateChatTitle(@RequestBody ChatParticipantDTO.ChatTitleUpdateDTO chatTitleUpdateDTO) {
        Long chatNo = chatTitleUpdateDTO.getChatNo();
        String newTitle = chatTitleUpdateDTO.getChatTitle();

        messengerService.updateChatTitle(chatNo, newTitle);
        return ResponseEntity.ok().build();
    }

    // 채팅방 나가기
    @DeleteMapping("/chat/delete/{chatNo}")
    public ResponseEntity<String> leaveChatRoom(@PathVariable Long chatNo) {
        try {
            messengerService.leaveChatRoom(chatNo);
            return ResponseEntity.ok("채팅방에서 성공적으로 나갔습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("채팅방 나가기 실패: " + e.getMessage());
        }
    }


}
