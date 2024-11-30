package com.example.capstone;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;

public class SampleDataHandler {

    // 데이터베이스에 샘플 데이터를 저장하는 메서드
    public static String saveSampleData(String jsonData) {
        try {
            // JSON 데이터를 파싱하기 위해 ObjectMapper 사용
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonData);

            // "user_id"와 "EEG_data" 필드를 추출
            String arduinoUserId = rootNode.path("user_id").asText(); // 기존의 device_id
            String eegData = rootNode.path("EEG_data").toString();

            if (arduinoUserId == null || arduinoUserId.isEmpty()) {
                return "Invalid arduino user ID";
            }

            // 데이터베이스 연결
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) {
                return "Database connection failed";
            }

            // matching 테이블에서 worker_user_id 조회
            String matchQuery = "SELECT worker_user_id FROM matching WHERE arduino_user_id = ?";
            PreparedStatement matchStmt = connection.prepareStatement(matchQuery);
            matchStmt.setString(1, arduinoUserId);
            ResultSet matchResult = matchStmt.executeQuery();

            // worker_user_id가 없을 경우 반환
            if (!matchResult.next()) {
                matchStmt.close();
                return "No matching worker_user_id found for arduino_user_id: " + arduinoUserId;
            }
            String workerUserId = matchResult.getString("worker_user_id");
            matchStmt.close();

            // 가장 최근 날짜와 data_order를 조회
            String selectQuery = "SELECT date_time, data_order FROM sample_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 1";
            PreparedStatement selectStmt = connection.prepareStatement(selectQuery);
            selectStmt.setString(1, workerUserId);
            ResultSet resultSet = selectStmt.executeQuery();

            // 기본값 설정
            LocalDateTime currentDateTime = LocalDateTime.now();
            int dataOrder = 1;
            boolean isNewDate = true;

            if (resultSet.next()) {
                LocalDateTime lastDateTime = resultSet.getTimestamp("date_time").toLocalDateTime();
                int lastDataOrder = resultSet.getInt("data_order");

                // 날짜 부분이 동일한 경우
                if (lastDateTime.toLocalDate().equals(currentDateTime.toLocalDate())) {
                    dataOrder = lastDataOrder + 1; // 오늘과 같은 날짜라면 data_order 증가
                    isNewDate = false;
                }
            }
            selectStmt.close();

            // 새로운 날짜일 경우 data_order는 1로 설정
            if (isNewDate) {
                dataOrder = 1;
            }

            // sample_data 테이블에 데이터 삽입
            String insertSampleQuery = "INSERT INTO sample_data (user_id, date_time, data_order, data_string) VALUES (?, ?, ?, ?)";
            PreparedStatement insertSampleStmt = connection.prepareStatement(insertSampleQuery);
            insertSampleStmt.setString(1, workerUserId);
            insertSampleStmt.setTimestamp(2, Timestamp.valueOf(currentDateTime));
            insertSampleStmt.setInt(3, dataOrder);
            insertSampleStmt.setString(4, eegData);
            insertSampleStmt.executeUpdate();
            insertSampleStmt.close();

            // 데이터 전처리: 집중도 및 스트레스 값 계산
            float focusScore = calculateFocusScore(eegData); // 집중도 계산 함수 호출
            float stressScore = calculateStressScore(eegData); // 스트레스 계산 함수 호출

            // focus_data 테이블에 데이터 삽입
            String insertFocusQuery = "INSERT INTO focus_data (user_id, date_time, data_order, focus_score) VALUES (?, ?, ?, ?)";
            PreparedStatement insertFocusStmt = connection.prepareStatement(insertFocusQuery);
            insertFocusStmt.setString(1, workerUserId);
            insertFocusStmt.setTimestamp(2, Timestamp.valueOf(currentDateTime));
            insertFocusStmt.setInt(3, dataOrder);
            insertFocusStmt.setFloat(4, focusScore);
            insertFocusStmt.executeUpdate();
            insertFocusStmt.close();

            // stress_data 테이블에 데이터 삽입
            String insertStressQuery = "INSERT INTO stress_data (user_id, date_time, data_order, stress_score) VALUES (?, ?, ?, ?)";
            PreparedStatement insertStressStmt = connection.prepareStatement(insertStressQuery);
            insertStressStmt.setString(1, workerUserId);
            insertStressStmt.setTimestamp(2, Timestamp.valueOf(currentDateTime));
            insertStressStmt.setInt(3, dataOrder);
            insertStressStmt.setFloat(4, stressScore);
            insertStressStmt.executeUpdate();
            insertStressStmt.close();

            return "Data saved successfully for worker " + workerUserId + " with data order " + dataOrder;
        } catch (SQLException e) {
            e.printStackTrace();
            return "Failed to save data to the database";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing the request";
        }
    }

    // 집중도 계산 함수
    private static float calculateFocusScore(String eegData) {
        try {
            // JSON 배열 데이터를 float 배열로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            float[] eegValues = objectMapper.readValue(eegData, float[].class);

            // 세타파 (5~8), 알파파 (9~13), 베타파 (14~30) 값 계산
            float theta = 0, alpha = 0, beta = 0;
            for (int i = 5; i <= 8; i++) {
                if (i < eegValues.length) theta += eegValues[i];
            }
            for (int i = 9; i <= 13; i++) {
                if (i < eegValues.length) alpha += eegValues[i];
            }
            for (int i = 14; i < eegValues.length; i++) {
                beta += eegValues[i];
            }

            // 베타 값이 0인 경우 나눗셈을 피하기 위해 0.0 반환
            if (beta == 0) return 0.0f;

            // 집중도 = (세타 + 알파) / 베타
            return (theta + alpha) / beta;

        } catch (Exception e) {
            e.printStackTrace();
            return 0.0f; // 오류 발생 시 기본값 반환
        }
    }

    // 스트레스 계산 함수
    private static float calculateStressScore(String eegData) {
        try {
            // JSON 배열 데이터를 float 배열로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            float[] eegValues = objectMapper.readValue(eegData, float[].class);

            // 알파파 (9~13), 베타파 (14~30) 값 계산
            float alpha = 0, beta = 0;
            for (int i = 9; i <= 13; i++) {
                if (i < eegValues.length) alpha += eegValues[i];
            }
            for (int i = 14; i < eegValues.length; i++) {
                beta += eegValues[i];
            }

            // 베타 값이 0인 경우 나눗셈을 피하기 위해 0.0 반환
            if (beta == 0) return 0.0f;

            // 스트레스 = 알파 / 베타
            return alpha / beta;

        } catch (Exception e) {
            e.printStackTrace();
            return 0.0f; // 오류 발생 시 기본값 반환
        }
    }
}