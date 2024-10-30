#include <arduinoFFT.h>

#define SAMPLE_RATE 256  // 샘플링 속도
#define BAUD_RATE 115200  // 시리얼 통신 속도
#define INPUT_PIN A0      // 센서 입력 핀

// FFT variable 
#define samples 256  
#define SAMPLE_TIME 2
// 샘플의 개수는 2의 n승이여야 FFT가 최대 효율이 나오므로 
// 5초간의 데이터 수집을 할 예정. 

// Notch filter variables
#define NOTCH_FREQ 60.0    // 노치 주파수 (Hz)
#define QUALITY_FACTOR 30.0 // 품질 계수 (Q)

// FFT variable 
float vReal[samples];
float vImag[samples];

ArduinoFFT<float> FFT = ArduinoFFT<float>(vReal, vImag, samples, SAMPLE_RATE);

// Notch filter variables
float b0, b1, b2, a1, a2;
float w0;  
float alpha;  
float x1 = 0.0, x2 = 0.0;  // 이전 입력 샘플
float y1_filter = 0.0, y2 = 0.0;  // 이전 출력 샘플 (y1 이름 변경)

//출력용 EEG data. SAMPLE_TIME만큼 샘플링을 함. 
float EEG_data[40];

void setup() {
    // Notch set up
    w0 = 2.0 * PI * NOTCH_FREQ / SAMPLE_RATE;
    alpha = sin(w0) / (2.0 * QUALITY_FACTOR);
    b0 = 1.0;
    b1 = -2.0 * cos(w0);
    b2 = 1.0;
    a1 = 1.0 + alpha;
    a2 = -2.0 * cos(w0);
    
    Serial.begin(BAUD_RATE);
}

void loop() {
    static long timer = 0;
    static unsigned long past = 0;
    unsigned long present;
    float sensor_value;
    float sum = 0.0; // DC 오프셋 계산을 위한 합계 변수

    // 샘플 수집 및 DC 오프셋 계산
    for (int i = 0; i < samples; i++) {
        present = micros();
        unsigned long interval = present - past;
        past = present;

        // Run timer
        timer -= interval;

        // Sample
        if (timer < 0) { 
          //timer의 목적은 loop가 돌면서 지정된 HZ이상으로 샘플링을 하지 못하게 막는 목적. 
            timer += 1000000 / SAMPLE_RATE;

            sensor_value = analogRead(INPUT_PIN);
            sum += sensor_value; // DC 오프셋 계산을 위한 합계 누적
            vReal[i] = sensor_value;
            vImag[i] = 0.0; // 복소수의 허수 부분
        }
    }

    // DC 오프셋 제거
    float dc_offset = sum / samples;
    for (int i = 0; i < samples; i++) {
        vReal[i] -= dc_offset; // 신호에서 DC 오프셋 제거
        float signal = notchFilter(vReal[i]); //노치필터 적용
        float filtered_signal = butterFilter(signal); //버터워스필터 적용 
        vReal[i] = filtered_signal; // FFT에 사용할 신호
    }
//____________________________________________________________
    // FFT 계산
    FFT.windowing(FFTWindow::Hamming, FFTDirection::Forward);	
    FFT.compute(FFTDirection::Forward); 
    FFT.complexToMagnitude(); 

    // 100Hz 미만 주파수 영역에 대한 데이터 출력
    for (int j = 0; j < samples / 2; j++) { // j = 1부터 시작하여 0 주파수는 제외
        float frequency = (float)j * SAMPLE_RATE / samples; // 주파수 계산
        if(frequency < 40) { //40HZ 미만 데이터만 출력 
          float magnitude = vReal[j]; // 진폭 가져오기
          EEG_data[j] += magnitude/samples; // 샘플갯수로 진폭을 나눔. 측정 시간이 길어짐에 따라 주파수가 지저분해지는거 예방. 

          
        }
    }
    print_EEG_DATA();
    
    delay(1000); // 1초마다 결과 출력
}

// 노치 필터 적용
float notchFilter(float input) {
    float output = (b0 / a1) * input + (b1 / a1) 
                    * x1 + (b2 / a1) * x2 - (a2 / a1) * y1_filter; // y1 이름 변경. 뭐 y1이 다른 헤더에 있는 애랑 이름이 곂친다나 

    // 이전 샘플 업데이트
    x2 = x1;
    x1 = input;
    y2 = y2; // 이전 출력 샘플 유지
    y1_filter = output; // y1 이름 변경

    return output;
}

// 버터 필터 적용
float butterFilter(float input) {
    float output = input;
    {
        static float z1, z2; // filter section state
        float x = output - -1.05932490 * z1 - 0.30186551 * z2;
        output = 0.00466198 * x + 0.00932395 * z1 + 0.00466198 * z2;
        z2 = z1;
        z1 = x;
    }
    {
        static float z1, z2; // filter section state
        float x = output - -1.32804926 * z1 - 0.63686063 * z2;
        output = 1.00000000 * x + 2.00000000 * z1 + 1.00000000 * z2;
        z2 = z1;
        z1 = x;
    }
    {
        static float z1, z2; // filter section state
        float x = output - -1.99416204 * z1 - 0.99417205 * z2;
        output = 1.00000000 * x + -2.00000000 * z1 + 1.00000000 * z2;
        z2 = z1;
        z1 = x;
    }
    {
        static float z1, z2; // filter section state
        float x = output - -1.99760510 * z1 - 0.99761499 * z2;
        output = 1.00000000 * x + -2.00000000 * z1 + 1.00000000 * z2;
        z2 = z1;
        z1 = x;
    }
    return output;
}

void print_EEG_DATA() {
  static int counter = 0; // counter 가 4~5회가 되면 데이터 출력. 
  // Serial.println(counter);
  if(counter == SAMPLE_TIME) {
    Serial.print("EEG_DATA_FROM_DEVICE1\n");
    for(int i = 0; i < 40; i++) {
          // Serial.print("Frequency: ");
          // Serial.print(i);
          // Serial.print(" Hz, Magnitude (sample normalized): ");
          // Serial.println(EEG_data[i]/SAMPLE_TIME); //입력된 데이터들의 평균 
          Serial.print(i);
          Serial.print(":");
          Serial.print(EEG_data[i]/SAMPLE_TIME);
          Serial.print("\n");
          EEG_data[i] = 0.0; //출력하고 초기화. 
    }
    counter = 0;
  }
  else counter++;
}
