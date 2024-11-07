import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// 스케일 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StickGraph() {
    const [eegData, setEegData] = useState([]);

    const requestGet = async () => {
        try {
            const response = await axios.get('https://77e2e873-b8fb-4235-9875-91b84eb6c5c3.mock.pstmn.io/api/GET/{user_id}/data');
            console.log("Server Response:", response.data);

            if (Array.isArray(response.data)) {
                const eegDataList = response.data.map(item => calculateTAB(item.EEG_Data));
                console.log("Processed EEG Data:", eegDataList);
                setEegData(eegDataList);
            } else {
                console.error("Received data is not an array:", response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const calculateTAB = (data) => {
        if (data.length >= 30) {
            const firstSum = data.slice(4, 14).reduce((acc, val) => acc + val, 0);
            const secondSum = data.slice(13, 30).reduce((acc, val) => acc + val, 0);
            return firstSum / secondSum;
        } else {
            console.warn("EEG_Data does not have enough data points:", data);
            return 0;  // 데이터가 부족한 경우 0을 반환
        }
    };

    useEffect(() => {
        requestGet();
        const interval = setInterval(() => {
            requestGet();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const labels = eegData.map((_, index) => `데이터 ${index + 1}`);

    const data = {
        labels: labels,
        datasets: [
            {
                label: '사용자 상태 그래프',
                data: eegData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div>
            {eegData.length > 0 ? (
                <Bar data={data} />
            ) : (
                <p>데이터를 불러오는 중입니다...</p>
            )}
        </div>
    );
}

export default StickGraph;
