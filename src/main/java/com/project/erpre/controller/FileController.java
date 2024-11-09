package com.project.erpre.controller;

import com.project.erpre.service.FileService;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final String baseUploadDir = "uploads/";

    @Autowired
    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    // 파일 업로드
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file,
                                             @RequestParam("fileType") String fileType) {
        try {
            String fileName = fileService.saveFile(file, fileType);
            return ResponseEntity.ok(fileName);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("파일 업로드 실패: " + e.getMessage());
        }
    }

    // 파일 불러오기 (브라우저에서 직접 표시하기 위해 Content-Disposition 제거)
    @GetMapping("/{fileType}/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileType, @PathVariable String filename) {
        try {
            String folder = fileType.equals("profile") ? "profile-pictures" : "documents";
            Path filePath = Paths.get(baseUploadDir, folder).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .body(resource);  // Content-Disposition 제거
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 파일 다운로드 (기존의 Content-Disposition 헤더 유지)
    @GetMapping("/download/{fileType}/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileType, @PathVariable String fileName) {
        Resource resource = fileService.loadFileAsResource(fileName, fileType);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // 파일 삭제
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFile(@RequestParam("fileName") String fileName,
                                             @RequestParam("fileType") String fileType) {
        boolean deleted = fileService.deleteFile(fileName, fileType);
        if (deleted) {
            return ResponseEntity.ok("파일 삭제 성공: " + fileName);
        } else {
            return ResponseEntity.status(500).body("파일 삭제 실패");
        }
    }
}
