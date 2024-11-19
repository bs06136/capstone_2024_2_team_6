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

function StickGraph(user_Id) {
    const [eegData, setEegData] = useState([]);
    const [ratioData, setRatioData] = useState([]);

    const requestGet = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/GET/detail/1/data`);
            console.log("Server Response:", response.data);

            const eegDataList = Object.values(response.data).map(item => {
                const parsedData = JSON.parse(item);
                return calculateTAB(parsedData);
            });

            const ratioDataList = Object.values(response.data).map(item => {
                const parsedData = JSON.parse(item);
                return calculateNewRatio(parsedData);
            });

            setEegData(eegDataList);
            setRatioData(ratioDataList);

            console.log("Processed EEG Data:", eegDataList);
            console.log("Processed Ratio Data:", ratioDataList);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const calculateTAB = (data) => {
        if (data.length >= 30) {
            const firstSum = data.slice(4, 13).reduce((acc, val) => acc + val, 0);
            const secondSum = data.slice(14, 30).reduce((acc, val) => acc + val, 0);
            return firstSum / secondSum;
        } else {
            console.warn("EEG_Data does not have enough data points:", data);
            return 0;
        }
    };

    const calculateNewRatio = (data) => {
        if (data.length >= 30) {
            const numerator = data.slice(8, 13).reduce((acc, val) => acc + val, 0);
            const denominator = data.slice(14, 30).reduce((acc, val) => acc + val, 0);
            return numerator / denominator;
        } else {
            console.warn("EEG_Data does not have enough data points for new ratio:", data);
            return 0;
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
                label: '졸음 지수',
                data: eegData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: '스트레스 지수',
                data: ratioData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
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
