#include <ArduinoJson.h>
#include <SoftwareSerial.h>

#define RX 2
#define TX 3

SoftwareSerial ESP01(RX, TX); // RX, TX 핀 정의
const char* SSID = "ASUS_A8_2.4G"; // Wi-Fi 네트워크 이름
const char* PASSWORD = "bgbg-0112"; // Wi-Fi 비밀번호
const char* SERVER_IP = "192.168.1.30"; // 서버 IP 주소
const int SERVER_PORT = 8080; // 서버 포트 번호

void setup() {
  Serial.begin(9600);
  ESP01.begin(9600); // ESP01의 시리얼 통신 속도 설정

  connectToWiFi(SSID, PASSWORD);
}

void loop() {
  // 전송할 JSON 파일 만들기
  StaticJsonDocument<200> doc;
  doc["Device"] = "EEG_No.1";

  JsonArray EEG_Array = doc.createNestedArray("EEG_Data(HZ)");
  EEG_Array.add(1);
  EEG_Array.add(2);
  EEG_Array.add(3);
  EEG_Array.add(4);

  // 전송할 JSON 파일을 String으로 변환
  String sendData;
  serializeJson(doc, sendData);

  sendDataToServer(sendData);

  delay(5000);
}

void connectToWiFi(const char* ssid, const char* password) {
  ESP01.println("AT+CWJAP=\"" + String(ssid) + "\",\"" + String(password) + "\"");

  long int time = millis();
  while ((time + 15000) > millis()) {
    if (ESP01.available()) {
      String response = ESP01.readString();
      Serial.println(response);
      if (response.indexOf("OK") != -1) {
        Serial.println("Connected to WiFi");
        return;
      }
    }
  }
  
  Serial.println("Failed to connect to WiFi");
}

void sendDataToServer(const String& jsonData) {
  // busy 상태 해제 대기 함수
  while (ESP01.available()) {
    String response = ESP01.readString();
    if (response.indexOf("busy") == -1) {
      break; // busy 상태가 아니면 루프 종료
    }
  }

  // 서버 연결 시작
  ESP01.println("AT+CIPSTART=\"TCP\",\"" + String(SERVER_IP) + "\"," + String(SERVER_PORT));
  delay(2000);

  // POST 요청 구성
  String postRequest = "POST /api HTTP/1.1\r\n";
  postRequest += "Host: " + String(SERVER_IP) + "\r\n";
  postRequest += "Content-Type: application/json\r\n";
  postRequest += "Content-Length: " + String(jsonData.length()) + "\r\n\r\n";
  postRequest += jsonData;

  ESP01.println("AT+CIPSEND=" + String(postRequest.length()));
  delay(1000);

  // 데이터 전송
  ESP01.print(postRequest);
  
  long int time = millis();
  while ((time + 5000) > millis()) {
    if (ESP01.available()) {
      String response = ESP01.readString();
      Serial.println("Server Response: " + response);
      return;
    }
  }
  
  Serial.println("No response from server");
}
