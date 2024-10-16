package com.example.capstone;

import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FileListService {

    // 파일 목록을 가져오는 메서드
    public List<String> getFileList() {
        Path uploadDirectory = Paths.get("uploads"); // 파일을 저장한 경로
        File folder = uploadDirectory.toFile();

        if (folder.exists() && folder.isDirectory()) {
            // 파일 목록을 배열로 받아서 List로 변환
            return Arrays.stream(folder.listFiles())
                    .filter(File::isFile)  // 파일만 가져오기
                    .map(File::getName)    // 파일 이름만 리스트에 추가
                    .collect(Collectors.toList());
        }

        return List.of("업로드된 파일이 없습니다.");  // 디렉토리 또는 파일이 없을 경우
    }
}
