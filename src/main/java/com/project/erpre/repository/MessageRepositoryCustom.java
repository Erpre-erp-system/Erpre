package com.project.erpre.repository;

import com.project.erpre.model.dto.MessageDTO;

import java.util.List;

public interface MessageRepositoryCustom {

    // 1. 상태에 따른 쪽지 목록 조회 및 검색
    List<MessageDTO> getMessageListByUser(String employeeId, String searchKeyword, String status);

}
