package com.example.capstone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

@SpringBootApplication
public class CapstoneApplication {

    public static void main(String[] args) {
        SpringApplication.run(CapstoneApplication.class, args);

        // 데이터베이스 초기화
        DatabaseManager.initialize();

        // RestTemplate을 사용해 API 요청
        RestTemplate restTemplate = new RestTemplate();
        String baseUrl = "http://localhost:8080"; // 스프링 부트 애플리케이션이 실행 중인 URL

        try {
            // 1. /signal 엔드포인트 테스트
            String signalUrl = baseUrl + "/signal";
            String signalJson = "{\"user_id\":\"user1\", \"data\":\"sampledata\"}"; // JSON 형식 데이터
            ResponseEntity<String> signalResponse = restTemplate.postForEntity(signalUrl, signalJson, String.class);
            System.out.println("Signal API Response: " + signalResponse.getBody());

            // 2. /login 엔드포인트 테스트
            String loginUrl = baseUrl + "/login";
            String loginJson = "{\"user_id\":\"user1\", \"password\":\"password1\"}"; // 로그인 예제 JSON 데이터
            ResponseEntity<String> loginResponse = restTemplate.postForEntity(loginUrl, loginJson, String.class);
            System.out.println("Login API Response: " + loginResponse.getBody());

            // 3. /api/data 엔드포인트 테스트
            String dataUrl = baseUrl + "/api/data";
            String dataResponse = restTemplate.getForObject(dataUrl, String.class);
            System.out.println("Data API Response: " + dataResponse);

            // 4. /api/GET/data_renew 엔드포인트 테스트
            String dataRenewUrl = baseUrl + "/api/GET/data_renew?user_id=user1";
            String dataRenewResponse = restTemplate.getForObject(dataRenewUrl, String.class);
            System.out.println("Data Renew API Response: " + dataRenewResponse);

            // 5. /api/GET/detail/{user_id}/info 엔드포인트 테스트
            String userInfoUrl = baseUrl + "/api/GET/detail/user1/info";
            String userInfoResponse = restTemplate.getForObject(userInfoUrl, String.class);
            System.out.println("User Info API Response: " + userInfoResponse);

            // 6. /api/GET/detail/{user_id}/data 엔드포인트 테스트
            String userDataUrl = baseUrl + "/api/GET/detail/user1/data";
            String userDataResponse = restTemplate.getForObject(userDataUrl, String.class);
            System.out.println("User Data API Response: " + userDataResponse);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error testing API endpoints.");
        }
    }
}
