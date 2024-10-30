package com.example.capstone;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
public class SignalController {

    private static final String DIRECTORY_PATH = "test_data/";
    private static final AtomicInteger fileCounter = new AtomicInteger(1); // 파일 카운터

    // POST 요청을 통해 JSON 데이터를 수신하고 파일로 저장
    @PostMapping("/signal")
    public String receiveSignal(@RequestBody String jsonData) {
        try {
            // test 폴더가 없는 경우 생성
            Files.createDirectories(Paths.get(DIRECTORY_PATH));

            // 카운터를 이용한 파일명 생성
            String fileName = "sampledata" + fileCounter.getAndIncrement() + ".json";
            FileWriter fileWriter = new FileWriter(DIRECTORY_PATH + fileName);

            // JSON 데이터를 파일에 저장
            fileWriter.write(jsonData);
            fileWriter.close();

            return "File saved as " + fileName;
        } catch (IOException e) {
            e.printStackTrace();
            return "Failed to save file";
        }
    }
}
