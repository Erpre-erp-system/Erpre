package com.project.erpre.repository;

import com.project.erpre.model.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository <ChatMessage, Long> {

    // chatNo에 해당하는 모든 ChatMessage 조회
    List<ChatMessage> findAllByChat_ChatNo(Long chatNo);

    void deleteByChat_ChatNo(Long chatNo);

    boolean existsByChat_ChatNo(Long chatNo);
}
