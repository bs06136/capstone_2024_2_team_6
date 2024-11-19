package org.daniel.test111.controller;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class DataController {

    // 수신한 데이터를 저장할 전역 변수
    private String latestData;

    // POST 요청 처리
    @PostMapping
    public void postData(@RequestBody String jsonData) {
        latestData = jsonData;  // 최신 데이터를 저장
        System.out.println("Received: " + latestData);
    }

    // GET 요청 처리
    @GetMapping("/data")
    public String getData() {
        return latestData != null ? latestData : "No data received yet"; // 저장된 데이터 반환
    }
}

