import { useEffect, useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation"; // Annotation 플러그인 임포트
import "../css/DrousyAndStressSideBar.css";
import axios from "axios";

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, annotationPlugin);

function DrousyAndStressSideBar() {
    const uniqueNumber = localStorage.getItem("uniqueNumber");
    const [dataList, setDataList] = useState([]); // parsedData를 저장할 상태 초기화

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/GET/data_renew", {
                    params: { user_id: uniqueNumber },
                });

                if (response.status === 200) {
                    const parsedData = Object.entries(response.data).map(([device_id, value]) => {
                        const [worker_id, focus_data, stress_data] = value.split(", ");
                        return {
                            device_id,
                            worker_id,
                            focus_data: parseFloat(focus_data) || 0,
                            stress_data: parseFloat(stress_data) || 0,
                        };
                    });
                    setDataList(parsedData);
                }
            } catch (error) {
                console.error("데이터 가져오기 오류", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [uniqueNumber]);

    // Chart 데이터 준비
    const labels = dataList.map((item) => item.worker_id); // 작업자 ID를 레이블로 설정
    const focusData = dataList.map((item) => item.focus_data); // 집중 데이터를 배열로 변환
    const stressData = dataList.map((item) => item.stress_data); // 스트레스 데이터를 배열로 변환

    const chartData = useMemo(
        () => ({
            labels,
            datasets: [
                {
                    label: "Focus Data",
                    data: focusData,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
                {
                    label: "Stress Data",
                    data: stressData,
                    backgroundColor: "rgba(255, 99, 132, 0.6)",
                },
            ],
        }),
        [focusData, stressData, labels]
    );

    const options = {
        indexAxis: "y", // 가로 막대 그래프
        responsive: true, // 반응형 그래프
        maintainAspectRatio: false, // 비율 유지 안 함
        plugins: {
            annotation: {
                annotations: { // 수정된 부분
                    line1: {
                        type: "line",
                        xMin: 0.5,  //졸음 기준을 몇으로 잡을것인가?
                        xMax: 0.5,  //위랑 맞춰야됨. 다르면 대각선
                        borderColor: "red",
                        borderWidth: 2,
                        label: {
                            content: "Baseline",
                            enabled: true,
                            position: 0.6,
                        },
                    },
                },
            },
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Focus and Stress Data Comparison",
            },
        },
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                beginAtZero: true,
            },
        },
        elements: {
            bar: {
                barThickness: 30, // 막대 두께
                maxBarThickness: 30,
            },
        },
    };

    return (
        <div className="drousyAndStressSideBar" style={{ overflowY: "auto" }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default DrousyAndStressSideBar;
