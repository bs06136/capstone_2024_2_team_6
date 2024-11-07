package com.example.capstone;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class testController {

    @GetMapping("/GET/1234/data")
    public Map<String, Object> testJson() {
        // JSON 형태로 반환할 데이터를 생성
        Map<String, Object> response = new HashMap<>();
        response.put("name", "John Doe");
        response.put("age", 30);
        response.put("deviceId",1234);
        response.put("detailData", "hello world");
        System.out.println("Access");

        return response;
    }
    @PostMapping("/POST/user/enrollment")
    public Map<String, Object> saveData(@RequestBody Map<String, Object> requestData) {
        // 받은 데이터를 콘솔에 출력
        System.out.println("Received POST data: " + requestData);

        // 응답을 생성하여 반환
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Data received successfully");

        return response;
    }
}
