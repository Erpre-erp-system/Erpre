package com.project.erpre.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.project.erpre.model.entity.EmailSend;

public interface EmailSendRepository extends JpaRepository<EmailSend, Integer> {

  //삭제상태 d 가 아닌 이메일들만 조회하는 메서드 추가
  List<EmailSend> findByEmployeeIdAndEmailStatusSNot(String employeeId, String emailStatusS);

  // 삭제상태가 d인 이메일 조회(휴지통)
  List<EmailSend> findByEmployeeIdAndEmailStatusS(String employeeId, String emailStatusS);
}
