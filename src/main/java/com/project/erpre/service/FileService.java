package com.project.erpre.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileService {

    @Value("${file.upload-dir}")
    private String baseUploadDir;

    // 파일 타입에 따른 폴더명을 반환하는 메서드
    private String getFolderNameByFileType(String fileType) {
        switch (fileType) {
            case "profile":
                return "profile-pictures";
            case "chat":
                return "chat";
            case "note":
                return "note";
            default:
                return "documents";
        }
    }

    // 파일 저장 메서드
    public String saveFile(MultipartFile file, String fileType) throws IOException {
        String folder = getFolderNameByFileType(fileType);
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        // 파일 경로 생성 및 디렉토리 생성
        Path filePath = Paths.get(baseUploadDir, folder).toAbsolutePath().normalize();
        Files.createDirectories(filePath);

        Path targetLocation = filePath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation);

        return fileName;
    }

    // 파일 삭제 메서드
    public boolean deleteFile(String fileName, String fileType) {
        try {
            String folder = getFolderNameByFileType(fileType);
            Path filePath = Paths.get(baseUploadDir, folder).resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    // 파일 불러오기 메서드
    public Path loadFile(String fileName, String fileType) {
        String folder = getFolderNameByFileType(fileType);
        return Paths.get(baseUploadDir, folder).resolve(fileName).normalize();
    }

    // 파일 다운로드 메서드
    public Resource loadFileAsResource(String fileName, String fileType) {
        try {
            Path filePath = loadFile(fileName, fileType);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("파일을 읽을 수 없습니다: " + fileName);
            }
        } catch (Exception e) {
            throw new RuntimeException("파일을 불러오는 중 오류 발생: " + fileName, e);
        }
    }
}