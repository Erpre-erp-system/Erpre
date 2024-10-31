package com.project.erpre.repository;

import com.project.erpre.model.dto.MessageDTO;
import com.project.erpre.model.entity.QMessage;
import com.project.erpre.model.entity.QMessageFile;
import com.project.erpre.model.entity.QMessageRecipient;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;

import javax.persistence.EntityManager;
import java.util.List;

public class MessageRepositoryImpl implements MessageRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public MessageRepositoryImpl(EntityManager entityManager) {
        this.queryFactory = new JPAQueryFactory(entityManager);
    }


    // 1. 상태에 따른 쪽지 목록 조회 및 검색 (sent, new, received, bookmarked)
    @Override
    public List<MessageDTO> getMessageListByUser(String employeeId, String searchKeyword, String status) {
        QMessage message = QMessage.message;
        QMessageRecipient messageRecipient = QMessageRecipient.messageRecipient;
        QMessageFile messageFile = QMessageFile.messageFile;

        BooleanBuilder condition = new BooleanBuilder();

        // 상태에 따른 조건 추가
        switch (status) {
            case "sent":
                condition.and(message.employee.employeeId.eq(employeeId)).and(message.messageDeleteYn.eq("N"));
                break;
            case "received":
                condition.and(messageRecipient.messageRecipientId.recipientId.eq(employeeId)).and(messageRecipient.recipientDeleteYn.eq("N"));
                break;
            case "new":
                condition.and(messageRecipient.messageRecipientId.recipientId.eq(employeeId)).and(messageRecipient.recipientReadYn.eq("N")).and(messageRecipient.recipientDeleteYn.eq("N"));
                break;
            case "bookmarked":
                condition.and(messageRecipient.bookmarkedYn.eq("Y"));
                break;
        }

        // 검색 키워드가 있을 경우 추가
        if (searchKeyword != null && !searchKeyword.isEmpty()) {
            condition.and(message.messageContent.contains(searchKeyword).or(message.employee.employeeName.contains(searchKeyword)));
        }

        return queryFactory.select(Projections.constructor(MessageDTO.class, message.messageNo, message.employee.employeeId, message.employee.employeeName, message.messageContent, message.messageSendDate, message.messageDeleteYn, message.messageRecallYn, messageRecipient.messageRecipientId.recipientId, messageRecipient.recipientReadYn, messageRecipient.recipientReadDate, messageRecipient.recipientDeleteYn, messageRecipient.bookmarkedYn, messageFile.messageAttachmentId)).from(message).leftJoin(messageRecipient).on(message.messageNo.eq(messageRecipient.messageRecipientId.messageNo)).leftJoin(messageFile).on(message.messageNo.eq(messageFile.message.messageNo)).where(condition).orderBy(message.messageSendDate.desc()).fetch();
    }

}
