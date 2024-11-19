package com.example.capstone;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    // 파일 저장 경로 설정
    private final Path rootLocation = Paths.get("uploads");

    // MultipartFile을 받아 파일 저장
    public void saveToFile(MultipartFile file) throws IOException {
        Path destinationFile = rootLocation.resolve(Paths.get(file.getOriginalFilename()))
                .normalize().toAbsolutePath();
        // 파일 시스템 보안 검사
        if (!destinationFile.getParent().equals(rootLocation.toAbsolutePath())) {
            throw new IOException("Cannot store file outside current directory.");
        }
        Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("파일이 성공적으로 저장되었습니다: " + destinationFile);
    }

    // 파일 아카이브 처리
    public void archiveData(String filename) throws IOException {
        Path sourcePath = rootLocation.resolve(filename);
        Path archivePath = Paths.get("archive", filename);
        Files.createDirectories(archivePath.getParent());
        Files.move(sourcePath, archivePath, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("파일이 성공적으로 아카이브되었습니다: " + archivePath);
    }
}
