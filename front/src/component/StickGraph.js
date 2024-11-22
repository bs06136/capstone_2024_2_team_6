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
import config from "../config";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StickGraph({ user_Id }) {
    const [focusData, setFocusData] = useState([]);
    const [stressData, setStressData] = useState([]);

    const requestGet = async () => {
        try {
            // const response = await axios.get(`${config.apiUrl}/api/GET/detail/${user_Id}/data`);

            const response = {
                status: 200,
                statusText: "OK",
                headers: {},
                config: {},
                request: {},
                data: {
                    "data_1": "3.5,2.7",
                    "data_2": "4.2,3.1",
                    "data_3": "5.0,2.9",
                    "data_4": "5.0,2.9",
                    "data_5": "5.0,2.9",
                    "data_6": "5.0,2.9",
                    "data_7": "5.0,2.9",
                    "data_8": "5.0,2.9",
                    "data_9": "5.0,2.9",
                    "data_10": "5.0,2.9"
                },
            }; //이거 지우고 위에 get 살렸을때 되는지 확인해야함.

            console.log("Server Response:", response.data);

            // 데이터를 파싱
            const focusList = [];
            const stressList = [];

            Object.values(response.data).forEach(item => {
                const [focus, stress] = item.split(',').map(Number); // 데이터 분리 후 숫자로 변환
                focusList.push(focus);
                stressList.push(stress);
            });

            setFocusData(focusList);
            setStressData(stressList);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        requestGet();
        const interval = setInterval(() => {
            requestGet();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const labels = focusData.map((_, index) => `데이터 ${index + 1}`);

    const data = {
        labels: labels,
        datasets: [
            {
                label: '집중도 지수',
                data: focusData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: '스트레스 지수',
                data: stressData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div>
            {focusData.length > 0 && stressData.length > 0 ? (
                <Bar data={data} />
            ) : (
                <p>데이터를 불러오는 중입니다...</p>
            )}
        </div>
    );
}

export default StickGraph;
