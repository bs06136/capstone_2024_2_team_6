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
import "../css/DrousyAndStressSideBar.css";

// Chart.js 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DrousyAndStressSideBar({}) {
    const ID = localStorage.getItem("uniqueNumber");
    const [dataList, setDataList] = useState([]); // parsedData를 저장할 상태 초기화

    // TABratio 계산
    const TABratio = (data) => {
        const numerator = data.slice(4, 13).reduce((acc, val) => acc + val, 0);
        const denominator = data.slice(14, 30).reduce((acc, val) => acc + val, 0);
        return numerator / denominator;
    };

    // ABratio 계산
    const ABratio = (data) => {
        const numerator = data.slice(8, 13).reduce((acc, val) => acc + val, 0);
        const denominator = data.slice(14, 30).reduce((acc, val) => acc + val, 0);
        return numerator / denominator;
    };

    // 테스트 데이터 (5명)
    const mockData = [
        {
            device_id: "device_1",
            worker_id: "worker_1",
            data: [
                12.5, 10.8, 14.2, 8.9, 7.4, 15.0, 16.3, 14.5, 9.8, 10.2, 11.3, 13.5, 7.6, 8.9, 10.3, 14.7, 12.1, 13.0, 15.5, 16.0, 14.3, 12.8, 10.5, 11.9, 15.2, 14.0, 13.8, 16.4, 9.1, 10.7,
            ],
        },
        {
            device_id: "device_2",
            worker_id: "worker_2",
            data: [
                11.0, 13.3, 9.9, 7.1, 8.0, 10.9, 15.6, 13.0, 14.5, 12.2, 16.1, 10.0, 11.5, 12.7, 13.9, 10.8, 8.9, 14.6, 16.3, 11.0, 12.0, 10.5, 9.0, 13.0, 11.3, 14.1, 10.6, 15.2, 12.0, 14.3,
            ],
        },{
            device_id: "device_3",
            worker_id: "worker_3",
            data: [
                9.8, 11.5, 13.0, 7.6, 6.7, 14.2, 15.8, 13.4, 8.9, 10.0, 12.6, 15.5, 10.1, 13.1, 12.2, 14.7, 11.0, 13.4, 10.9, 9.8, 10.0, 12.1, 14.5, 13.8, 10.2, 12.8, 13.2, 9.5, 15.0, 14.1,
            ],
        },
        {
            device_id: "device_4",
            worker_id: "worker_4",
            data: [
                10.2, 9.6, 14.3, 12.5, 7.9, 13.5, 12.0, 10.1, 11.5, 14.2, 13.0, 15.7, 8.5, 11.8, 9.3, 13.0, 10.9, 12.8, 11.1, 13.5, 10.6, 12.0, 14.0, 9.8, 15.0, 13.1, 12.3, 11.4, 10.7, 14.2,
            ],
        },
        {
            device_id: "device_5",
            worker_id: "worker_5",
            data: [
                12.1, 10.3, 11.8, 15.2, 14.7, 10.5, 13.6, 9.0, 15.4, 14.0, 12.2, 13.7, 10.6, 12.5, 9.7, 14.8, 12.3, 13.2, 10.9, 11.4, 14.1, 10.0, 12.7, 11.6, 13.8, 15.0, 12.0, 14.3, 10.2, 11.9,
            ],
        },

    ];

    useEffect(() => {
        // 서버에서 데이터 받아오는 부분을 주석 처리
        /*
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/GET/data_renew", {
                    params: { user_id: ID },
                });

                if (response.status === 200) {
                    const parsedData = Object.entries(response.data).map(([device_id, value]) => {
                        const [worker_id, data] = value.split(", [");
                        const cleanedData = `[${data}`;

                        try {
                            const dataArray = JSON.parse(cleanedData);
                            return {
                                device_id,
                                worker_id,
                                data: dataArray,
                            };
                        } catch (error) {
                            console.error("JSON 파싱 오류:", error);
                            return {
                                device_id,
                                worker_id,
                                data: [],
                            };
                        }
                    });
                    setDataList(parsedData);
                }
            } catch (error) {
                console.error("그래프에서 데이터 가져오기 오류:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
        */
        setDataList(mockData); // 테스트 데이터로 상태 설정

    }, [ID]);

    // 그래프 데이터 준비
    const labels = dataList.map((item) => item.worker_id);
    const TABratios = dataList.map((item) => TABratio(item.data));
    const ABratios = dataList.map((item) => ABratio(item.data));

    const chartData = useMemo(() => ({
        labels,
        datasets: [
            {
                label: "졸음지수",
                data: TABratios,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
            {
                label: "스트레스 지수",
                data: ABratios,
                backgroundColor: "rgba(153, 102, 255, 0.6)",
            },
        ],
    }), [TABratios, ABratios, labels]);

    const options = {
        indexAxis: "y", // 가로 막대 그래프
        responsive: true, // 반응형 그래프
        maintainAspectRatio: false, // 비율 유지 안 함
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: false,
                text: "TABratio와 ABratio 비교",
            },
        },
        scales: {
            x: {
                beginAtZero: true, // x축 시작 위치 0
                offset: true, // 막대들 간 간격을 두어 시작 위치 지정
                categoryPercentage: 1, // 각 카테고리의 너비를 100%로 설정
                barPercentage: 1, // 각 막대가 카테고리 내에서 차지하는 비율을 100%로 설정
            },
            y: {
                beginAtZero: true, // y축 시작 위치 0
                barPercentage: 0.1, // 각 막대가 카테고리 내에서 차지하는 비율을 100%로 설정
            },
        },
        elements: {
            bar: {
                barThickness: 30,  // 개별 막대의 높이를 30px로 고정
                maxBarThickness: 30, // 최대 세로 길이를 30px로 설정 (다시 고정)
            },
        },
    };

    return (
        <div className="drousyAndStressSideBar" style={{overflowY: 'auto' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default DrousyAndStressSideBar;
