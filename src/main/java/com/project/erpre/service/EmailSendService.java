package com.project.erpre.service;

import java.io.File;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

import javax.mail.internet.MimeMessage;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.project.erpre.model.entity.EmailFileSend;
import com.project.erpre.model.entity.EmailSend;
import com.project.erpre.repository.EmailSendFileRepository;
import com.project.erpre.repository.EmailSendRepository;
import com.project.erpre.repository.EmployeeRepository;
import com.sun.mail.smtp.SMTPAddressFailedException;

@Service
public class EmailSendService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailSendRepository emailSendRepository;

    @Autowired
    private EmailSendFileRepository emailFileRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    // 이메일 주소 형식에 맞지 않을때를 위한 에러 메시지 커스텀 예외를 생성함
    public class InvalidEmailAddressException extends RuntimeException {
        public InvalidEmailAddressException(String message) {
            super(message);
        }
    }

    // 이메일 전송
    @Transactional
    public EmailSend sendEmail(String to, String subject, String text, String from, String emailIds,
            List<MultipartFile> files) {

        try {
            MimeMessage message = mailSender.createMimeMessage(); // 이메일 메세지 생성
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); // true: 첨부파일 지원을 의미

            // 수신자
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true);
            helper.setFrom(from); // EmailWrite에서 이메일 계정을 동적으로 받아 로그인한 계정에 따라 변경

            // EmailSend 엔티티 생성 + 저장
            EmailSend emailSend = new EmailSend();
            emailSend.setEmployeeId(emailIds); // 직원아이디도 동적으로 받아 로그인한 계정에 따라 변경
            emailSend.setEmailAddrReceiveS(to);
            emailSend.setEmailSubjectS(subject);
            emailSend.setEmailTextS(text);
            emailSend.setEmailStatusS("nr");
            emailSend.setEmailDateS(new Timestamp(System.currentTimeMillis()));

            EmailSend savedEmailSend = emailSendRepository.save(emailSend); // JPA save를 통해 DB에 전송내역 저장

            if (files != null && !files.isEmpty()) {
                for (MultipartFile file : files) { // 첨부파일과 같은 업로드된 파일을 처리하는데 사용됨
                    File tempFile = File.createTempFile("upload-", file.getOriginalFilename());
                    file.transferTo(tempFile);
                    FileSystemResource fileResource = new FileSystemResource(tempFile);
                    helper.addAttachment(file.getOriginalFilename(), fileResource); // FileSystemResource를 사용해 파일 리소스를
                    // 생성한 다음, helper.addAttachment를 통해
                    // 이메일에 첨부
                    // EmailFileSend 엔티티 생성 + 저장
                    EmailFileSend emailFileSend = new EmailFileSend();
                    emailFileSend.setEmailNmS(savedEmailSend); // savedEmailSend을 외래키로 설정함
                    emailFileSend.setEmailFileNameS(file.getOriginalFilename()); // 업로드된 파일의 원래이름
                    emailFileSend.setEmailFileUrlS(tempFile.getAbsolutePath()); // 서버에 저장된 파일의 절대경로
                    emailFileSend.setEmailFileSizeS(file.getSize()); // 업로드된 파일의 크기(바이트 단위로)
                    emailFileSend.setEmailFileTypeS(file.getContentType()); // 파일의 MIME 타입(img,pdf 등)

                    emailFileRepository.save(emailFileSend); // 첨부파일 정보를 DB에 저장함
                }
            }
            // 실제로 이메일 전송
            mailSender.send(message);
            return savedEmailSend;

        } catch (SMTPAddressFailedException e) {
            throw new InvalidEmailAddressException("이메일 주소 형식이 잘못되었습니다: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("이메일 전송 중 오류가 발생했습니다.", e);
        }
    }

    // 보낸메일 전체 조회
    public List<EmailSend> getEmailSendByEmployeeId(String employeeId) {
        return emailSendRepository.findByEmployeeIdAndEmailStatusSNot(employeeId, "d");
    }

    // 이메일 뷰어
    public EmailSend findEmailById(Integer emailNmS) {
        return emailSendRepository.findById(emailNmS).orElse(null);
    }

    // 보낸메일 첨부파일
    public List<EmailFileSend> getFilesByEmailId(Integer emailNmS) {
        EmailSend email = findEmailById(emailNmS);
        if (email == null) {
            throw new RuntimeException("이메일을 찾을 수 없습니다.");
        }
        return emailFileRepository.findByEmailNmS(email); // 이메일 기준으로 첨부파일 목록을 조회
    }


    //// 이메일 삭제 메서드 추가
    public void deleteSentEmails(List<Integer> emailIds) {
        for (Integer emailId : emailIds) {
            Optional<EmailSend> optionalEmail = emailSendRepository.findById(emailId);
            if (optionalEmail.isPresent()) {
                EmailSend email = optionalEmail.get();
                email.setEmailStatusS("d"); // 이메일 상태를 삭제 d 로 변경
                emailSendRepository.save(email);
            }
        }
    }

    // 휴지통 메일 조회
    public List<EmailSend> getTrashEmails(String employeeId) {
        return emailSendRepository.findByEmployeeIdAndEmailStatusS(employeeId, "d");
    }

    // 휴지통 메일 복구
    public void restoreTrashEmails(List<Integer> emailIds) {
        for (Integer emailId : emailIds) {
            Optional<EmailSend> optionalEmail = emailSendRepository.findById(emailId);
            if (optionalEmail.isPresent()) {
                EmailSend email = optionalEmail.get();
                email.setEmailStatusS("nd"); // 이메일 상태를 'nd'로 변경
                emailSendRepository.save(email);
            }
        }
    }

}
