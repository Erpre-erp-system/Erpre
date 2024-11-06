package com.project.erpre.repository;

import com.project.erpre.model.dto.MessageDTO;

import java.util.List;

public interface MessageRepositoryCustom {

    // 1. 상태에 따른 쪽지 목록 조회 및 검색
    List<MessageDTO> getNoteListByUser(String employeeId, String searchKeyword, String status);

    // 2. 개별 쪽지 상세 조회
    MessageDTO getNoteByNo(Long messageNo, String employeeId);

}
