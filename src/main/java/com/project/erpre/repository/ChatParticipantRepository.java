package com.project.erpre.repository;

import com.project.erpre.model.entity.Chat;
import com.project.erpre.model.entity.ChatParticipant;
import com.project.erpre.model.entity.ChatParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, ChatParticipantId> {

    // 현재 해당 채팅방에 남아있는 참여자들 카운팅
    long countByChatParticipantId_ChatNo(Long chatNo);


}
