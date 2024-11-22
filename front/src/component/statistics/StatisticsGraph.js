import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";

// Chart.js에서 필요한 모듈 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

function StatisticsGraph(Data) {
    // const rawData = Data.body
    const rawData = {
        day: "2024-10-15,2024-10-15,2024-10-16,2024-11-19,2024-11-19,2024-11-19,2024-11-20,2024-11-20,2024-12-05,2024-12-05,2024-12-06",
        stress: "0.4,0.5,0.6,0.1,0.2,0.3,0.5,0.5,0.3,0.4,0.2",
        concentration: "3,3.5,4,5,4,3,2,3.5,4,4.2,3.8",
    };

    const [processedData, setProcessedData] = useState({ labels: [], stressData: [], concentrationData: [] });

    useEffect(() => {
        // rawData를 파싱하여 processedData 형식으로 변환
        const days = rawData.day.split(",");
        const stressValues = rawData.stress.split(",").map(Number);
        const concentrationValues = rawData.concentration.split(",").map(Number);

        const uniqueDates = [...new Set(days)];

        const stressData = uniqueDates.map(date => {
            const dateIndexes = days.filter(d => d === date);
            const avgStress = dateIndexes.reduce((acc, index) => acc + stressValues[days.indexOf(index)], 0) / dateIndexes.length;
            return avgStress;
        });

        const concentrationData = uniqueDates.map(date => {
            const dateIndexes = days.filter(d => d === date);
            const avgConcentration = dateIndexes.reduce((acc, index) => acc + concentrationValues[days.indexOf(index)], 0) / dateIndexes.length;
            return avgConcentration;
        });

        setProcessedData({
            labels: uniqueDates,
            stressData: stressData,
            concentrationData: concentrationData,
        });
    }, []);

    // 그래프 데이터 설정
    const data = {
        labels: processedData.labels,
        datasets: [
            {
                label: "Stress",
                data: processedData.stressData,
                borderColor: "red",
                backgroundColor: "rgba(255, 0, 0, 0.2)",
                fill: true,
                tension: 0.4,
            },
            {
                label: "Concentration",
                data: processedData.concentrationData,
                borderColor: "blue",
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "사용자 통계",
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: '날짜',
                },
            },
            y: {
                title: {
                    display: true,
                    text: '값',
                },
            },
        },
    };

    return (
        <div>
            <Line data={data} options={options} />
        </div>
    );
}

export default StatisticsGraph;