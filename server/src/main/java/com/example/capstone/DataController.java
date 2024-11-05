package com.example.capstone;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@RestController
public class DataController {

    @GetMapping("/api/GET/data_renew")
    public String getDataRenew(@RequestParam String user_id) {
        try {
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) return "Database connection failed";

            String query = "SELECT data_string FROM sample_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 1";
            PreparedStatement stmt = connection.prepareStatement(query);
            stmt.setString(1, user_id);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return rs.getString("data_string");
            }
            return "No data found for user " + user_id;
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

    @GetMapping("/api/GET/detail/{user_id}/data")
    public String getUserData(@PathVariable String user_id) {
        try {
            Connection connection = DatabaseManager.getConnection();
            if (connection == null) return "Database connection failed";

            String matchQuery = "SELECT arduino_user_id FROM matching WHERE worker_user_id = ?";
            PreparedStatement matchStmt = connection.prepareStatement(matchQuery);
            matchStmt.setString(1, user_id);
            ResultSet matchRs = matchStmt.executeQuery();

            if (!matchRs.next()) {
                return "No Arduino ID found for user " + user_id;
            }
            String arduinoUserId = matchRs.getString("arduino_user_id");

            String dataQuery = "SELECT data_string FROM sample_data WHERE user_id = ? ORDER BY date_time DESC LIMIT 10";
            PreparedStatement dataStmt = connection.prepareStatement(dataQuery);
            dataStmt.setString(1, arduinoUserId);
            ResultSet dataRs = dataStmt.executeQuery();

            ObjectMapper mapper = new ObjectMapper();
            ObjectNode json = mapper.createObjectNode();
            int count = 1;
            while (dataRs.next()) {
                json.put("data_" + count, dataRs.getString("data_string"));
                count++;
            }

            return json.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error fetching user data";
        }
    }
}
