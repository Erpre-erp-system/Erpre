package com.project.erpre.repository;

import com.project.erpre.model.entity.Chat;
import com.project.erpre.model.entity.ChatParticipant;
import com.project.erpre.model.entity.ChatParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, ChatParticipantId> {

    // 현재 해당 채팅방에 남아있는 참여자들 카운팅
    @Query("SELECT COUNT(cp) FROM ChatParticipant cp WHERE cp.chatParticipantId.chatNo = :chatNo")
    long countParticipants(@Param("chatNo") Long chatNo);

    // 해당 채팅방에 참여중인 참여자 목록
    List<ChatParticipant> findByChat(Chat chat);
}
