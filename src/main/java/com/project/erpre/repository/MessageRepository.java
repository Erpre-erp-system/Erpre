package com.project.erpre.repository;

import com.project.erpre.model.entity.Chat;
import com.project.erpre.model.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long>, MessageRepositoryCustom, QuerydslPredicateExecutor<Message> {


}
