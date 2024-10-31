package com.project.erpre.repository;

import com.project.erpre.model.entity.ChatMessageRead;
import com.project.erpre.model.entity.ChatMessageReadId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ChatMessageReadRepository extends JpaRepository<ChatMessageRead, ChatMessageReadId> {

    List<ChatMessageRead> findAllByChatMessageReadId_ChatMessageNo(Long chatNo);

    void deleteByChatMessageReadId_ChatMessageNo(Long chatNo);

    boolean existsByChatMessageReadId_ChatMessageNo(Long chatNo);
}
