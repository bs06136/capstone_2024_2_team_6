package com.example.capstone;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class LoginHandler {

    // 로그인 시도 데이터를 처리하는 메서드
    public static String processLoginAttempt(String userId, String password) {
        try {
            // MySQL 데이터베이스에서 ID와 PASSWORD를 확인
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) {
                System.out.println("Database connection is null.");
                return "false_error";
            }

            String query = "SELECT NUM FROM users WHERE ID = ? AND PASSWORD = ?";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setString(1, userId);
            statement.setString(2, password);
            ResultSet resultSet = statement.executeQuery();

            if (resultSet.next()) {
                // 로그인 성공: NUM 값을 반환
                String uniqueNumber = resultSet.getString("NUM");
                System.out.println("Login successful. NUM: " + uniqueNumber);
                return uniqueNumber;
            } else {
                // 로그인 실패: false 반환
                System.out.println("Login failed. Incorrect ID or password.");
                return "false_wrong";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "false_error";
        }
    }
}
