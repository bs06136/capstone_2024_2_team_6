package com.example.capstone;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@RestController
public class SignalController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private FileListService fileListService;  // 파일 목록을 반환하는 서비스 주입

    // 파일 전송 및 저장 처리
    @PostMapping("/signal")
    public String receiveFile(@RequestParam(value = "file", required = false) MultipartFile file,
                              @RequestParam(name = "save", defaultValue = "false") boolean save,
                              @RequestParam(name = "archive", defaultValue = "false") boolean archive,
                              @RequestParam(name = "show", defaultValue = "false") boolean show) throws IOException {

        // 파일 목록을 반환하는 경우 처리
        if (show) {
            List<String> fileList = fileListService.getFileList();  // FileListService 호출
            return "파일 목록: " + String.join(", ", fileList);
        }

        // 파일 저장 및 아카이브 처리
        StringBuilder response = new StringBuilder("처리 결과: ");

        if (file != null && save) {
            fileStorageService.saveToFile(file);
            response.append("파일 '").append(file.getOriginalFilename()).append("'이(가) 저장되었습니다. ");
        }

        if (file != null && archive) {
            fileStorageService.archiveData(file.getOriginalFilename());
            response.append("파일 '").append(file.getOriginalFilename()).append("'이(가) 아카이브되었습니다. ");
        }

        if (file == null && !save && !archive && !show) {
            response.append("저장 또는 아카이브되지 않았습니다.");
        }

        return response.toString();
    }

    // 파일 다운로드 요청 처리
    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam("filename") String filename) {
        try {
            // 파일 경로 설정
            Path filePath = fileStorageService.loadFile(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(404).body(null);  // 파일이 없을 경우 404 응답
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(404).body(null);  // 파일 경로가 잘못되었을 경우 404 응답
        }
    }
}
