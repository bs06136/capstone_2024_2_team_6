package com.example.capstone;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class DataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        // 필요한 초기 설정이 있으면 여기에 추가
    }

    @Test
    public void testLoginSuccess() throws Exception {
        mockMvc.perform(get("/api/GET/login")
                        .param("user_id", "user1")
                        .param("password", "password1"))
                .andExpect(status().isOk())
                .andExpect(content().string("12345")); // 성공 시 반환될 것으로 예상되는 NUM 값을 확인
    }

    @Test
    public void testDataRenew() throws Exception {
        mockMvc.perform(get("/api/GET/data_renew")
                        .param("user_id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testGetUserInfo() throws Exception {
        mockMvc.perform(get("/api/GET/detail/{user_id}/info", "worker1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").exists())
                .andExpect(jsonPath("$.detail").exists())
                .andExpect(jsonPath("$.option_value").exists());
    }

    @Test
    public void testGetUserData() throws Exception {
        mockMvc.perform(get("/api/GET/detail/{user_id}/data", "worker1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    public void testEnrollOrUpdateWorker() throws Exception {
        String jsonData = objectMapper.writeValueAsString(new WorkerRequest("worker1", "John Doe", "Engineer", 1));

        mockMvc.perform(post("/api/POST/user/enrollment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonData))
                .andExpect(status().isOk())
                .andExpect(content().string("Worker information updated successfully.")); // 또는 추가 성공 메시지
    }

    @Test
    public void testEnrollOrUpdateDevice() throws Exception {
        String jsonData = objectMapper.writeValueAsString(new DeviceRequest("device1", "Arduino Uno", "Main device"));

        mockMvc.perform(post("/api/POST/device/enrollment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonData))
                .andExpect(status().isOk())
                .andExpect(content().string("Device information updated successfully.")); // 또는 추가 성공 메시지
    }

    // DTO 클래스 정의 (테스트에서 사용하는 요청 데이터 형식을 위한 클래스)
    static class WorkerRequest {
        public String user_id;
        public String worker_name;
        public String detail;
        public int option;

        public WorkerRequest(String user_id, String worker_name, String detail, int option) {
            this.user_id = user_id;
            this.worker_name = worker_name;
            this.detail = detail;
            this.option = option;
        }
    }

    static class DeviceRequest {
        public String device_id;
        public String device_name;
        public String device_description;

        public DeviceRequest(String device_id, String device_name, String device_description) {
            this.device_id = device_id;
            this.device_name = device_name;
            this.device_description = device_description;
        }
    }
}
