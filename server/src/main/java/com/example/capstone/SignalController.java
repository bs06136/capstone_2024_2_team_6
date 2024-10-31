package com.example.capstone;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SignalController {

    @PostMapping("/signal")
    public String receiveSignal(
            @RequestBody String jsonData,
            @RequestHeader(value = "ID", required = false) String id,
            @RequestHeader(value = "Unique-Number", required = false) String uniqueNumber
    ) {
        try {
            // "sampledata"가 포함된 경우 SampleDataHandler를 사용하여 처리
            if (jsonData.contains("sampledata")) {
                return SampleDataHandler.saveSampleData(jsonData);
            }
            // ID와 Unique-Number가 모두 제공된 경우, 세션 검증 후 처리
            else if (id != null && uniqueNumber != null) {
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
}
