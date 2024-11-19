#include <arduinoFFT.h>

#define BAUD_RATE 115200  // 시리얼 통신 속도
#define SAMPLE_RATE 128  // total 출력 및 증가 주파수
#define INPUT_PIN A0 //아두이노에 꽂혀있는 핀 위치 

#define SAMPLES 512 //fft에 사용할 샘플 갯수 
#define NOTCH_FREQ 60.0 //노치필터로 감소시킬 주파수 
#define QUALITY_FACTOR 30.0 //노치필터 범위. 범위는 NOTCH_FREQ/QUALITY_FACTOR임. 약 2hz 

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
float notchB0 = 0.9999;
float notchB1 = -1.965;
float notchB2 = 1.0;
float notchA0 = 0.99;
float notchA1 = -1.955;
float notchA2 = 1.0;

float u[3] = {0.0, 0.0, 0.0}; // 입력 이력
float y[3] = {0.0, 0.0, 0.0}; // 출력 이력

void setup() {
  Serial.begin(BAUD_RATE);
  analogReadResolution(14);
  for(int i = 0; i < SAMPLES; i++) {
    vReal[i] = 0.0;
    vImag[i] = 0.0; //허수 부분 0으로 세팅
  }
}

void loop() {
  unsigned long currentTimer = micros();  // 현재 타이머 값

  // 10Hz마다 total 출력 및 증가
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
    total = total/SAMPLES;
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

}
float notchFilter(float input) {
    // 입력 및 출력 이력 이동
    u[2] = u[1];
    u[1] = u[0];
    u[0] = input;

    y[2] = y[1];
    y[1] = y[0];

    // Apply notch filter formula
    y[0] = notchB0 * u[0] + notchB1 * u[1] + notchB2 * u[2] - notchA1 * y[1] - notchA2 * y[2];

    return y[0];
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
  for(int i = 0; i < SAMPLE_RATE/2; i++) {
    Serial.print(i);
    Serial.print(" : ");
    Serial.println( vReal[i]/SAMPLES); // + vReal[i+1] + vReal[i+2] + vReal[i+3])

  }
  for(int i = 0; i < SAMPLES; i++) {
    vReal[i] = 0.0;
    vImag[i] = 0.0;
  }
    //delay(300);
}