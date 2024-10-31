package com.example.capstone;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class LoginHandler {

    // 임시로 사용자 정보를 저장하는 맵 (실제 구현에서는 데이터베이스를 사용)
    private static final Map<String, String> userDatabase = new HashMap<>();
    private static final Map<String, String> sessionTokens = new HashMap<>();

    static {
        // 예제 사용자 데이터 (ID, PASSWORD)
        userDatabase.put("user1", "password1");
        userDatabase.put("user2", "password2");
    }

    // 로그인 시도 데이터를 처리하는 메서드
    public static String processLoginAttempt(String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonData);

            String id = rootNode.path("ID").asText();
            String password = rootNode.path("PASSWORD").asText();

            // 사용자 검증
            if (userDatabase.containsKey(id) && userDatabase.get(id).equals(password)) {
                // 고유 번호(세션 토큰) 생성
                String uniqueNumber = UUID.randomUUID().toString();
                sessionTokens.put(id, uniqueNumber);

                return "Login successful. Unique number: " + uniqueNumber;
            } else {
                return "Invalid ID or PASSWORD";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to process login attempt";
        }
    }

    // 고유 번호 확인 메서드
    public static boolean validateSession(String id, String uniqueNumber) {
        return sessionTokens.containsKey(id) && sessionTokens.get(id).equals(uniqueNumber);
    }
}

/*
package com.example.capstone;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class LoginHandler {

    // 로그인 시도 데이터를 처리하는 메서드
    public static String processLoginAttempt(String jsonData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonData);

            String id = rootNode.path("ID").asText();
            String password = rootNode.path("PASSWORD").asText();

            // MySQL 데이터베이스에서 ID와 PASSWORD를 확인
            Connection connection = DatabaseManager.getConnection();
            String query = "SELECT NUM FROM users WHERE ID = ? AND PASSWORD = ?";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setString(1, id);
            statement.setString(2, password);
            ResultSet resultSet = statement.executeQuery();

            if (resultSet.next()) {
                // 고유 번호(NUM)를 반환
                String uniqueNumber = resultSet.getString("NUM");
                return "Login successful. Unique number: " + uniqueNumber;
            } else {
                return "Invalid ID or PASSWORD";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Failed to process login attempt";
        }
    }
}

*/