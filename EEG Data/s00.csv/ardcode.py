import numpy as np
import pandas as pd
from scipy.signal import iirnotch, butter, filtfilt
from scipy.signal.windows import hamming
import matplotlib.pyplot as plt

# CSV 파일 읽기
file_path = r"D:\캡스톤 디자인(1)\recorded_data_2024-10-09_21-22-29.csv"  # 파일 경로 수정
data = pd.read_csv(file_path)

# 데이터 열 선택
channel_1 = data['channel_1']
counter = data['counter']  # counter 값을 가져옴

# 샘플링 주파수 설정
fs = 500.0

# DC 오프셋 제거
mean_value = channel_1.mean()
channel_1_zero_mean = channel_1 - mean_value

# 60Hz 노치 필터 설계
notch_freq = 60.0
quality_factor = 30.0
b_notch, a_notch = iirnotch(notch_freq, quality_factor, fs)

# 노치 필터 적용
channel_1_notch_filtered = filtfilt(b_notch, a_notch, channel_1_zero_mean)

# 0.5Hz ~ 99.5Hz Butterworth 대역통과 필터 설계
lowcut = 0.5
highcut = 99.5
order = 4
b_butter, a_butter = butter(order, [lowcut / (fs / 2), highcut / (fs / 2)], btype='band')

# Butterworth 필터 적용
channel_1_clean = filtfilt(b_butter, a_butter, channel_1_notch_filtered)

# FFT 계산
n_raw = len(channel_1)
fft_values_raw = np.fft.fft(channel_1)[:n_raw//2]  # FFT 수행 및 양주파수만 선택
fft_magnitude_raw = np.abs(fft_values_raw)  # 크기 스펙트럼

n_clean = len(channel_1_clean)
windowed_signal = channel_1_clean * hamming(n_clean)  # Hamming 윈도우 적용
fft_values_clean = np.fft.fft(windowed_signal)[:n_clean//2]  # FFT 수행 및 양주파수만 선택
fft_magnitude_clean = np.abs(fft_values_clean)  # 크기 스펙트럼

# 결과 시각화
plt.figure(figsize=(12, 12))

# 원본 신호 그래프
plt.subplot(4, 1, 1)
plt.plot(counter, channel_1, label='Raw EEG', color='blue')
plt.title('Raw EEG Signal')
plt.xlabel('Counter')
plt.ylabel('Amplitude')
plt.legend()
plt.grid()

# 클린 신호 그래프
plt.subplot(4, 1, 2)
plt.plot(counter, channel_1_clean, label='Clean EEG', color='orange')
plt.title('Clean EEG Signal')
plt.xlabel('Counter')
plt.ylabel('Amplitude')
plt.legend()
plt.grid()

# 원본 신호 FFT 결과 그래프
plt.subplot(4, 1, 3)
f_raw = np.fft.fftfreq(n_raw, d=1/fs)[:n_raw//2]  # 주파수 축
plt.plot(f_raw, fft_magnitude_raw, label='FFT of Raw EEG', color='green')
plt.title('FFT of Raw EEG Signal')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude')
plt.xlim(0, 100)  # 0~100Hz 주파수 범위만 표시
plt.legend()
plt.grid()

# 클린 신호 FFT 결과 그래프
plt.subplot(4, 1, 4)
f_clean = np.fft.fftfreq(n_clean, d=1/fs)[:n_clean//2]  # 주파수 축
plt.plot(f_clean, fft_magnitude_clean, label='FFT of Clean EEG', color='red')
plt.title('FFT of Clean EEG Signal')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude')
plt.xlim(0, 100)  # 0~100Hz 주파수 범위만 표시
plt.legend()
plt.grid()

plt.tight_layout()
plt.show()
