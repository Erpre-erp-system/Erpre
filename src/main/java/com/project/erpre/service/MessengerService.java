package com.project.erpre.service;

import com.project.erpre.model.dto.ChatDTO;
import com.project.erpre.model.dto.ChatMessageDTO;
import com.project.erpre.model.dto.EmployeeDTO;
import com.project.erpre.model.entity.Chat;
import com.project.erpre.model.entity.ChatParticipant;
import com.project.erpre.repository.ChatParticipantRepository;
import com.project.erpre.repository.ChatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.project.erpre.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessengerService {

    private static final Logger logger = LoggerFactory.getLogger(MessengerService.class);

    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;

    @Autowired
    public MessengerService(ChatRepository chatRepository, ChatParticipantRepository chatParticipantRepository) {
        this.chatRepository = chatRepository;
        this.chatParticipantRepository = chatParticipantRepository;
    }


    // 2. 선택된 채팅방 조회
    public List<ChatMessageDTO> getSelectedChat(Long chatNo, String searchKeyword) {
        String employeeId = getEmployeeIdFromAuthentication();
        return chatRepository.getSelectedChat(chatNo, searchKeyword);
    }


    /////////////////////////////////////////////////////////////////////// 🟢 공통

    // 사용자 인증
    private String getEmployeeIdFromAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("인증된 사용자를 찾을 수 없습니다. 로그인이 필요합니다.");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getUsername();
        } else {
            return principal.toString();
        }
    }

    /////////////////////////////////////////////////////////////////////// 🔴 채팅


    // 현재 참여하고 있는 채팅 목록 조회 및 검색
    public List<ChatDTO> getChatListByUser(String searchKeyword){
        String employeeId = getEmployeeIdFromAuthentication();
        return chatRepository.getChatListByUser(employeeId, searchKeyword);
    }

//    // 새 채팅방 생성
//    @Transactional
//    public ChatDTO createChatRoom(List<String> participantIds) {
//        Chat chat = new Chat();
//        chatRepository.save(chat);
//        for (String participantId : participantIds) {
//            ChatParticipant chatParticipant = new ChatParticipant(chat.getChatNo(), participantId);
//            chatParticipantRepository.save(chatParticipant);
//        }
//        return new ChatDTO(chat);
//    }

}
