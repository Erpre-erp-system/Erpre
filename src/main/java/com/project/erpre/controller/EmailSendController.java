package com.project.erpre.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.project.erpre.model.entity.EmailFileSend;
import com.project.erpre.model.entity.EmailSend;
import com.project.erpre.service.EmailSendService;
import com.project.erpre.service.EmailSendService.InvalidEmailAddressException;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "http://localhost:8787")
public class EmailSendController {

    @Autowired
    private EmailSendService emailSendService;

    // 이메일 전송
    @PostMapping("/send")
    public ResponseEntity<?> sendEmail( // HTTP 상태 제어 코드 에러관리 위해
            @RequestParam("to") String to, // 수신자 이메일 주소
            @RequestParam("subject") String subject, // 이메일 제목
            @RequestParam("text") String text, // 이메일 본문
            @RequestParam("from") String from,
            @RequestParam("emailIds") String emailIds,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) { // 첨부파일 목록

        try {
            // emailSendService를 호출하여 이메일을 전송하고, 결과 반환
            EmailSend emailSend = emailSendService.sendEmail(to, subject, text, from, emailIds, files);
            return ResponseEntity.ok(emailSend);
        } catch (InvalidEmailAddressException e) {
            return ResponseEntity.badRequest().body("이메일 주소 형식이 잘못되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이메일 전송 중 오류가 발생했습니다.");
        }
    }

    // 보낸메일 내역
    @GetMapping("/sent/{employeeId}")
    public List<EmailSend> getEmailSends(@PathVariable String employeeId) {
        return emailSendService.getEmailSendByEmployeeId(employeeId);
    }

    // 이메일 뷰어 모달
    @GetMapping("/read/{emailNmS}")
    public ResponseEntity<?> getEmailSends(@PathVariable Integer emailNmS) {
        System.out.println("API호출: /read/" + emailNmS); // 로그
        EmailSend email = emailSendService.findEmailById(emailNmS); // emailNmS에 해당하는 이메일을 검색함
        if (email != null) {
            System.out.println("이메일 ID:" + emailNmS + "에 대한 이메일이 정상적으로 조회되었습니다.");
            return ResponseEntity.ok(email); // 있으면 반환
        } else {
            String errorMessage = "이메일 ID: " + emailNmS + "에 대한 이메일을 찾을 수 없습니다.";
            System.out.println(errorMessage);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ByteArrayResource(errorMessage.getBytes())); // ByteArrayResource를 사용해 오류 메시지를 반환
        }
    }

    // 이메일 뷰어 첨부파일 목록
    @GetMapping("files/list/{emailFileNmS}")
    public ResponseEntity<List<EmailFileSend>> getEmailFiles(@PathVariable Integer emailFileNmS) {
        List<EmailFileSend> files = emailSendService.getFilesByEmailId(emailFileNmS);
        return ResponseEntity.ok(files);
    }

    // 이메일 삭제
    @PutMapping("/sent/delete")
    public ResponseEntity<String> deleteSentEmails(@RequestBody Map<String, List<Integer>> request) {
        List<Integer> emailIds = request.get("emailIds");
        emailSendService.deleteSentEmails(emailIds);
        return ResponseEntity.ok("삭제 완료");
    }

    // 휴지통 메일 조회
    @GetMapping("/trash/{employeeId}")
    public List<EmailSend> getTrashEmails(@PathVariable String employeeId) {
        return emailSendService.getTrashEmails(employeeId);
    }

    // 휴지통 메일 복구
    @PutMapping("/trash/restore")
    public ResponseEntity<String> restoreTrashEmails(@RequestBody Map<String, List<Integer>> request) {
        List<Integer> emailIds = request.get("emailIds");
        emailSendService.restoreTrashEmails(emailIds);
        return ResponseEntity.ok("복구 완료");
    }




    // // 이메일 뷰어 첨부파일 다운로드
    // @GetMapping("/files/download/{emailFileNmS}")
    // public ResponseEntity<Resource> downloadFile(@PathVariable Integer emailFileNmS) { // 파일을 다운로드해야되기에 HTTP응답으로 반환 위해
    //                                                                                    // Resource객체 사용
    //     try {
    //         EmailFileSend fileSend = emailSendService.getSendFileById(emailFileNmS); // 첨부파일번호로 해당 파일을 조회
    //         FileSystemResource fileResource = new FileSystemResource(fileSend.getEmailFileUrlS()); // FileSystmeResource는
    //                                                                                                // 파일시스템에서 파일을 읽음 //
    //                                                                                                // 파일경로가져옴

    //         if (!fileResource.exists()) {
    //             String errorMessage = "요청하신 파일을 찾을 수 없습니다. 파일이 삭제되었거나 경로가 잘못되었습니다.";
    //             return ResponseEntity.status(HttpStatus.NOT_FOUND)
    //                     .body(new ByteArrayResource(errorMessage.getBytes())); // ByteArrayResource를 사용해 오류 메시지를 반환
    //         }

    //         // 설정된 파일이름으로 다운로드
    //         HttpHeaders headers = new HttpHeaders(); // 다운로드할 때 파일이름 설정위해 HTTPHeaders 사용
    //         headers.add(HttpHeaders.CONTENT_DISPOSITION,
    //                 "attachment; filename=\"" + fileSend.getEmailFileNameS() + "\""); // Content-Disposition 헤더를
    //                                                                                   // attachment로 설정하여 파일을 다운로드로
    //                                                                                   // 처리하고, 파일 이름을 emailFileNameS에서
    //                                                                                   // 가져와 설정

    //         return ResponseEntity.ok()
    //                 .headers(headers)
    //                 .body(fileResource);
    //     } catch (Exception e) {
    //         String errorMessage = "파일을 다운로드하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
    //                 .body(new ByteArrayResource(errorMessage.getBytes())); // ByteArrayResource를 사용해 오류 메시지를 반환
    //     }
    // }
}
