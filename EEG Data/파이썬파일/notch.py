import numpy as np
import pandas as pd
from scipy.signal import iirnotch, butter, filtfilt
from scipy.signal.windows import hamming
import matplotlib.pyplot as plt

# CSV 파일 읽기
file_path = r"D:\캡스톤 디자인(1)\capstone_2024_2_team_6\EEG Data\테스트 측정 데이터\recorded_data_2024-10-29_17-46-18.csv"  # 파일 경로 수정
data = pd.read_csv(file_path)  # 헤더가 있음

# counter 값 선택
counter = data['channel_1'].values

# 샘플링 주파수 설정
fs = 256.0

# DC 오프셋 제거
mean_value = counter.mean()
counter_zero_mean = counter - mean_value

# 60Hz 노치 필터 설계
notch_freq = 60.0
quality_factor = 30.0
b_notch, a_notch = iirnotch(notch_freq, quality_factor, fs)

# 노치 필터 적용
counter_notch_filtered = filtfilt(b_notch, a_notch, counter_zero_mean)

# 0.5Hz ~ 30.0Hz Butterworth 대역통과 필터 설계
lowcut = 0.5
highcut = 30.0
order = 4
b_butter, a_butter = butter(order, [lowcut / (fs / 2), highcut / (fs / 2)], btype='band')

# Butterworth 필터 적용
counter_clean = filtfilt(b_butter, a_butter, counter_notch_filtered)

# FFT 적용 (원본 신호)
n_raw = len(counter)
f_raw = np.fft.fftfreq(n_raw, d=1/fs)[:n_raw//2]  # 주파수 축
fft_values_raw = np.fft.fft(counter_zero_mean)[:n_raw//2]  # FFT 수행 및 양주파수만 선택 (counter_zero_mean을 사용)
fft_magnitude_raw = np.abs(fft_values_raw)  # 크기 스펙트럼

# FFT 적용 (클린 신호)
n_clean = len(counter_clean)
f_clean = np.fft.fftfreq(n_clean, d=1/fs)[:n_clean//2]  # 주파수 축
windowed_signal = counter_clean * hamming(n_clean)  # Hamming 윈도우 적용
fft_values_clean = np.fft.fft(windowed_signal)[:n_clean//2]  # FFT 수행 및 양주파수만 선택
fft_magnitude_clean = np.abs(fft_values_clean)/len(counter_clean)  # 크기 스펙트럼

# 주파수 대역별 비율 계산 함수
def calculate_band_power(frequencies, magnitude, band_range):
    band_mask = (frequencies >= band_range[0]) & (frequencies <= band_range[1])
    return np.sum(magnitude[band_mask])

# 주파수 대역 정의
delta_range = (0.5, 4)
theta_range = (4, 8)
alpha_range = (8, 12)
beta_range = (12, 30)
gamma_range = (30, 100)

# 각 대역의 파워 계산 (클린 신호 기준)
delta_power = calculate_band_power(f_clean, fft_magnitude_clean, delta_range)
theta_power = calculate_band_power(f_clean, fft_magnitude_clean, theta_range)
alpha_power = calculate_band_power(f_clean, fft_magnitude_clean, alpha_range)
beta_power = calculate_band_power(f_clean, fft_magnitude_clean, beta_range)

# 전체 파워 계산
total_power = delta_power + theta_power + alpha_power + beta_power

# 각 대역의 비율 계산
delta_ratio = (delta_power / total_power) * 100
theta_ratio = (theta_power / total_power) * 100
alpha_ratio = (alpha_power / total_power) * 100
beta_ratio = (beta_power / total_power) * 100

# 결과 출력
print(f"Delta (0.5-4Hz) 비율: {delta_ratio:.2f}%")
print(f"Theta (4-8Hz) 비율: {theta_ratio:.2f}%")
print(f"Alpha (8-12Hz) 비율: {alpha_ratio:.2f}%")
print(f"Beta (12-30Hz) 비율: {beta_ratio:.2f}%")

# 결과 시각화
plt.figure(figsize=(12, 12))

# 원본 신호 그래프
plt.subplot(4, 1, 1)
plt.plot(counter, label='Raw EEG (Counter)', color='blue')
plt.title('Raw EEG Signal (Counter)')
plt.xlabel('Sample Index')
plt.ylabel('Amplitude')
plt.legend()
plt.grid()

# 클린 신호 그래프
plt.subplot(4, 1, 2)
plt.plot(counter_clean, label='Clean EEG (Counter)', color='orange')
plt.title('Clean EEG Signal (Counter)')
plt.xlabel('Sample Index')
plt.ylabel('Amplitude')
plt.legend()
plt.grid()

# 원본 신호 FFT 결과 그래프
plt.subplot(4, 1, 3)
plt.plot(f_raw, fft_magnitude_raw, label='FFT of Raw EEG (Counter)', color='green')
plt.title('FFT of Raw EEG Signal (Counter)')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude')
plt.xlim(0, 100)  # 0~100Hz 주파수 범위만 표시
plt.legend()
plt.grid()

# 뇌파 영역대 구분하기 위한 색상 표시
plt.axvspan(0.5, 4, color='blue', alpha=0.3, label='Delta (0.5-4Hz)')  # 델타파 영역
plt.axvspan(4, 8, color='purple', alpha=0.3, label='Theta (4-8Hz)')  # 세타파 영역
plt.axvspan(8, 12, color='yellow', alpha=0.3, label='Alpha (8-12Hz)')  # 알파파 영역
plt.axvspan(12, 30, color='orange', alpha=0.3, label='Beta (12-30Hz)')  # 베타파 영역
plt.axvspan(30, 100, color='red', alpha=0.3, label='Gamma (30Hz 이상)')  # 감마파 영역

# 클린 신호 FFT 결과 그래프
plt.subplot(4, 1, 4)
plt.plot(f_clean, fft_magnitude_clean, label='FFT of Clean EEG (Counter)', color='red')
plt.title('FFT of Clean EEG Signal (Counter)')
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude')
plt.xlim(0, 100)  # 0~100Hz 주파수 범위만 표시
plt.legend()
plt.grid()

# 뇌파 영역대 구분하기 위한 색상 표시
plt.axvspan(0.5, 4, color='blue', alpha=0.3, label='Delta (0.5-4Hz)')  # 델타파 영역
plt.axvspan(4, 8, color='purple', alpha=0.3, label='Theta (4-8Hz)')  # 세타파 영역
plt.axvspan(8, 12, color='yellow', alpha=0.3, label='Alpha (8-12Hz)')  # 알파파 영역
plt.axvspan(12, 30, color='orange', alpha=0.3, label='Beta (12-30Hz)')  # 베타파 영역
plt.axvspan(30, 100, color='red', alpha=0.3, label='Gamma (30Hz 이상)')  # 감마파 영역

plt.tight_layout()
plt.show()
