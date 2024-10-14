import serial
import matplotlib.pyplot as plt
import numpy as np

# Serial port 설정
SERIAL_PORT = 'COM3'  # 아두이노가 연결된 포트로 변경
BAUD_RATE = 115200

def main():
    # Serial 객체 생성
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE)

    # 데이터 수집을 위한 변수 초기화
    eeg_data = []
    time_labels = []

    # 그래프 설정
    plt.ion()  # 인터랙티브 모드 활성화
    fig, ax = plt.subplots(figsize=(10, 5))
    line, = ax.plot([], [])  # 초기 라인 생성 (마커 없음)
    ax.set_xlim(0, 40)  # x축 제한 설정
    ax.set_ylim(-1, 1)  # y축 제한 설정 (최대 범위에 맞게 수정)
    ax.set_title('EEG Data from Arduino')
    ax.set_xlabel('Sample Index')
    ax.set_ylabel('EEG Value (Normalized)')
    ax.grid()

    try:
        while True:
            raw_line = ser.readline().decode('utf-8').strip()  # 줄 단위로 읽기
            if raw_line.startswith("EEG_DATA_FROM_DEVICE1"):
                # "EEG_DATA_FROM_DEVICE1" 메시지를 건너뜀
                continue

            # EEG 데이터 파싱
            data_parts = raw_line.split(':')
            if len(data_parts) == 2:
                index = int(data_parts[0])  # 인덱스
                value = float(data_parts[1])  # 평균값
                eeg_data.append(value)
                time_labels.append(index)  # 샘플 인덱스 추가

            # 40개의 샘플이 수집되면 플롯 업데이트
            if len(eeg_data) >= 40:
                line.set_xdata(time_labels)  # x 데이터 업데이트
                line.set_ydata(eeg_data)      # y 데이터 업데이트

                ax.set_xlim(0, len(time_labels))  # x축 동적 조정
                ax.set_ylim(min(eeg_data), max(eeg_data))  # y축 동적 조정

                plt.draw()  # 그래프 업데이트
                plt.pause(0.1)  # 잠시 멈추기 (0.1초)

                # 데이터 초기화
                eeg_data.clear()
                time_labels.clear()
                
    except KeyboardInterrupt:
        print("Data collection stopped.")
    finally:
        ser.close()

if __name__ == "__main__":
    main()
