#include <SPI.h>
#include <MFRC522.h>
#include <SoftwareSerial.h>
#include <arduinoFFT.h>
#include <ArduinoJson.h>

// 핀 및 상수 정의
#define RST_PIN 9
#define SS_PIN 10
#define RX 2 // 아두이노의 RX 핀 (ESP-01의 TX에 연결)
#define TX 3 // 아두이노의 TX 핀 (ESP-01의 RX에 연결)
#define SAMPLE_RATE 256
#define BAUD_RATE 115200
#define INPUT_PIN A0
#define SAMPLES 256
#define SAMPLE_TIME 2

// Wi-Fi 및 서버 정보
const char* ssid = "ASUS_A8_2.4G";
const char* password = "bgbg-0112";
const char* server = "192.168.1.30";
const int port = 8080;

MFRC522 mfrc(SS_PIN, RST_PIN);
float vReal[SAMPLES];
float vImag[SAMPLES];
ArduinoFFT<float> FFT = ArduinoFFT<float>(vReal, vImag, SAMPLES, SAMPLE_RATE);
SoftwareSerial espSerial(RX, TX);

float EEG_data[40];
int fileCounter = 1;

String rfid_id = "";
int arduino_id = 201;
bool rfid_scanned = false;

// 함수 프로토타입 선언
void sendATCommand(String command, const int timeout);
bool readRFID();
void collectEEGData();
void send_EEG_DATA();
bool sendInitialData();

void setup() {
    Serial.begin(BAUD_RATE);
    SPI.begin();
    mfrc.PCD_Init();
    espSerial.begin(9600);

    // Wi-Fi 연결 설정
    sendATCommand("AT+RST", 1000);
    sendATCommand("AT+CWMODE=1", 1000);
    sendATCommand("AT+CWJAP=\"" + String(ssid) + "\",\"" + String(password) + "\"", 5000);
}

void loop() {
    if (!rfid_scanned) { // RFID 태그 대기
        rfid_scanned = readRFID(); // RFID를 읽고 성공 시 플래그 설정
        if (rfid_scanned && !sendInitialData()) { // 초기 데이터를 전송하고 실패 시
            rfid_scanned = false; // RFID 재스캔 대기
        }
    } else { // EEG 데이터 측정 및 전송
        collectEEGData();
        send_EEG_DATA();
        delay(1000);
    }
}

// RFID 태그를 읽는 함수
bool readRFID() {
    if (!mfrc.PICC_IsNewCardPresent() || !mfrc.PICC_ReadCardSerial()) {
        return false;
    }

    rfid_id = "";
    for (byte i = 0; i < mfrc.uid.size; i++) {
        rfid_id += String(mfrc.uid.uidByte[i], HEX);
    }
    Serial.print("RFID ID: ");
    Serial.println(rfid_id);
    return true;
}

// 초기 데이터를 서버로 전송하는 함수
bool sendInitialData() {
    StaticJsonDocument<200> jsonDoc;
    jsonDoc["arduino_id"] = String(arduino_id);
    jsonDoc["rfid_id"] = rfid_id;

    String jsonData;
    serializeJson(jsonDoc, jsonData);

    String httpRequest = "POST /api/POST/sample_data HTTP/1.1\r\n";
    httpRequest += "Host: " + String(server) + "\r\n";
    httpRequest += "Content-Type: application/json\r\n";
    httpRequest += "Content-Length: " + String(jsonData.length()) + "\r\n";
    httpRequest += "Connection: close\r\n\r\n";
    httpRequest += jsonData;

    sendATCommand("AT+CIPSTART=\"TCP\",\"" + String(server) + "\"," + String(port), 3000);
    delay(1000);
    sendATCommand("AT+CIPSEND=" + String(httpRequest.length()), 1000);
    delay(100);
    espSerial.print(httpRequest);

    delay(200);
    if (espSerial.find("true")) { // 서버로부터 성공 응답 확인
        sendATCommand("AT+CIPCLOSE", 1000);
        return true;
    }
    sendATCommand("AT+CIPCLOSE", 1000);
    return false;
}

// EEG 데이터 수집 함수
void collectEEGData() {
    unsigned long past = 0;
    float sum = 0.0;

    for (int i = 0; i < SAMPLES; i++) {
        unsigned long present = micros();
        unsigned long interval = present - past;
        past = present;

        int sensor_value = analogRead(INPUT_PIN);
        sum += sensor_value;
        vReal[i] = sensor_value;
        vImag[i] = 0.0;
    }

    float dc_offset = sum / SAMPLES;
    for (int i = 0; i < SAMPLES; i++) {
        vReal[i] -= dc_offset;
    }

    FFT.windowing(FFTWindow::Hamming, FFTDirection::Forward);
    FFT.compute(FFTDirection::Forward);
    FFT.complexToMagnitude();

    for (int j = 0; j < SAMPLES / 2; j++) {
        float frequency = (float)j * SAMPLE_RATE / SAMPLES;
        if (frequency < 40) {
            EEG_data[j] = vReal[j] / SAMPLES;
        }
    }
}

// EEG 데이터를 서버로 전송하는 함수
void send_EEG_DATA() {
    StaticJsonDocument<300> jsonDoc;
    JsonArray eegArray = jsonDoc.createNestedArray("DATA");
    jsonDoc["ID"] = String(arduino_id); // arduino_id를 전송 ID로 사용

    char fileName[20];
    memset(fileName, 0, sizeof(fileName));
    sprintf(fileName, "sampledata%d.json", fileCounter);
    jsonDoc["file_name"] = String(fileName);

    for (int i = 0; i < 40; i++) {
        eegArray.add(EEG_data[i] / SAMPLE_TIME);
        EEG_data[i] = 0.0;
    }

    String jsonData;
    serializeJson(jsonDoc, jsonData);

    String httpRequest = "POST /api/POST/sample_data HTTP/1.1\r\n";
    httpRequest += "Host: " + String(server) + "\r\n";
    httpRequest += "Content-Type: application/json\r\n";
    httpRequest += "Content-Length: " + String(jsonData.length()) + "\r\n";
    httpRequest += "Connection: close\r\n\r\n";
    httpRequest += jsonData;

    sendATCommand("AT+CIPSTART=\"TCP\",\"" + String(server) + "\"," + String(port), 3000);
    delay(1000);
    sendATCommand("AT+CIPSEND=" + String(httpRequest.length()), 1000);
    delay(100);
    espSerial.print(httpRequest);

    delay(500);
    sendATCommand("AT+CIPCLOSE", 1000);
    fileCounter++;
}

// AT 명령어 전송 함수
void sendATCommand(String command, const int timeout) {
    espSerial.println(command);
    long int time = millis();
    while ((time + timeout) > millis()) {
        while (espSerial.available()) {
            char c = espSerial.read();
            Serial.write(c);
        }
    }
}
