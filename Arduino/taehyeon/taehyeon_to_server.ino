#include <SoftwareSerial.h>
#include <arduinoFFT.h>
#include <ArduinoJson.h>

#define RX 2  // 아두이노의 RX 핀 (ESP-01의 TX에 연결)
#define TX 3  // 아두이노의 TX 핀 (ESP-01의 RX에 연결)
#define SAMPLE_RATE 256
#define BAUD_RATE 115200
#define INPUT_PIN A0

const char* ssid = "2ghome";
const char* password = "zxc123bs";
const char* server = "capstonedesign.duckdns.org";
const int port = 8080;

#define samples 256
#define SAMPLE_TIME 2

float vReal[samples];
float vImag[samples];
ArduinoFFT<float> FFT = ArduinoFFT<float>(vReal, vImag, samples, SAMPLE_RATE);

SoftwareSerial espSerial(RX, TX); // ESP-01과 통신할 소프트웨어 시리얼

float EEG_data[40];
int fileCounter = 1;

void setup() {
    Serial.begin(BAUD_RATE);
    espSerial.begin(9600); // ESP-01 통신 속도

    // Wi-Fi 연결
    sendATCommand("AT+RST", 1000);  // ESP-01 리셋
    sendATCommand("AT+CWMODE=1", 1000);  // Station 모드
    sendATCommand("AT+CWJAP=\"" + String(ssid) + "\",\"" + String(password) + "\"", 5000);  // Wi-Fi 연결
}

void loop() {
    collectEEGData();
    send_EEG_DATA();
    delay(1000);
}

// EEG 데이터 수집 및 FFT 적용
void collectEEGData() {
    unsigned long past = 0;
    float sum = 0.0;

    for (int i = 0; i < samples; i++) {
        unsigned long present = micros();
        unsigned long interval = present - past;
        past = present;

        // 샘플링
        int sensor_value = analogRead(INPUT_PIN);
        sum += sensor_value;
        vReal[i] = sensor_value;
        vImag[i] = 0.0;
    }

    // DC 오프셋 제거 및 FFT 계산
    float dc_offset = sum / samples;
    for (int i = 0; i < samples; i++) {
        vReal[i] -= dc_offset;
    }

    FFT.windowing(FFTWindow::Hamming, FFTDirection::Forward);
    FFT.compute(FFTDirection::Forward);
    FFT.complexToMagnitude();

    // 40Hz 이하 데이터 수집
    for (int j = 0; j < samples / 2; j++) {
        float frequency = (float)j * SAMPLE_RATE / samples;
        if (frequency < 40) {
            EEG_data[j] = vReal[j] / samples;
        }
    }
}

void send_EEG_DATA() {
    StaticJsonDocument<300> jsonDoc;
    JsonArray eegArray = jsonDoc.createNestedArray("EEG_data");

    // 파일 이름을 "sampledata1.json", "sampledata2.json" 등으로 설정
    char fileName[20];
    memset(fileName, 0, sizeof(fileName)); // 파일 이름 변수 초기화
    sprintf(fileName, "sampledata%d.json", fileCounter); // 파일 번호 형식 지정
    jsonDoc["file_name"] = String(fileName);

    for (int i = 0; i < 40; i++) {
        eegArray.add(EEG_data[i] / SAMPLE_TIME);
        EEG_data[i] = 0.0;
    }

    String jsonData;
    serializeJson(jsonDoc, jsonData);

    // HTTP 요청 생성
    String httpRequest = "POST /signal HTTP/1.1\r\n";
    httpRequest += "Host: capstonedesign.duckdns.org\r\n";
    httpRequest += "Content-Type: application/json\r\n";
    httpRequest += "Content-Length: " + String(jsonData.length()) + "\r\n";
    httpRequest += "Connection: close\r\n\r\n"; // 헤더 종료 표시
    httpRequest += jsonData; // JSON 데이터 추가

    // 서버 연결
    sendATCommand("AT+CIPSTART=\"TCP\",\"capstonedesign.duckdns.org\",8080", 3000);
    delay(1000);

    // 데이터 전송 준비
    sendATCommand("AT+CIPSEND=" + String(httpRequest.length()), 1000);
    delay(100);

    // HTTP 요청 전송
    espSerial.print(httpRequest);

    // 연결 종료 명령
    delay(500); // 서버가 응답할 시간을 줍니다.
    sendATCommand("AT+CIPCLOSE", 1000); // 연결 종료

    // 파일 카운터 증가
    fileCounter++; // 전송 후 파일 번호를 1씩 증가시킴
}


// AT 명령어 전송 함수
void sendATCommand(String command, const int timeout) {
    espSerial.println(command);
    long int time = millis();
    while ((time + timeout) > millis()) {
        while (espSerial.available()) {
            char c = espSerial.read();
            Serial.write(c); // 시리얼 모니터에 ESP-01 응답 출력
        }
    }
}
