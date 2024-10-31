package com.project.erpre.repository;

import com.project.erpre.model.entity.ChatFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ChatFileRepository extends JpaRepository<ChatFile, Long> {

    List<ChatFile> findAllByChatMessage_ChatMessageNo(Long chatNo);

    void deleteByChatMessage_ChatMessageNo(Long chatNo);

    boolean existsByChatMessage_ChatMessageNo(Long chatNo);
}
