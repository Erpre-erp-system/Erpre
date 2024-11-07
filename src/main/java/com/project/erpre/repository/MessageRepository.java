package com.project.erpre.repository;

import com.project.erpre.model.entity.Employee;
import com.project.erpre.model.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long>, MessageRepositoryCustom, QuerydslPredicateExecutor<Message> {


    // 자신이 보낸 모든 쪽지의 삭제 여부를 'Y'로 업데이트
    @Modifying
    @Query("UPDATE Message m SET m.messageDeleteYn = :deleteYn WHERE m.employee.employeeId = :employeeId")
    void updateMessageDeleteYnByEmployeeId(@Param("employeeId") String employeeId, @Param("deleteYn") String deleteYn);

    // MessageDeleteYn이 'Y'인 모든 메시지를 조회
    List<Message> findAllByMessageDeleteYn(@Param("messageDeleteYn") String messageDeleteYn);

    // 현재 유저가 발신자인지 확인
    boolean existsByMessageNoAndEmployeeEmployeeIdAndMessageDeleteYn(Long messageNo, String employeeId, String deleteYn);
    
    // 자신이 보낸 개별 쪽지의 삭제 여부를 'Y'로 업데이트
    @Modifying
    @Query("UPDATE Message m SET m.messageDeleteYn = :deleteYn WHERE m.messageNo = :messageNo")
    void updateMessageDeleteYnByMessageNo(@Param("messageNo") Long messageNo, @Param("deleteYn") String deleteYn);

}