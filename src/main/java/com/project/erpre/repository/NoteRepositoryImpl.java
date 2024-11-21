package com.project.erpre.repository;

import com.project.erpre.model.dto.NoteDTO;
import com.project.erpre.model.entity.QNote;
import com.project.erpre.model.entity.QNoteFile;
import com.project.erpre.model.entity.QNoteReceiver;
import com.querydsl.core.BooleanBuilder;
import java.util.List;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;

import javax.persistence.EntityManager;
import java.time.LocalDateTime;

public class NoteRepositoryImpl implements NoteRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    public NoteRepositoryImpl(EntityManager entityManager) {
        this.queryFactory = new JPAQueryFactory(entityManager);
    }


    // 1. 상태에 따른 쪽지 목록 조회 및 검색 (sent, new, received, bookmarked)
    @Override
    public List<NoteDTO> getNoteListByUser(String employeeId, String searchKeyword, String noteStatus) {
        QNote note = QNote.note;
        QNoteReceiver noteReceiver = QNoteReceiver.noteReceiver;
        QNoteFile noteFile = QNoteFile.noteFile;

        BooleanBuilder condition = new BooleanBuilder();

        switch (noteStatus) {
            case "sent": // 보낸 쪽지
                condition.and(note.employee.employeeId.eq(employeeId))
                        .and(note.noteDeleteYn.eq("N"))
                        .and(note.noteRecallYn.eq("N"))
                        .and(noteReceiver.noteReceiverDeleteYn.eq("N"));
                break;
            case "received": // 받은 쪽지
                condition.and(noteReceiver.noteReceiverId.noteReceiverId.eq(employeeId))
                        .and(noteReceiver.noteReceiverDeleteYn.eq("N"))
                        .and(note.noteRecallYn.eq("N"))
                        .and(note.noteDeleteYn.eq("N"));
                break;
            case "new": // 읽지 않은 쪽지
                condition.and(noteReceiver.noteReceiverId.noteReceiverId.eq(employeeId))
                        .and(noteReceiver.noteReceiverReadYn.eq("N"))
                        .and(noteReceiver.noteReceiverDeleteYn.eq("N"))
                        .and(note.noteRecallYn.eq("N"))
                        .and(note.noteDeleteYn.eq("N"));
                break;
            case "bookmarked": // 보관된 쪽지
                condition.and(noteReceiver.noteReceiverBookmarkedYn.eq("Y"))
                        .and(note.noteRecallYn.eq("N"))
                        .and(noteReceiver.noteReceiverDeleteYn.eq("N"))
                        .and(note.noteDeleteYn.eq("N"));
                break;
        }

        // 검색 키워드가 있을 경우 추가
        if (searchKeyword != null && !searchKeyword.isEmpty()) {
            condition.and(note.noteContent.contains(searchKeyword).or(note.employee.employeeName.contains(searchKeyword)));
        }

        return queryFactory.select(Projections.constructor(NoteDTO.class, note.noteNo, note.employee.employeeId, note.employee.employeeName, note.noteContent, note.noteSendDate, note.noteDeleteYn, note.noteRecallYn, noteReceiver.noteReceiverId.noteReceiverId, noteReceiver.noteReceiverReadYn, noteReceiver.noteReceiverReadDate, noteReceiver.noteReceiverDeleteYn, noteReceiver.noteReceiverBookmarkedYn, noteFile.noteAttachmentId)).from(note).leftJoin(noteReceiver).on(note.noteNo.eq(noteReceiver.noteReceiverId.noteNo)).leftJoin(noteFile).on(note.noteNo.eq(noteFile.note.noteNo)).where(condition).orderBy(note.noteSendDate.desc()).fetch();
    }

    // 2. 개별 쪽지 상세 조회
    @Override
    public NoteDTO getNoteByNo(Long selectedNoteNo, String employeeId) {
        QNote note = QNote.note;
        QNoteReceiver noteReceiver = QNoteReceiver.noteReceiver;
        QNoteFile noteFile = QNoteFile.noteFile;

        // 2-1. 쪽지 상세 정보 조회 및 읽음 여부 업데이트
        NoteDTO noteDetail = queryFactory
                .select(Projections.constructor(NoteDTO.class,
                        note.noteNo,
                        note.employee.employeeName.as("senderName"), // 발신자 이름
                        note.employee.job.jobName,
                        note.employee.department.departmentName,
                        note.noteContent,
                        note.noteSendDate,
                        note.noteRecallYn,
                        note.noteRecallDate,
                        noteReceiver.noteReceiverReadYn, // 수신자 읽음 여부
                        noteReceiver.noteReceiverReadDate, // 수신자 읽은 날짜
                        noteReceiver.noteReceiverBookmarkedYn,
                        noteFile.noteFileName,
                        noteFile.noteFileUrl,
                        noteFile.noteFileSize,
                        noteFile.noteFileType
                ))
                .from(note)
                .leftJoin(noteReceiver).on(noteReceiver.note.noteNo.eq(note.noteNo))
                .leftJoin(noteFile).on(noteFile.note.noteNo.eq(note.noteNo))
                .where(note.noteNo.eq(selectedNoteNo)
                        .and(noteReceiver.noteReceiverId.noteReceiverId.eq(employeeId)))
                .fetchOne();

        // 2-2. 수신자 목록 조회
        List<String> receiverNames = queryFactory
                .select(noteReceiver.employee.employeeName)
                .from(noteReceiver)
                .where(noteReceiver.note.noteNo.eq(selectedNoteNo))
                .fetch();

        if (noteDetail != null) {
            noteDetail.setNoteReceiverNames(receiverNames);
        }

        // 2-3. 읽음 여부 업데이트
        if (noteDetail != null && "N".equals(noteDetail.getNoteReceiverReadYn())) {
            queryFactory.update(noteReceiver)
                    .set(noteReceiver.noteReceiverReadYn, "Y")
                    .set(noteReceiver.noteReceiverReadDate, LocalDateTime.now())
                    .where(noteReceiver.note.noteNo.eq(selectedNoteNo)
                            .and(noteReceiver.noteReceiverId.noteReceiverId.eq(employeeId)))
                    .execute();
        }

        return noteDetail;

    }

}
