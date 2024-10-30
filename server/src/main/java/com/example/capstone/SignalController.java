package com.example.capstone;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SignalController {

    // GET 요청을 처리할 엔드포인트 생성
    @GetMapping("/signal")
    public String receiveSignal(@RequestParam("value") String value) {
        // 외부에서 받은 값을 그대로 응답으로 반환a
        return value;
    }
}
