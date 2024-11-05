package com.example.capstone;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.Comparator;

@RestController
public class SignalController {

    private static final String DIRECTORY_PATH = "test_data/";

    @PostMapping("/signal")
    public String receiveSignal(
            @RequestBody String jsonData,
            @RequestHeader(value = "ID", required = false) String id,
            @RequestHeader(value = "Unique-Number", required = false) String uniqueNumber
    ) {
        try {
            if (jsonData.contains("sampledata")) {
                return SampleDataHandler.saveSampleData(jsonData);
            } else if (id != null && uniqueNumber != null) {
                if (LoginHandler.validateSession(id, uniqueNumber)) {
                    return "Data processed for user " + id;
                } else {
                    return "Invalid session or unauthorized access";
                }
            } else {
                return "Unsupported file name or missing headers";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error processing the request";
        }
    }

    @PostMapping("/login")
    public String login(@RequestBody String jsonData) {
        return LoginHandler.processLoginAttempt(jsonData);
    }

    @GetMapping("/api/data")
    public String getLatestData() {
        try {
            File folder = new File(DIRECTORY_PATH);
            File[] files = folder.listFiles((dir, name) -> name.startsWith("sampledata_") && name.endsWith(".json"));

            if (files == null || files.length == 0) {
                return "No data files found";
            }

            File latestFile = Arrays.stream(files)
                    .max(Comparator.comparingInt(file -> {
                        String[] parts = file.getName().replace("sampledata_", "").replace(".json", "").split("_");
                        return Integer.parseInt(parts[1]);
                    }))
                    .orElseThrow();

            String jsonData = new String(Files.readAllBytes(latestFile.toPath()));
            return jsonData;
        } catch (IOException e) {
            e.printStackTrace();
            return "Error reading the latest data file";
        }
    }
}
