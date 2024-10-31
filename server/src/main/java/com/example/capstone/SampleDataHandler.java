package com.example.capstone;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class SampleDataHandler {

    private static final String DIRECTORY_PATH = "arduino_sampling_data/";

    // 사용자 ID에 따라 데이터를 저장하는 메서드
    public static String saveSampleData(String jsonData) {
        try {
            // JSON 데이터를 파싱하기 위해 ObjectMapper 사용
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonData);

            // "file_name" 필드를 추출
            String fileName = rootNode.path("file_name").asText();

            // 파일 이름이 비어 있지 않고 "sampledata"로 시작하는지 확인
            if (fileName == null || fileName.isEmpty() || !fileName.startsWith("sampledata")) {
                return "Invalid or unsupported file name";
            }

            // arduino_sampling_data 폴더가 없는 경우 생성
            Files.createDirectories(Paths.get(DIRECTORY_PATH));

            // 파일을 생성하고 JSON 데이터를 저장
            FileWriter fileWriter = new FileWriter(DIRECTORY_PATH + fileName);
            fileWriter.write(jsonData);
            fileWriter.close();

            return "File saved as " + fileName;
        } catch (IOException e) {
            e.printStackTrace();
            return "Failed to save file";
        }
    }
}
