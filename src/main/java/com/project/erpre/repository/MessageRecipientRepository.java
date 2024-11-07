package com.project.erpre.repository;

import com.project.erpre.model.entity.MessageRecipient;
import com.project.erpre.model.entity.MessageRecipientId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRecipientRepository extends JpaRepository<MessageRecipient, MessageRecipientId> {

    // 받은 모든 쪽지 삭제 여부를 'Y'로 업데이트
    @Modifying
    @Query("UPDATE MessageRecipient mr SET mr.recipientDeleteYn = :deleteYn WHERE mr.messageRecipientId.recipientId = :recipientId")
    void updateRecipientDeleteYnByRecipientId(@Param("recipientId") String recipientId, @Param("deleteYn") String deleteYn);

    // 읽지 않은 모든 쪽지 삭제 여부를 'Y'로 업데이트
    @Modifying
    @Query("UPDATE MessageRecipient mr SET mr.recipientDeleteYn = :deleteYn WHERE mr.messageRecipientId.recipientId = :recipientId AND mr.recipientReadYn = :readYn")
    void updateRecipientDeleteYnByRecipientIdAndRecipientReadYn(@Param("recipientId") String recipientId, @Param("readYn") String readYn, @Param("deleteYn") String deleteYn);

    // 북마크된 모든 쪽지 삭제 여부를 'Y'로 업데이트
    @Modifying
    @Query("UPDATE MessageRecipient mr SET mr.recipientDeleteYn = :deleteYn WHERE mr.messageRecipientId.recipientId = :recipientId AND mr.bookmarkedYn = :bookmarkedYn")
    void updateRecipientDeleteYnByRecipientIdAndBookmarkedYn(@Param("recipientId") String recipientId, @Param("bookmarkedYn") String bookmarkedYn, @Param("deleteYn") String deleteYn);

    // 수신자 삭제 여부 확인을 위해 쪽지 번호로 레코드 개수 조회
    @Query("SELECT COUNT(mr) FROM MessageRecipient mr WHERE mr.messageRecipientId.messageNo = :messageNo AND mr.recipientDeleteYn = :deleteYn")
    int countByMessageMessageNoAndRecipientDeleteYn(@Param("messageNo") Long messageNo, @Param("deleteYn") String deleteYn);

    // 메시지 번호로 수신자 목록 조회
    List<MessageRecipient> findByMessageRecipientIdMessageNo(Long messageNo);
}
