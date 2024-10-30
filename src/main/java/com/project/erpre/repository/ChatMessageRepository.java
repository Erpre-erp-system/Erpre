package com.project.erpre.repository;

import com.project.erpre.model.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository <ChatMessage, Long> {


}
