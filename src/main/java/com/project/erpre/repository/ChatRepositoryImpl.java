package com.project.erpre.repository;

import com.project.erpre.model.dto.ChatDTO;
import com.project.erpre.model.dto.ChatMessageDTO;
import com.project.erpre.model.entity.*;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
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

        QChatParticipant subChatParticipant = new QChatParticipant("subChatParticipant");

        return queryFactory
                .select(Projections.constructor(ChatDTO.class,
                        chat.chatNo,
                        chatParticipant.chatTitle,
                        chatParticipant.chatParticipantId.participantId,
                        chatParticipant.employee.employeeName,
                        chatMessage.chatMessageContent,
                        chatMessage.chatSendDate,
                        chatFile.chatFileName,
                        JPAExpressions.select(subChatParticipant.chatParticipantId.chatNo.count())
                                .from(subChatParticipant)
                                .where(subChatParticipant.chat.eq(chat))
                ))
                .from(chat)
                .join(chatParticipant).on(chatParticipant.chat.eq(chat))
                .leftJoin(chatMessage).on(chatMessage.chat.chatNo.eq(chat.chatNo)
                        .and(chatMessage.chatSendDate.eq(
                                JPAExpressions.select(chatMessage.chatSendDate.max())
                                        .from(chatMessage)
                                        .where(chatMessage.chat.chatNo.eq(chat.chatNo))
                        )))
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

    // 검색 조건 관리
    private BooleanExpression searchKeywordIsNullOrEmpty(String searchKeyword) {
        if (searchKeyword == null || searchKeyword.isEmpty()) {
            return null;
        }
        QChatParticipant chatParticipant = QChatParticipant.chatParticipant;
        QChatMessage chatMessage = QChatMessage.chatMessage;

        return chatParticipant.chatTitle.containsIgnoreCase(searchKeyword)
                .or(chatParticipant.employee.employeeName.containsIgnoreCase(searchKeyword))
                .or(chatMessage.chatMessageContent.containsIgnoreCase(searchKeyword));
    }


    // 2. 선택된 채팅방 조회
    @Override
    public List<ChatMessageDTO> getSelectedChat(Long chatNo, String searchKeyword) {
        QChat chat = QChat.chat;
        QChatParticipant chatParticipant = QChatParticipant.chatParticipant;
        QChatMessage chatMessage = QChatMessage.chatMessage;
        QChatFile chatFile = QChatFile.chatFile;

        return queryFactory
                .select(Projections.constructor(ChatMessageDTO.class,
                        chatMessage.chatMessageNo,
                        chatMessage.chat.chatNo,
                        chatMessage.employee.employeeId,
                        chatMessage.employee.employeeName,
                        chatMessage.chatMessageContent,
                        chatMessage.chatSendDate,
                        chatFile.chatFileName,
                        chatFile.chatFileUrl
                ))
                .from(chatMessage)
                .leftJoin(chatFile).on(chatFile.chatMessage.chatMessageNo.eq(chatMessage.chatMessageNo))
                .where(
                        chatMessage.chat.chatNo.eq(chatNo)
                                .and(searchKeywordIsNullOrEmpty(searchKeyword))
                )
                .orderBy(chatMessage.chatSendDate.asc())
                .fetch();
    }

}
