// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import '../css/RealTimeGraph.css';

Chart.register(...registerables);

function RealTimeGraph() {
    const [eegData, setEegData] = useState([]);
    const [range1_7_9, setRange1_7_9] = useState(0);
    const [range8_15_9, setRange8_15_9] = useState(0);
    const [range16_23_9, setRange16_23_9] = useState(0);
    const [range24_60, setRange24_60] = useState(0);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/data');
            const jsonData = JSON.parse(response.data.jsonData);
            const eegData = jsonData["EEG_Data(HZ)"];
            setEegData(eegData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const calculateRatios = (data) => {
        const total = data.length;

        const count1_7_9 = data.filter(value => value >= 1 && value <= 7.9).length;
        const count8_15_9 = data.filter(value => value >= 8 && value <= 15.9).length;
        const count16_23_9 = data.filter(value => value >= 16 && value <= 23.9).length;
        const count24_60 = data.filter(value => value >= 24 && value <= 60).length;

        setRange1_7_9(((count1_7_9 / total) * 100).toFixed(2));
        setRange8_15_9(((count8_15_9 / total) * 100).toFixed(2));
        setRange16_23_9(((count16_23_9 / total) * 100).toFixed(2));
        setRange24_60(((count24_60 / total) * 100).toFixed(2));
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (eegData.length > 0) {
            calculateRatios(eegData);
        }
    }, [eegData]);

    const data = {
        labels: eegData.map((_, index) => index + 1),
        datasets: [
            {
                label: 'EEG Data (HZ)',
                data: eegData,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Sample Index',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'EEG Data (HZ)',
                },
            },
        },
    };

    return (
        <div>
            <h1>스프링 부트와 리액트 데이터 통신</h1>
            <h2>EEG 데이터 그래프</h2>
            <div className="chart-container">
                <Line data={data} options={options} />
            </div>
            <h2>구간별 EEG 데이터 비율</h2>
            <ul>
                <li>1-7.9 Hz: {range1_7_9}%</li>
                <li>8-15.9 Hz: {range8_15_9}%</li>
                <li>16-23.9 Hz: {range16_23_9}%</li>
                <li>24-60 Hz: {range24_60}%</li>
            </ul>
        </div>
    );
}

export default RealTimeGraph;
