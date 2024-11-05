
#include <arduinoFFT.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>
#include <SPI.h>
#include <MFRC522.h>

#define BAUD_RATE 9600  // 시리얼 통신 속도
#define SAMPLE_RATE 256  // total 출력 및 증가 주파수 (10Hz)
#define INPUT_PIN A0 //아두이노에 꽂혀있는 핀 위치 

#define SAMPLES 1024 //fft에 사용할 샘플 갯수 
#define NOTCH_FREQ 60.0 //노치필터로 감소시킬 주파수 
#define QUALITY_FACTOR 20.0 //노치필터 범위. 범위는 NOTCH_FREQ/QUALITY_FACTOR임. 약 2hz 

#define RX 2
#define TX 3

#define SS_PIN 10   // SDA 핀을 D10에 연결
#define RST_PIN 9   // RST 핀을 D9에 연결

MFRC522 rfid(SS_PIN, RST_PIN); // MFRC522 객체 생성

float vReal[SAMPLES];
float vImag[SAMPLES];

ArduinoFFT<float> FFT = ArduinoFFT<float>(vReal, vImag, SAMPLES, SAMPLE_RATE);

//타이머 변수 
unsigned long prevTimer = 0;  // 이전 타이머 값
unsigned long timerInterval = 1000000 / SAMPLE_RATE; 

//전처리용 데이터
float tempForFilter[SAMPLES];
int iTemp = 0;

// Notch 변수
float w0 = 2.0 * PI * NOTCH_FREQ / SAMPLE_RATE;
float alpha = sin(w0) / (2.0 * QUALITY_FACTOR);
float b0 = 1.0;
float b1 = -2.0 * cos(w0);
float b2 = 1.0;
float a1 = 1.0 + alpha;
float a2 = -2.0 * cos(w0);

float x1 = 0.0, x2 = 0.0;
float y_1 = 0.0, y2 = 0.0;

SoftwareSerial ESP01(RX, TX); // RX, TX 핀 정의
const char* SSID = "ASUS_A8_2.4G"; // Wi-Fi 네트워크 이름
const char* PASSWORD = "bgbg-0112"; // Wi-Fi 비밀번호
const char* SERVER_IP = "192.168.1.30"; // 서버 IP 주소
const int SERVER_PORT = 8080; // 서버 포트 번호

char UID[20] = "UnKnown";

void setup() {
  Serial.begin(BAUD_RATE);
  SPI.begin();         // SPI 통신 시작
  rfid.PCD_Init();     // MFRC522 초기화
  ESP01.begin(9600); // ESP01의 시리얼 통신 속도 설정
  analogReadResolution(14);

  while(!readRFID()) {
    delay(100);
  }
  
  connectToWiFi(SSID, PASSWORD);
  
  for(int i = 0; i < SAMPLES; i++) {
    vReal[i] = 0.0;
    vImag[i] = 0.0; //허수 부분 0으로 세팅
  }
}

void loop() {
  unsigned long currentTimer = micros();  // 현재 타이머 값

  
  if (currentTimer - prevTimer >= timerInterval) {
    prevTimer = currentTimer;
//_______ 이 안이 타이머. 주파수에 맞춰서 작동함. 
//아날로그 read
    tempForFilter[iTemp++] = analogRead(INPUT_PIN);
  }
  
  //_____________________timer END

  if(iTemp == SAMPLES) {

    iTemp = 0; //인덱스 초기화 
    float total = 0;

    for(int i = 0; i < SAMPLES; i++) {
      total += tempForFilter[i];
    }
    total = total/SAMPLES; //평균값 계산

    for(int i = 0; i < SAMPLES; i++) {
      tempForFilter[i] = tempForFilter[i] - total;
    }
    //_____dc 제거 end______________________________

    for(int i = 0; i < SAMPLES; i++) {
      tempForFilter[i] = notchFilter(tempForFilter[i]);//Notch Filter 
      tempForFilter[i] = ButterFilter(tempForFilter[i]);//Butter Filter
    }
    //____필터링 end___________________________________ 

    for(int i = 0; i < SAMPLES; i++) {
      vReal[i] = tempForFilter[i]; //필터링 된 값 전달하기. 
    }

    //FFT 
    FFT.windowing(FFTWindow::Hamming, FFTDirection::Forward);	
    FFT.compute(FFTDirection::Forward); 
    FFT.complexToMagnitude(); 

    valuePrint();
  }

}//end of loop()

