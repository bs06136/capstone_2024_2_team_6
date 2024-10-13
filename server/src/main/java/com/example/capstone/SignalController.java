package com.example.capstone;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
public class SignalController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/signal")
    public String receiveFile(@RequestParam("file") MultipartFile file,
                              @RequestParam(name = "save", defaultValue = "false") boolean save,
                              @RequestParam(name = "archive", defaultValue = "false") boolean archive) throws IOException {
        StringBuilder response = new StringBuilder("처리 결과: ");

        if (save) {
            fileStorageService.saveToFile(file);
            response.append("파일 '").append(file.getOriginalFilename()).append("'이(가) 저장되었습니다. ");
        }

        if (archive) {
            fileStorageService.archiveData(file.getOriginalFilename());
            response.append("파일 '").append(file.getOriginalFilename()).append("'이(가) 아카이브되었습니다. ");
        }

        if (!save && !archive) {
            response.append("저장 또는 아카이브되지 않았습니다.");
        }

        return response.toString();
    }
}
