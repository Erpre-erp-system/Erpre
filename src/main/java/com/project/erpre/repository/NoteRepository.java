package com.project.erpre.repository;

import com.project.erpre.model.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long>, NoteRepositoryCustom, QuerydslPredicateExecutor<Note> {


    // 자신이 보낸 모든 쪽지의 삭제 여부를 'Y'로 업데이트
    @Modifying
    @Query("UPDATE Note m SET m.noteDeleteYn = :deleteYn WHERE m.employee.employeeId = :employeeId")
    void updateNoteDeleteYnByEmployeeId(@Param("employeeId") String employeeId, @Param("deleteYn") String deleteYn);

    // NoteDeleteYn이 'Y'인 모든 메시지를 조회
    List<Note> findAllByNoteDeleteYn(@Param("noteDeleteYn") String noteDeleteYn);

    // 현재 유저가 발신자인지 확인
    boolean existsByNoteNoAndEmployeeEmployeeIdAndNoteDeleteYn(Long noteNo, String employeeId, String deleteYn);
    
    // 자신이 보낸 개별 쪽지의 삭제 여부를 'Y'로 업데이트
    @Modifying
    @Query("UPDATE Note m SET m.noteDeleteYn = :deleteYn WHERE m.noteNo = :noteNo")
    void updateNoteDeleteYnByNoteNo(@Param("noteNo") Long noteNo, @Param("deleteYn") String deleteYn);

}