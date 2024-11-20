package com.example.capstone;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;

@RestController
public class DataController {

    @GetMapping("/api/GET/login")
    public String login(@RequestParam String user_id, @RequestParam String password) {
        // LoginHandler의 processLoginAttempt 메서드에 user_id와 password 전달
        return LoginHandler.processLoginAttempt(user_id, password);
    }

    @GetMapping("/api/GET/data_renew")
    public String getDataRenew(@RequestParam String user_id) {
        try {
            System.out.println(user_id);
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) return "Database connection failed";

            // 관리자 NUM에 해당하는 모든 근무자-아두이노 매칭 정보 조회
            String matchQuery = "SELECT worker_user_id, arduino_user_id FROM matching WHERE admin_num = ?";
            PreparedStatement matchStmt = connection.prepareStatement(matchQuery);
            matchStmt.setInt(1, Integer.parseInt(user_id));
            ResultSet matchRs = matchStmt.executeQuery();

            // JSON 데이터를 담을 ObjectMapper와 JSON 객체 생성
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode resultJson = mapper.createObjectNode();

            // 각 매칭된 아두이노 장치의 가장 최근 focus_data와 stress_data 조회
            while (matchRs.next()) {
                String workerUserId = matchRs.getString("worker_user_id");
                String arduinoUserId = matchRs.getString("arduino_user_id");

                // focus_data 테이블에서 worker_user_id별 가장 최근 집중도 값 조회
                String focusQuery = "SELECT focus_score FROM focus_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 1";
                PreparedStatement focusStmt = connection.prepareStatement(focusQuery);
                focusStmt.setString(1, workerUserId);
                ResultSet focusRs = focusStmt.executeQuery();

                float focusScore = 0.0f;
                if (focusRs.next()) {
                    focusScore = focusRs.getFloat("focus_score");
                }
                focusStmt.close();

                // stress_data 테이블에서 worker_user_id별 가장 최근 스트레스 값 조회
                String stressQuery = "SELECT stress_score FROM stress_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 1";
                PreparedStatement stressStmt = connection.prepareStatement(stressQuery);
                stressStmt.setString(1, workerUserId);
                ResultSet stressRs = stressStmt.executeQuery();

                float stressScore = 0.0f;
                if (stressRs.next()) {
                    stressScore = stressRs.getFloat("stress_score");
                }
                stressStmt.close();

                // JSON 객체에 추가
                String value = focusScore + ", " + stressScore;
                resultJson.put(workerUserId, value);
            }
            System.out.println(resultJson.toString());
            matchStmt.close();
            return resultJson.toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error fetching data";
        }
    }

    @GetMapping("/api/GET/detail/{user_id}/info")
    public String getUserInfo(@PathVariable String user_id) {
        try {
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) return "Database connection failed";

            String query = "SELECT name, detail, option_value FROM worker WHERE user_id = ?";
            PreparedStatement stmt = connection.prepareStatement(query);
            stmt.setString(1, user_id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                ObjectMapper mapper = new ObjectMapper();
                ObjectNode json = mapper.createObjectNode();
                json.put("name", rs.getString("name"));
                json.put("detail", rs.getString("detail"));
                json.put("option_value", rs.getInt("option_value"));

                return json.toString();
            }
            return "No details found for user " + user_id;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error fetching user info";
        }
    }

    @GetMapping("/api/GET/detail/{worker_id}/data")
    public String getDeviceData(@PathVariable String worker_id) {
        try {
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) return "Database connection failed";

            // focus_data와 stress_data에서 worker_id별로 최근 10개의 데이터를 조회
            String focusQuery = "SELECT focus_score FROM focus_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 10";
            String stressQuery = "SELECT stress_score FROM stress_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 10";

            PreparedStatement focusStmt = connection.prepareStatement(focusQuery);
            focusStmt.setString(1, worker_id);
            ResultSet focusRs = focusStmt.executeQuery();

            PreparedStatement stressStmt = connection.prepareStatement(stressQuery);
            stressStmt.setString(1, worker_id);
            ResultSet stressRs = stressStmt.executeQuery();

            // JSON 형식으로 데이터 반환
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode json = mapper.createObjectNode();

            int count = 1;
            while (focusRs.next() && stressRs.next()) {
                // 집중도와 스트레스 값을 ','로 구분하여 하나의 문자열로 저장
                String focusScore = String.valueOf(focusRs.getFloat("focus_score"));
                String stressScore = String.valueOf(stressRs.getFloat("stress_score"));
                json.put("data_" + count, focusScore + "," + stressScore);
                count++;
            }

            focusStmt.close();
            stressStmt.close();
            return json.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error fetching device data";
        }
    }


    @PostMapping("/api/POST/user/enrollment")
    public String enrollOrUpdateWorker(@RequestBody String jsonData) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(jsonData);

            String userId = rootNode.path("user_id").asText();
            String workerName = rootNode.path("worker_name").asText();
            String detail = rootNode.path("detail").asText();
            int option = rootNode.path("option").asInt();
            int adminId = rootNode.path("admin_id").asInt(); // admin_id 추가

            Connection connection = DatabaseManager.getConnection();
            if (connection == null) return "Database connection failed";

            // worker 테이블에 user_id가 있는지 확인
            String selectQuery = "SELECT COUNT(*) FROM worker WHERE user_id = ?";
            PreparedStatement selectStmt = connection.prepareStatement(selectQuery);
            selectStmt.setString(1, userId);
            ResultSet rs = selectStmt.executeQuery();

            rs.next();
            int count = rs.getInt(1);
            rs.close();
            selectStmt.close();

            if (count > 0) {
                // 기존 근무자 정보 업데이트
                String updateQuery = "UPDATE worker SET name = ?, detail = ?, option_value = ?, admin_id = ? WHERE user_id = ?";
                PreparedStatement updateStmt = connection.prepareStatement(updateQuery);
                updateStmt.setString(1, workerName);
                updateStmt.setString(2, detail);
                updateStmt.setInt(3, option);
                updateStmt.setInt(4, adminId);
                updateStmt.setString(5, userId);
                updateStmt.executeUpdate();
                updateStmt.close();
                return "true";
            } else {
                // 새 근무자 정보 추가
                String insertQuery = "INSERT INTO worker (user_id, name, detail, option_value, admin_id) VALUES (?, ?, ?, ?, ?)";
                PreparedStatement insertStmt = connection.prepareStatement(insertQuery);
                insertStmt.setString(1, userId);
                insertStmt.setString(2, workerName);
                insertStmt.setString(3, detail);
                insertStmt.setInt(4, option);
                insertStmt.setInt(5, adminId);
                insertStmt.executeUpdate();
                insertStmt.close();
                return "true";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "false";
        }
    }

    @PostMapping("/api/POST/device/enrollment")
    public String enrollOrUpdateDevice(@RequestBody String jsonData) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(jsonData);

            String deviceId = rootNode.path("device_id").asText();

            Connection connection = DatabaseManager.getConnection();
            if (connection == null) return "Database connection failed";

            // arduino 테이블에 device_id가 있는지 확인
            String selectQuery = "SELECT COUNT(*) FROM arduino WHERE device_id = ?";
            PreparedStatement selectStmt = connection.prepareStatement(selectQuery);
            selectStmt.setString(1, deviceId);
            ResultSet rs = selectStmt.executeQuery();

            rs.next();
            int count = rs.getInt(1);
            rs.close();
            selectStmt.close();

            if (count > 0) {
                // 기존 장비 정보 업데이트
                String updateQuery = "UPDATE arduino SET device_id = ? WHERE device_id = ?";
                PreparedStatement updateStmt = connection.prepareStatement(updateQuery);
                updateStmt.setString(1, deviceId);
                updateStmt.setString(2, deviceId);
                updateStmt.executeUpdate();
                updateStmt.close();
                return "true";
            } else {
                // 새 장비 정보 추가
                String insertQuery = "INSERT INTO arduino (device_id) VALUES (?)";
                PreparedStatement insertStmt = connection.prepareStatement(insertQuery);
                insertStmt.setString(1, deviceId);
                insertStmt.executeUpdate();
                insertStmt.close();
                return "true";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "false";
        }
    }

    @PostMapping("/api/POST/initial_data")
    public String receiveInitialData(@RequestBody String jsonData) {
        try {
            System.out.print(jsonData);
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonData);

            // arduino_id와 rfid_id를 문자열에서 int로 변환
            int arduinoId = Integer.parseInt(rootNode.get("arduino_id").asText());
            String rfidId = rootNode.get("rfid_id").asText();

            // 데이터베이스 연결
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) return "Database connection failed";

            // 기존 매칭 삭제
            String deleteQuery = "DELETE FROM matching WHERE arduino_user_id = ? OR worker_user_id = ?";
            PreparedStatement deleteStmt = connection.prepareStatement(deleteQuery);
            deleteStmt.setInt(1, arduinoId);
            deleteStmt.setString(2, rfidId);
            deleteStmt.executeUpdate();
            deleteStmt.close();

            // arduino_id와 rfid_id 유효성 확인
            String checkArduinoQuery = "SELECT COUNT(*) FROM arduino WHERE device_id = ?";
            PreparedStatement checkArduinoStmt = connection.prepareStatement(checkArduinoQuery);
            checkArduinoStmt.setInt(1, arduinoId);
            ResultSet arduinoResult = checkArduinoStmt.executeQuery();
            boolean arduinoExists = arduinoResult.next() && arduinoResult.getInt(1) > 0;
            arduinoResult.close();
            checkArduinoStmt.close();

            String checkWorkerQuery = "SELECT COUNT(*) FROM worker WHERE user_id = ?";
            PreparedStatement checkWorkerStmt = connection.prepareStatement(checkWorkerQuery);
            checkWorkerStmt.setString(1, rfidId);
            ResultSet workerResult = checkWorkerStmt.executeQuery();
            boolean workerExists = workerResult.next() && workerResult.getInt(1) > 0;
            workerResult.close();
            checkWorkerStmt.close();
            System.out.println("initial done");

            // 두 ID가 유효할 경우 매칭 추가
            if (arduinoExists && workerExists) {
                String adminIdQuery = "SELECT admin_id FROM worker WHERE user_id = ?";
                PreparedStatement adminIdStmt = connection.prepareStatement(adminIdQuery);
                adminIdStmt.setString(1, rfidId);
                ResultSet adminResult = adminIdStmt.executeQuery();

                int adminId = adminResult.next() ? adminResult.getInt("admin_id") : -1;
                adminResult.close();
                adminIdStmt.close();

                if (adminId != -1) {
                    String insertQuery = "INSERT INTO matching (worker_user_id, arduino_user_id, admin_num) VALUES (?, ?, ?)";
                    PreparedStatement insertStmt = connection.prepareStatement(insertQuery);
                    insertStmt.setString(1, rfidId);
                    insertStmt.setInt(2, arduinoId);
                    insertStmt.setInt(3, adminId);
                    insertStmt.executeUpdate();
                    insertStmt.close();
                    System.out.println("Response sent: true");
                    return "true";
                } else {
                    System.out.println("Response sent: Error: admin_id not found");
                    return "Error: admin_id not found";
                }
            } else {
                System.out.println("Response sent: false");
                return "false";
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing request";
        }
    }

    @PostMapping("/api/POST/sample_data")
    public String receiveSampleData(@RequestBody String jsonData) {
        try {
            // 전달받은 JSON 데이터를 출력
            System.out.println("Received JSON data: " + jsonData);

            // JSON 데이터 파싱
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonData);

            // 필요한 데이터 추출
            String arduinoUserId = rootNode.path("ID").asText(); // 아두이노 ID
            String eegData = rootNode.path("DATA").toString(); // EEG 데이터

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

            if (focusScore >= 0.6) {
                recordDailyFocus(workerUserId);
            }

            recordDailyStress(workerUserId, stressScore);


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
        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing the request";
        }
    }

    // 집중도 계산 함수
    private float calculateFocusScore(String eegData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            float[] eegValues = objectMapper.readValue(eegData, float[].class);

            float theta = 0, alpha = 0, beta = 0;
            for (int i = 5; i <= 8 && i < eegValues.length; i++) {
                theta += eegValues[i];
            }
            for (int i = 9; i <= 13 && i < eegValues.length; i++) {
                alpha += eegValues[i];
            }
            for (int i = 14; i < eegValues.length; i++) {
                beta += eegValues[i];
            }

            if (beta == 0) return 0.0f; // 나눗셈 오류 방지
            return (theta + alpha) / beta;
        } catch (Exception e) {
            e.printStackTrace();
            return 0.0f;
        }
    }

    // 스트레스 계산 함수
    private float calculateStressScore(String eegData) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            float[] eegValues = objectMapper.readValue(eegData, float[].class);

            float alpha = 0, beta = 0;
            for (int i = 9; i <= 13 && i < eegValues.length; i++) {
                alpha += eegValues[i];
            }
            for (int i = 14; i < eegValues.length; i++) {
                beta += eegValues[i];
            }

            if (beta == 0) return 0.0f; // 나눗셈 오류 방지
            return alpha / beta;
        } catch (Exception e) {
            e.printStackTrace();
            return 0.0f;
        }
    }

    private void recordDailyFocus(String workerUserId) {
        try {
            // 데이터베이스 연결
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) {
                throw new SQLException("Database connection failed");
            }

            // 현재 날짜 계산
            LocalDateTime currentDateTime = LocalDateTime.now();
            java.sql.Date currentDate = java.sql.Date.valueOf(currentDateTime.toLocalDate());

            // 날짜별 데이터 조회
            String selectQuery = "SELECT count FROM daily_focus WHERE worker_id = ? AND date = ?";
            PreparedStatement selectStmt = connection.prepareStatement(selectQuery);
            selectStmt.setString(1, workerUserId);
            selectStmt.setDate(2, currentDate);
            ResultSet resultSet = selectStmt.executeQuery();

            if (resultSet.next()) {
                // 기존 데이터가 있을 경우 count 증가
                int currentCount = resultSet.getInt("count");
                String updateQuery = "UPDATE daily_focus SET count = ? WHERE worker_id = ? AND date = ?";
                PreparedStatement updateStmt = connection.prepareStatement(updateQuery);
                updateStmt.setInt(1, currentCount + 1);
                updateStmt.setString(2, workerUserId);
                updateStmt.setDate(3, currentDate);
                updateStmt.executeUpdate();
                updateStmt.close();
            } else {
                // 데이터가 없을 경우 새로운 row 삽입
                String insertQuery = "INSERT INTO daily_focus (worker_id, date, count) VALUES (?, ?, ?)";
                PreparedStatement insertStmt = connection.prepareStatement(insertQuery);
                insertStmt.setString(1, workerUserId);
                insertStmt.setDate(2, currentDate);
                insertStmt.setInt(3, 1); // 첫 카운트
                insertStmt.executeUpdate();
                insertStmt.close();
            }
            selectStmt.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void recordDailyStress(String workerUserId, float stressScore) {
        try {
            // 데이터베이스 연결
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) {
                throw new SQLException("Database connection failed");
            }

            // 현재 날짜 계산
            LocalDateTime currentDateTime = LocalDateTime.now();
            java.sql.Date currentDate = java.sql.Date.valueOf(currentDateTime.toLocalDate());

            // 날짜별 데이터 조회
            String selectQuery = "SELECT count, average FROM daily_stress WHERE worker_id = ? AND date = ?";
            PreparedStatement selectStmt = connection.prepareStatement(selectQuery);
            selectStmt.setString(1, workerUserId);
            selectStmt.setDate(2, currentDate);
            ResultSet resultSet = selectStmt.executeQuery();

            if (resultSet.next()) {
                // 기존 데이터가 있을 경우 count 증가 및 average 업데이트
                int currentCount = resultSet.getInt("count");
                float currentAverage = resultSet.getFloat("average");

                int newCount = currentCount + 1;
                float newAverage = ((currentAverage * currentCount) + stressScore) / newCount;

                String updateQuery = "UPDATE daily_stress SET count = ?, average = ? WHERE worker_id = ? AND date = ?";
                PreparedStatement updateStmt = connection.prepareStatement(updateQuery);
                updateStmt.setInt(1, newCount);
                updateStmt.setFloat(2, newAverage);
                updateStmt.setString(3, workerUserId);
                updateStmt.setDate(4, currentDate);
                updateStmt.executeUpdate();
                updateStmt.close();
            } else {
                // 데이터가 없을 경우 새로운 row 삽입
                String insertQuery = "INSERT INTO daily_stress (worker_id, date, count, average) VALUES (?, ?, ?, ?)";
                PreparedStatement insertStmt = connection.prepareStatement(insertQuery);
                insertStmt.setString(1, workerUserId);
                insertStmt.setDate(2, currentDate);
                insertStmt.setInt(3, 1); // 첫 카운트
                insertStmt.setFloat(4, stressScore); // 첫 평균 값은 첫 점수로 설정
                insertStmt.executeUpdate();
                insertStmt.close();
            }
            resultSet.close();
            selectStmt.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }


    @GetMapping("/api/GET/detail/{worker_id}/data_period")
    public String getDataForPeriod(
            @PathVariable String worker_id,
            @RequestParam String start_time,
            @RequestParam String end_time) {

        try {
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) return "Database connection failed";

            // 데이터를 저장할 변수 초기화
            StringBuilder days = new StringBuilder();
            StringBuilder stressAverages = new StringBuilder();
            StringBuilder focusCounts = new StringBuilder();

            // daily_focus 테이블에서 데이터 조회
            String focusQuery = "SELECT date, count FROM daily_focus WHERE worker_id = ? AND date BETWEEN ? AND ?";
            PreparedStatement focusStmt = connection.prepareStatement(focusQuery);
            focusStmt.setString(1, worker_id);
            focusStmt.setString(2, start_time);
            focusStmt.setString(3, end_time);
            ResultSet focusRs = focusStmt.executeQuery();

            // focus 데이터를 days와 focusCounts에 추가
            while (focusRs.next()) {
                if (days.length() > 0) {
                    days.append(",");
                    focusCounts.append(",");
                }
                days.append(focusRs.getString("date"));
                focusCounts.append(focusRs.getInt("count"));
            }
            focusRs.close();
            focusStmt.close();

            // daily_stress 테이블에서 데이터 조회 (average 가져오기)
            String stressQuery = "SELECT date, average FROM daily_stress WHERE worker_id = ? AND date BETWEEN ? AND ?";
            PreparedStatement stressStmt = connection.prepareStatement(stressQuery);
            stressStmt.setString(1, worker_id);
            stressStmt.setString(2, start_time);
            stressStmt.setString(3, end_time);
            ResultSet stressRs = stressStmt.executeQuery();

            // stress 데이터를 stressAverages에 추가 (days에 맞춰 매핑)
            while (stressRs.next()) {
                if (stressAverages.length() > 0) {
                    stressAverages.append(",");
                }
                stressAverages.append(stressRs.getFloat("average"));
            }
            stressRs.close();
            stressStmt.close();

            // JSON 데이터 생성
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode resultJson = mapper.createObjectNode();
            resultJson.put("day", days.toString());
            resultJson.put("stress", stressAverages.toString());
            resultJson.put("concentration", focusCounts.toString());

            return resultJson.toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error fetching data for period";
        }
    }


}
