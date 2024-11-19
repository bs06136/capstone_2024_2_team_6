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
            String userId = rootNode.path("user_id").asText();
            String eegData = rootNode.path("EEG_data").toString();

            if (userId == null || userId.isEmpty()) {
                return "Invalid user ID";
            }

            // 데이터베이스 연결
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) {
                return "Database connection failed";
            }

            // 가장 최근 날짜와 data_order를 조회
            String selectQuery = "SELECT date_time, data_order FROM sample_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 1";
            PreparedStatement selectStmt = connection.prepareStatement(selectQuery);
            selectStmt.setString(1, userId);
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

            // 데이터 삽입 쿼리 작성
            String insertQuery = "INSERT INTO sample_data (user_id, date_time, data_order, data_string) VALUES (?, ?, ?, ?)";
            PreparedStatement insertStmt = connection.prepareStatement(insertQuery);
            insertStmt.setString(1, userId);

            // LocalDateTime을 Timestamp로 변환하여 삽입
            insertStmt.setTimestamp(2, Timestamp.valueOf(currentDateTime));
            insertStmt.setInt(3, dataOrder);
            insertStmt.setString(4, eegData);

            // 쿼리 실행
            insertStmt.executeUpdate();
            insertStmt.close();

            return "Data saved successfully for user " + userId + " with data order " + dataOrder;
        } catch (SQLException e) {
            e.printStackTrace();
            return "Failed to save data to the database";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing the request";
        }
    }
}
