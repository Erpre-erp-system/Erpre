package com.project.erpre.repository;

import com.project.erpre.model.dto.MessageDTO;
import com.project.erpre.model.entity.QMessage;
import com.project.erpre.model.entity.QMessageFile;
import com.project.erpre.model.entity.QMessageRecipient;
import com.querydsl.core.BooleanBuilder;
import java.util.List;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;

import javax.persistence.EntityManager;
import java.time.LocalDateTime;

public class MessageRepositoryImpl implements MessageRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public MessageRepositoryImpl(EntityManager entityManager) {
        this.queryFactory = new JPAQueryFactory(entityManager);
    }


    // 1. 상태에 따른 쪽지 목록 조회 및 검색 (sent, new, received, bookmarked)
    @Override
    public List<MessageDTO> getNoteListByUser(String employeeId, String searchKeyword, String noteStatus) {
        QMessage message = QMessage.message;
        QMessageRecipient messageRecipient = QMessageRecipient.messageRecipient;
        QMessageFile messageFile = QMessageFile.messageFile;

        BooleanBuilder condition = new BooleanBuilder();

        switch (noteStatus) {
            case "sent": // 보낸 쪽지
                condition.and(message.employee.employeeId.eq(employeeId))
                        .and(message.messageDeleteYn.eq("N"))
                        .and(message.messageRecallYn.eq("N"))
                        .and(messageRecipient.recipientDeleteYn.eq("N"));
                break;
            case "received": // 받은 쪽지
                condition.and(messageRecipient.messageRecipientId.recipientId.eq(employeeId))
                        .and(messageRecipient.recipientDeleteYn.eq("N"))
                        .and(message.messageRecallYn.eq("N"))
                        .and(message.messageDeleteYn.eq("N"));
                break;
            case "new": // 읽지 않은 쪽지
                condition.and(messageRecipient.messageRecipientId.recipientId.eq(employeeId))
                        .and(messageRecipient.recipientReadYn.eq("N"))
                        .and(messageRecipient.recipientDeleteYn.eq("N"))
                        .and(message.messageRecallYn.eq("N"))
                        .and(message.messageDeleteYn.eq("N"));
                break;
            case "bookmarked": // 보관된 쪽지
                condition.and(messageRecipient.bookmarkedYn.eq("Y"))
                        .and(message.messageRecallYn.eq("N"))
                        .and(messageRecipient.recipientDeleteYn.eq("N"))
                        .and(message.messageDeleteYn.eq("N"));
                break;
        }

        // 검색 키워드가 있을 경우 추가
        if (searchKeyword != null && !searchKeyword.isEmpty()) {
            condition.and(message.messageContent.contains(searchKeyword).or(message.employee.employeeName.contains(searchKeyword)));
        }

        return queryFactory.select(Projections.constructor(MessageDTO.class, message.messageNo, message.employee.employeeId, message.employee.employeeName, message.messageContent, message.messageSendDate, message.messageDeleteYn, message.messageRecallYn, messageRecipient.messageRecipientId.recipientId, messageRecipient.recipientReadYn, messageRecipient.recipientReadDate, messageRecipient.recipientDeleteYn, messageRecipient.bookmarkedYn, messageFile.messageAttachmentId)).from(message).leftJoin(messageRecipient).on(message.messageNo.eq(messageRecipient.messageRecipientId.messageNo)).leftJoin(messageFile).on(message.messageNo.eq(messageFile.message.messageNo)).where(condition).orderBy(message.messageSendDate.desc()).fetch();
    }

    // 2. 개별 쪽지 상세 조회
    @Override
    public MessageDTO getNoteByNo(Long selectedMessageNo, String employeeId) {
        QMessage message = QMessage.message;
        QMessageRecipient messageRecipient = QMessageRecipient.messageRecipient;
        QMessageFile messageFile = QMessageFile.messageFile;

        // 2-1. 쪽지 상세 정보 조회 및 읽음 여부 업데이트
        MessageDTO messageDetail = queryFactory
                .select(Projections.constructor(MessageDTO.class,
                        message.employee.employeeName.as("senderName"), // 발신자 이름
                        message.messageContent,
                        message.messageSendDate,
                        message.messageRecallYn,
                        message.messageRecallDate,
                        messageRecipient.recipientReadYn, // 수신자 읽음 여부
                        messageRecipient.recipientReadDate, // 수신자 읽은 날짜
                        messageFile.messageFileName,
                        messageFile.messageFileUrl,
                        messageFile.messageFileSize,
                        messageFile.messageFileType
                ))
                .from(message)
                .leftJoin(messageRecipient).on(messageRecipient.message.messageNo.eq(message.messageNo))
                .leftJoin(messageFile).on(messageFile.message.messageNo.eq(message.messageNo))
                .where(message.messageNo.eq(selectedMessageNo)
                        .and(messageRecipient.messageRecipientId.recipientId.eq(employeeId)))
                .fetchOne();

        // 2-2. 수신자 목록 조회
        List<String> recipientNames = queryFactory
                .select(messageRecipient.employee.employeeName)
                .from(messageRecipient)
                .where(messageRecipient.message.messageNo.eq(selectedMessageNo))
                .fetch();

        if (messageDetail != null) {
            messageDetail.setRecipientNames(recipientNames);
        }

        // 2-3. 읽음 여부 업데이트
        if (messageDetail != null && "N".equals(messageDetail.getRecipientReadYn())) {
            queryFactory.update(messageRecipient)
                    .set(messageRecipient.recipientReadYn, "Y")
                    .set(messageRecipient.recipientReadDate, LocalDateTime.now())
                    .where(messageRecipient.message.messageNo.eq(selectedMessageNo)
                            .and(messageRecipient.messageRecipientId.recipientId.eq(employeeId)))
                    .execute();
        }

        return messageDetail;

    }

}
