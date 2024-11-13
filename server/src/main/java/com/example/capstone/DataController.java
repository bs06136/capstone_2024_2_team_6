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

            // 각 매칭된 아두이노 장치의 가장 최근 sample_data 조회
            while (matchRs.next()) {
                String workerUserId = matchRs.getString("worker_user_id");
                String arduinoUserId = matchRs.getString("arduino_user_id");

                // sample_data 테이블에서 arduino_user_id별 가장 최근 데이터 조회
                String sampleDataQuery = "SELECT data_string FROM sample_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 1";
                PreparedStatement sampleDataStmt = connection.prepareStatement(sampleDataQuery);
                sampleDataStmt.setString(1, arduinoUserId);
                ResultSet sampleDataRs = sampleDataStmt.executeQuery();

                // JSON 객체에 추가
                if (sampleDataRs.next()) {
                    String dataString = sampleDataRs.getString("data_string");

                    // JSON 객체에 device_id를 키로, "worker_id, data" 형식의 값을 추가
                    String value = workerUserId + ", " + dataString;
                    resultJson.put(arduinoUserId, value);
                }

                sampleDataStmt.close();
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

    @GetMapping("/api/GET/detail/{device_id}/data")
    public String getDeviceData(@PathVariable String device_id) {
        try {
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) return "Database connection failed";

            // sample_data 테이블에서 device_id별로 가장 최근 10개의 데이터를 조회
            String dataQuery = "SELECT data_string FROM sample_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 10";
            PreparedStatement dataStmt = connection.prepareStatement(dataQuery);
            dataStmt.setString(1, device_id);
            ResultSet dataRs = dataStmt.executeQuery();

            // JSON 형식으로 데이터 반환
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode json = mapper.createObjectNode();
            int count = 1;
            while (dataRs.next()) {
                json.put("data_" + count, dataRs.getString("data_string"));
                count++;
            }

            dataStmt.close();
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
                String updateQuery = "UPDATE worker SET name = ?, detail = ?, option_value = ? WHERE user_id = ?";
                PreparedStatement updateStmt = connection.prepareStatement(updateQuery);
                updateStmt.setString(1, workerName);
                updateStmt.setString(2, detail);
                updateStmt.setInt(3, option);
                updateStmt.setString(4, userId);
                updateStmt.executeUpdate();
                updateStmt.close();
                return "Worker information updated successfully.";
            } else {
                // 새 근무자 정보 추가
                String insertQuery = "INSERT INTO worker (user_id, name, detail, option_value) VALUES (?, ?, ?, ?)";
                PreparedStatement insertStmt = connection.prepareStatement(insertQuery);
                insertStmt.setString(1, userId);
                insertStmt.setString(2, workerName);
                insertStmt.setString(3, detail);
                insertStmt.setInt(4, option);
                insertStmt.executeUpdate();
                insertStmt.close();
                return "Worker information added successfully.";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing worker enrollment";
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
                return "Device information updated successfully.";
            } else {
                // 새 장비 정보 추가
                String insertQuery = "INSERT INTO arduino (device_id) VALUES (?)";
                PreparedStatement insertStmt = connection.prepareStatement(insertQuery);
                insertStmt.setString(1, deviceId);
                insertStmt.executeUpdate();
                insertStmt.close();
                return "Device information added successfully.";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing device enrollment";
        }
    }

    @PostMapping("/api/POST/initial_data")
    public String receiveInitialData(@RequestBody String jsonData) {
        try {
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
                    return "true";
                } else {
                    return "Error: admin_id not found";
                }
            } else {
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
            // 전달받은 JSON 데이터를 터미널에 출력
            System.out.println("Received JSON data: " + jsonData);

            // JSON 데이터를 파싱
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonData);

            // 필요한 데이터 추출
            int arduinoId = rootNode.path("ID").asInt(); // 아두이노 ID를 int로 처리
            String eegData = rootNode.path("DATA").toString(); // JSON 배열을 문자열로 변환

            if (arduinoId == 0) {
                return "Invalid arduino ID";
            }

            // 데이터베이스 연결
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) {
                return "Database connection failed";
            }

            // 가장 최근 날짜와 data_order를 조회
            String selectQuery = "SELECT date_time, data_order FROM sample_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 1";
            PreparedStatement selectStmt = connection.prepareStatement(selectQuery);
            selectStmt.setInt(1, arduinoId); // 아두이노 ID를 int로 설정
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
            insertStmt.setInt(1, arduinoId); // 아두이노 ID를 int로 설정

            // LocalDateTime을 Timestamp로 변환하여 삽입
            insertStmt.setTimestamp(2, Timestamp.valueOf(currentDateTime));
            insertStmt.setInt(3, dataOrder);
            insertStmt.setString(4, eegData); // JSON 배열을 문자열로 저장

            // 쿼리 실행
            insertStmt.executeUpdate();
            insertStmt.close();

            return "Data saved successfully for arduino " + arduinoId + " with data order " + dataOrder;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing the request";
        }
    }

}
