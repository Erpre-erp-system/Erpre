package com.project.erpre.controller;

import com.project.erpre.model.dto.*;
import com.project.erpre.model.entity.ChatParticipant;
import com.project.erpre.service.EmployeeService;
import com.project.erpre.service.MessengerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

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


    // 메신저 직원 검색 API (쪽지, 채팅) -> 조직도에서 안 쓸거면 데이터, 내용 정리하기 / 조직도에서는 페이지네이션 안 씀
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


    /////////////////////////////////////////////////////////////////////// 🟠 쪽지


    // 상태에 따른 쪽지 목록 조회 및 검색 API
    @GetMapping("/note/list")
    public ResponseEntity<List<MessageDTO>> getNoteList(
            @RequestParam(required = false) String searchKeyword,
            @RequestParam String status
    ) {
        try {
            List<MessageDTO> notes = messengerService.getMessageListByUser(searchKeyword, status);
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            logger.error("쪽지 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 쪽지 전송(SSE를 이용한 실시간 알림 구독)
    @GetMapping(value = "/note/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter();

        try {
            // SseEmitter에 초기 연결 이벤트를 전송
            emitter.send(SseEmitter.event().name("INIT"));

            // 서비스 계층에서 쪽지 전송 로직을 통해 알림 발생 시 emitter를 사용하여 전송
            // emitter.send(SseEmitter.event().name("NEW_NOTE").data(newNoteData));

            // 예외 처리 및 타임아웃 설정
            emitter.onCompletion(() -> logger.info("SSE 연결 완료"));
            emitter.onTimeout(() -> logger.info("SSE 연결 타임아웃"));
        } catch (Exception e) {
            logger.error("SSE 구독 중 오류 발생", e);
        }

        return emitter;
    }


    /////////////////////////////////////////////////////////////////////// 🔴 채팅


    // 현재 참여하고 있는 채팅 목록 조회 및 검색 API
    @GetMapping("/chat/chatList")
    public List<ChatDTO> getChatListByUser(@RequestParam(required = false) String searchKeyword) {
        return messengerService.getChatListByUser(searchKeyword);
    }

    //  개별 채팅방 조회 API
    @GetMapping("/chat/{chatNo}")
    public ResponseEntity<Map<String, Object>> getSelectedChat(@PathVariable Long chatNo,
                                                               @RequestParam(required = false) String searchKeyword) {
        Map<String, Object> response = messengerService.getSelectedChat(chatNo, searchKeyword);
        return ResponseEntity.ok(response);
    }

    // 새 채팅방 생성 API
    @PostMapping("/chat/create")
    public ResponseEntity<ChatDTO> createChatRoom(@RequestBody List<String> participantIds) {
        ChatDTO newChatRoom = messengerService.createChatRoom(participantIds);
        return ResponseEntity.ok(newChatRoom);
    }

    // 채팅방 이름 변경 API
    @PutMapping("/chat/update/title")
    public ResponseEntity<Void> updateChatTitle(@RequestBody ChatParticipantDTO.ChatTitleUpdateDTO chatTitleUpdateDTO) {
        Long chatNo = chatTitleUpdateDTO.getChatNo();
        String newTitle = chatTitleUpdateDTO.getChatTitle();

        messengerService.updateChatTitle(chatNo, newTitle);
        return ResponseEntity.ok().build();
    }

    // 채팅방 나가기 API
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
