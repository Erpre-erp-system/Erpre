package com.project.erpre.repository;

import com.project.erpre.model.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long>, ChatRepositoryCustom, QuerydslPredicateExecutor<Chat> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Chat c WHERE c.chatNo = :chatNo")
    void deleteChatByChatNo(@Param("chatNo") Long chatNo);

}
