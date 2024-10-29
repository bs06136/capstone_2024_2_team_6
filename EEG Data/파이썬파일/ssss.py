import serial
import time
import numpy as np
import matplotlib.pyplot as plt

# 시리얼 포트 설정
SERIAL_PORT = 'COM3'  # 아두이노가 연결된 포트
BAUD_RATE = 115200
SAMPLES = 512  # 읽을 샘플 수

# 시리얼 포트 열기
ser = serial.Serial(SERIAL_PORT, BAUD_RATE)
time.sleep(2)  # 아두이노와 연결될 때까지 잠시 대기

data = []
try:
    while True:
        line = ser.readline().decode('utf-8').strip()
        if line:  # 빈 줄이 아닐 경우
            parts = line.split(':')
            if len(parts) == 2:
                frequency = int(parts[0])
                magnitude = float(parts[1])
                data.append(magnitude)

            # SAMPLES 수만큼 데이터가 모이면 플롯
            if len(data) >= SAMPLES:
                # 새로운 플롯 생성
                plt.figure(figsize=(10, 5))
                plt.plot(np.arange(SAMPLES), data)
                plt.title('FFT Magnitude Spectrum')
                plt.xlabel('Frequency Bin')
                plt.ylabel('Magnitude')
                plt.grid()
                plt.xlim(0, SAMPLES)
                plt.ylim(0, max(data) * 1.1)  # Y축을 약간 여유 있게 설정
                plt.pause(0.1)  # 플롯을 업데이트하기 위해 잠시 대기
                data = []  # 데이터 초기화
except KeyboardInterrupt:
    print("수집 중단")

ser.close()  # 시리얼 포트 닫기
plt.show()  # 플롯 표시
