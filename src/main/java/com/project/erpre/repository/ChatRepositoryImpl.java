package com.project.erpre.repository;

import com.project.erpre.model.dto.ChatDTO;
import com.project.erpre.model.dto.ChatMessageDTO;
import com.project.erpre.model.dto.ChatParticipantDTO;
import com.project.erpre.model.entity.*;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import java.util.List;
import java.util.stream.Collectors;

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

        List<ChatDTO> chatList = queryFactory
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

        // 각 채팅방의 참여자 리스트 추가
        for (ChatDTO chatDTO : chatList) {
            List<ChatParticipantDTO> participants = queryFactory
                    .select(Projections.constructor(ChatParticipantDTO.class,
                            chatParticipant.chatParticipantId.participantId,
                            chatParticipant.employee.employeeName,
                            chatParticipant.employee.employeeImageUrl
                    ))
                    .from(chatParticipant)
                    .where(chatParticipant.chat.chatNo.eq(chatDTO.getChatNo()))
                    .fetch();

            // 각 채팅방 DTO에 참여자 리스트를 설정
            chatDTO.setParticipants(participants);
        }

        return chatList;
    }

    // 1 -1. 검색 조건 관리
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


    // 2. 개별 채팅방 조회
    @Override
    public List<ChatMessageDTO> getSelectedChat(Long chatNo, String searchKeyword, String employeeId) {
        QChatMessage chatMessage = QChatMessage.chatMessage;
        QChatFile chatFile = QChatFile.chatFile;
        QChatParticipant chatParticipant = QChatParticipant.chatParticipant;
        QChatMessageRead chatMessageRead = QChatMessageRead.chatMessageRead;

        QChatParticipant subChatParticipant = new QChatParticipant("subChatParticipant");
        QChatMessageRead subChatMessageRead = new QChatMessageRead("subChatMessageRead");

        List<ChatMessageDTO> chatMessages = queryFactory
                .select(Projections.constructor(ChatMessageDTO.class,
                        chatMessage.chatMessageNo,
                        chatMessage.employee.employeeId, // 발신자의 ID (보낸 메세지 띄울 때 프론트단에서 비교할 것)
                        chatMessage.employee.employeeName, // 발신자의 이름
                        chatMessage.employee.employeeImageUrl, // 프로필 사진 Url
                        chatMessage.chatMessageContent,
                        chatMessage.chatSendDate,

                        // 로그인한 사용자의 chatTitle 조회
                        JPAExpressions.select(subChatParticipant.chatTitle)
                                .from(subChatParticipant)
                                .where(subChatParticipant.chat.chatNo.eq(chatNo)
                                        .and(subChatParticipant.chatParticipantId.participantId.eq(employeeId))),

                        chatFile.chatFileName,
                        chatFile.chatFileUrl,
                        chatFile.chatFileSize,
                        chatFile.chatFileType,

                        chatMessageRead.chatMessageReadYn, // 현재 메세지 읽음 여부 상태

                        // 특정 메세지를 읽지 않은 사람의 수 조회
                        JPAExpressions.select(subChatMessageRead.count())
                                .from(subChatMessageRead)
                                .where(subChatMessageRead.chatMessage.chatMessageNo.eq(chatMessage.chatMessageNo)
                                        .and(subChatMessageRead.chatMessageReadYn.eq("N"))),

                        // 채팅 참여자 수
                        JPAExpressions.select(subChatParticipant.chatParticipantId.chatNo.count())
                                .from(subChatParticipant)
                                .where(subChatParticipant.chat.chatNo.eq(chatNo))
                ))
                .from(chatMessage)
                .leftJoin(chatFile).on(chatFile.chatMessage.chatMessageNo.eq(chatMessage.chatMessageNo))
                .leftJoin(chatParticipant).on(chatParticipant.chat.chatNo.eq(chatMessage.chat.chatNo))
                .leftJoin(chatMessageRead)
                .on(chatMessageRead.chatMessage.chatMessageNo.eq(chatMessage.chatMessageNo)
                        .and(chatMessageRead.employee.employeeId.eq(chatMessage.employee.employeeId))) // 메시지 수신자 ID와 비교, 같으면 읽음여부가 'y'로 업데이트되는 메서드 추가하기
                .where(
                        chatMessage.chat.chatNo.eq(chatNo)
                                .and(searchKeywordIsNullOrEmptyWithoutChatTitle(searchKeyword))
                )
                .orderBy(chatMessage.chatSendDate.asc())
                .fetch();

        return chatMessages.stream()
                .distinct()
                .collect(Collectors.toList());
    }

    // 2 - 1. 검색 조건 관리
    private BooleanExpression searchKeywordIsNullOrEmptyWithoutChatTitle(String searchKeyword) {
        if (searchKeyword == null || searchKeyword.isEmpty()) {
            return null;
        }
        QChatParticipant chatParticipant = QChatParticipant.chatParticipant;
        QChatMessage chatMessage = QChatMessage.chatMessage;

        return chatParticipant.employee.employeeName.containsIgnoreCase(searchKeyword)
                .or(chatMessage.chatMessageContent.containsIgnoreCase(searchKeyword));
    }

    // 3. 특정 메세지 읽음 관리

}
