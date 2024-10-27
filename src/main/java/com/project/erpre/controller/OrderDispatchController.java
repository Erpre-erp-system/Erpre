package com.project.erpre.controller;


import com.project.erpre.model.dto.DispatchDTO;
import com.project.erpre.service.OrderDispatchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orderDispatch")
public class OrderDispatchController {

    private static final Logger logger = LoggerFactory.getLogger(OrderDispatchController.class); // Logger 선언

    @Autowired
    private OrderDispatchService orderDispatchService;

    // 페이징해서 pending 목록 보여주기
    @GetMapping("/pending")
    public ResponseEntity<Page<DispatchDTO>> getPendingList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DispatchDTO> dispatchPage = orderDispatchService.getPagePending(page, size);
        return ResponseEntity.ok(dispatchPage);
    }

    //페이징해서 in progress 목록 보여주기
    @GetMapping("/inProgress")
    public ResponseEntity<Page<DispatchDTO>> getInProgressList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DispatchDTO> dispatchPage = orderDispatchService.getPageInProgress(page, size);
        return ResponseEntity.ok(dispatchPage);
    }

    //페이징해서 complete 목록 보여주기
    @GetMapping("/complete")
    public ResponseEntity<Page<DispatchDTO>> getCompleteList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DispatchDTO> dispatchPage = orderDispatchService.getPageComplete(page, size);
        return ResponseEntity.ok(dispatchPage);
    }

    //목록화면에서 체크된 직원 logical 삭제
    @PostMapping("/delete")
    public ResponseEntity<?> deleteDispatches(@RequestBody List<Integer> no) {
        orderDispatchService.deleteDispatches(no);
        return ResponseEntity.ok("Dispatches deleted successfully");
    }

    //출고 지시
    @PostMapping("/release")
    public ResponseEntity<?> releaseDispatches(@RequestBody Map<String, Object> requestData) {
        orderDispatchService.releaseDispatches(requestData);
        return ResponseEntity.ok("출고 지시가 완료되었습니다.");
    }






}
