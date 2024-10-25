package com.project.erpre.repository;

import com.project.erpre.model.dto.ChatDTO;
import com.project.erpre.model.entity.*;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import java.util.List;

public class ChatRepositoryImpl implements ChatRepositoryCustom {

    private static final Logger logger = LoggerFactory.getLogger(ChatRepositoryImpl.class);

    private final JPAQueryFactory queryFactory;

    public ChatRepositoryImpl(EntityManager entityManager) {
        this.queryFactory = new JPAQueryFactory(entityManager);
    }

    // 1. 현재 참여하고 있는 채팅 목록 조회 및 검색
    @Override
    public List<ChatDTO> getChatListByUser(String employeeId, String searchKeyword) {
        QChat chat = QChat.chat;
        QChatParticipant chatParticipant = QChatParticipant.chatParticipant;
        QChatMessage chatMessage = QChatMessage.chatMessage;
        QChatFile chatFile = QChatFile.chatFile;

        return queryFactory
                .select(Projections.constructor(ChatDTO.class,
                        chat.chatNo,
                        chatParticipant.chatTitle,
                        chatParticipant.chatParticipantId.participantId,
                        chatParticipant.employee.employeeName,
                        chatMessage.chatMessageContent,
                        chatMessage.chatSendDate,
                        chatFile.chatFileName
                ))
                .from(chat)
                .join(chatParticipant).on(chatParticipant.chat.chatNo.eq(chat.chatNo))
                .leftJoin(chatMessage).on(chatMessage.chat.chatNo.eq(chat.chatNo))
                .leftJoin(chatFile).on(chatFile.chatMessage.chatMessageNo.eq(chatMessage.chatMessageNo))
                .where(chatParticipant.chatParticipantId.participantId.eq(employeeId)
                        .and(searchKeywordIsNullOrEmpty(searchKeyword)))
                .groupBy(
                        chat.chatNo,
                        chatParticipant.chatTitle,
                        chatParticipant.chatParticipantId.participantId,
                        chatParticipant.employee.employeeName,
                        chatMessage.chatMessageContent,
                        chatMessage.chatSendDate,
                        chatFile.chatFileName
                )
                .orderBy(chatMessage.chatSendDate.desc())
                .fetch();
    }

    private BooleanExpression searchKeywordIsNullOrEmpty(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return null;
        }
        QChatParticipant chatParticipant = QChatParticipant.chatParticipant;

        return chatParticipant.chatTitle.containsIgnoreCase(keyword)
                .or(chatParticipant.employee.employeeName.containsIgnoreCase(keyword));
    }

}