float notchFilter(float input) {
    // 필터 출력 계산
    float output = (b0 / a1) * input + (b1 / a1) * x1 + (b2 / a1) * x2 - (a2 / a1) * y_1;

    // 이전 샘플 업데이트
    x2 = x1;
    x1 = input;
    y2 = y_1;
    y_1 = output;

    return output;
}

float ButterFilter(float input) {
	float output = input;
	{
		static float z1, z2; // filter section state
		float x = output - -0.95391350*z1 - 0.25311356*z2;
		output = 0.00735282*x + 0.01470564*z1 + 0.00735282*z2;
		z2 = z1;
		z1 = x;
	}
	{
		static float z1, z2; // filter section state
		float x = output - -1.20596630*z1 - 0.60558332*z2;
		output = 1.00000000*x + 2.00000000*z1 + 1.00000000*z2;
		z2 = z1;
		z1 = x;
	}
	{
		static float z1, z2; // filter section state
		float x = output - -1.97690645*z1 - 0.97706395*z2;
		output = 1.00000000*x + -2.00000000*z1 + 1.00000000*z2;
		z2 = z1;
		z1 = x;
	}
	{
		static float z1, z2; // filter section state
		float x = output - -1.99071687*z1 - 0.99086813*z2;
		output = 1.00000000*x + -2.00000000*z1 + 1.00000000*z2;
		z2 = z1;
		z1 = x;
	}
	return output;
}

void valuePrint() {
  float temp = 0;
  int counter = 0;

//json 형식으로 만들어서 서버로 전송 
  StaticJsonDocument<200> doc;
  doc["User"] = UID;
  doc["Device"] = "EEG_No.1";
  JsonArray EEG_Array = doc.createNestedArray("EEG_Data(HZ)");
  int total = 0;
  for(int i = 0; i < SAMPLES/2; i++) {
    total += vReal[i];
  }
  for(int i = 0; i < SAMPLES/2; i++) {
    temp += vReal[i];
    if(counter++ == 1 && EEG_Array.size() < 60) {
      EEG_Array.add(temp);
      counter = 0;
      temp = 0;
    }
  }
  String sendData;
  serializeJson(doc, sendData);

  for(int i = 0; i < SAMPLES; i++) {
    vReal[i] = 0.0;
    vImag[i] = 0.0;
  }
  sendDataToServer(sendData);
  //delay(100);
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
  delay(1000);

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
  while ((time + 1000) > millis()) {
    if (ESP01.available()) {
      String response = ESP01.readString();
      Serial.println("Server Response: " + response);
      return;
    }
  }
  
  Serial.println("No response from server");
}

boolean readRFID() {
  // 카드가 인식되지 않으면 UID 문자열을 초기화하고 함수 종료
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    Serial.print("!"); // 카드 미인식 시 "!" 출력
    return false;
  }

  UID[0] = '\0'; // UID 문자열 초기화

  // UID를 16진수 문자열로 변환하여 uidStr에 저장
  for (byte i = 0; i < rfid.uid.size; i++) {
    char hexDigit[3];
    sprintf(hexDigit, "%02X", rfid.uid.uidByte[i]);
    strcat(UID, hexDigit);
  }

  // 카드와 통신 종료
  rfid.PICC_HaltA();
  
  // UID 출력
  Serial.print("Card UID: ");
  Serial.println(UID);
  
  delay(1000); // 1초 대기
  
  return true; // 카드 인식 성공
}