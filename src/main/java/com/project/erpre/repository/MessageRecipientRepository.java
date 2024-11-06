package com.project.erpre.repository;

import com.project.erpre.model.entity.MessageRecipient;
import com.project.erpre.model.entity.MessageRecipientId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRecipientRepository extends JpaRepository<MessageRecipient, MessageRecipientId> {
}
