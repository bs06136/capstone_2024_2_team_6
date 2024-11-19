package com.example.capstone;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseManager {
    private static Connection connection;

    public static void initialize() {
        try {
            String url = "jdbc:mysql://localhost:3306/capstone_db"; // DB URL
            String user = "stonedool"; // 사용자 ID
            String password = "bgbg0112"; // 비밀번호
            connection = DriverManager.getConnection(url, user, password);
            System.out.println("Database connected successfully!");
        } catch (SQLException e) {
            e.printStackTrace();
            System.out.println("Failed to connect to the database.");
        }
    }

    public static Connection getConnection() {
        return connection;
    }
}
