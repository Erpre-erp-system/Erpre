package com.project.erpre.repository;

import com.project.erpre.model.entity.NoteReceiver;
import com.project.erpre.model.entity.NoteReceiverId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteReceiverRepository extends JpaRepository<NoteReceiver, NoteReceiverId> {

    // 받은 모든 쪽지 삭제 여부를 'Y'로 업데이트
    @Modifying
    @Query("UPDATE NoteReceiver mr SET mr.noteReceiverDeleteYn = :deleteYn WHERE mr.noteReceiverId.noteReceiverId = :receiverId")
    void updateReceiverDeleteYnByReceiverId(@Param("receiverId") String receiverId, @Param("deleteYn") String deleteYn);

    // 읽지 않은 모든 쪽지 삭제 여부를 'Y'로 업데이트
    @Modifying
    @Query("UPDATE NoteReceiver mr SET mr.noteReceiverDeleteYn = :deleteYn WHERE mr.noteReceiverId.noteReceiverId = :receiverId AND mr.noteReceiverReadYn = :readYn")
    void updateReceiverDeleteYnByReceiverIdAndReceiverReadYn(@Param("receiverId") String receiverId, @Param("readYn") String readYn, @Param("deleteYn") String deleteYn);

    // 북마크된 모든 쪽지 삭제 여부를 'Y'로 업데이트
    @Modifying
    @Query("UPDATE NoteReceiver mr SET mr.noteReceiverDeleteYn = :deleteYn WHERE mr.noteReceiverId.noteReceiverId = :receiverId AND mr.noteReceiverBookmarkedYn = :bookmarkedYn")
    void updateReceiverDeleteYnByReceiverIdAndBookmarkedYn(@Param("receiverId") String receiverId, @Param("bookmarkedYn") String bookmarkedYn, @Param("deleteYn") String deleteYn);

    // 수신자 삭제 여부 확인을 위해 쪽지 번호로 레코드 개수 조회
    @Query("SELECT COUNT(mr) FROM NoteReceiver mr WHERE mr.noteReceiverId.noteNo = :noteNo AND mr.noteReceiverDeleteYn = :deleteYn")
    int countByNoteNoteNoAndReceiverDeleteYn(@Param("noteNo") Long noteNo, @Param("deleteYn") String deleteYn);

    // 메시지 번호로 수신자 목록 조회
    List<NoteReceiver> findByNoteReceiverIdNoteNo(Long noteNo);
    
}
