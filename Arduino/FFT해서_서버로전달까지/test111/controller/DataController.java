package org.daniel.test111.controller;

import org.daniel.test111.entity.DataEntity;
import org.daniel.test111.repository.DataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class DataController {

    @Autowired
    private DataRepository dataRepository;  // 데이터 리포지토리 주입

    // POST 요청 처리
    @PostMapping
    public void postData(@RequestBody String jsonData) {
        DataEntity dataEntity = new DataEntity();
        dataEntity.setJsonData(jsonData);
        dataRepository.save(dataEntity);  // 데이터 저장
        System.out.println("Received: " + jsonData);
    }

    // GET 요청 처리
    @GetMapping("/data")
    public DataEntity getLatestData() {
        DataEntity latestData = dataRepository.findLatestData();
        return latestData != null ? latestData : new DataEntity(); // 최근 데이터 반환 (없을 경우 빈 객체)
    }
}
