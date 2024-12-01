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
    const rawData = Data.Data;

    const [processedData, setProcessedData] = useState({ labels: [], stressData: [], concentrationData: [] });

    useEffect(() => {
        try {

            console.log(rawData);


            // rawData를 파싱하여 processedData 형식으로 변환
            const days = rawData.day.split(",");
            const stressValues = rawData.stress.split(",").map(parseFloat);
            const concentrationValues = rawData.concentration.split(",").map(parseFloat);

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
        } catch (error) {
            console.error("Error processing data:", error);
            setProcessedData({ labels: [], stressData: [], concentrationData: [] }); // 에러가 발생하면 빈 데이터로 설정
        }
    }, [rawData]); // rawData가 변경될 때마다 새로 처리

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

    // 데이터가 비어있으면 그래프를 렌더링하지 않음
    if (processedData.labels.length === 0) {
        return null; // 그래프를 그리지 않음
    }

    return (
        <div>
            <Line data={data} options={options} />
        </div>
    );
}

export default StatisticsGraph;
