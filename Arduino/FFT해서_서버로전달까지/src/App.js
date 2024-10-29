// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './App.css';

Chart.register(...registerables);

function App() {
    const [eegData, setEegData] = useState([]);

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

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 3000);
        return () => clearInterval(interval);
    }, []);

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
        </div>
    );
}

export default App;
