import Calendar from "react-calendar";
import Typography from "@mui/material/Typography";
import "react-calendar/dist/Calendar.css";
import React, { useState, useEffect } from "react";
import "../../css/statistics/DailyStatistics.css";

function DailyStatistics(Data) {
    const [processedData, setProcessedData] = useState([]);
    const rawData = Data.Data;

    useEffect(() => {
        const processData = (data) => {
            try {

                console.log(data);

                // 데이터 처리
                const days = data.day.split(",");
                const stressValues = data.stress.split(",").map(parseFloat);
                const concentrationValues = data.concentration.split(",").map(parseFloat);

                const groupedData = {};
                days.forEach((day, index) => {
                    if (!groupedData[day]) {
                        groupedData[day] = { stress: [], concentration: [] };
                    }
                    groupedData[day].stress.push(stressValues[index]);
                    groupedData[day].concentration.push(concentrationValues[index]);
                });

                // 평균 계산
                const averagedData = Object.entries(groupedData).map(([day, values]) => ({
                    day,
                    averageStress:
                        values.stress.reduce((sum, val) => sum + val, 0) / values.stress.length,
                    averageConcentration:
                        values.concentration.reduce((sum, val) => sum + val, 0) /
                        values.concentration.length,
                }));

                return averagedData;
            } catch (error) {
                console.error("Error processing data:", error);
                return [];  // 에러가 발생하면 빈 배열을 반환
            }
        };

        // 데이터 처리 함수 호출
        const result = processData(rawData);
        setProcessedData(result);
    }, [rawData]); // 의존성 배열에 rawData 추가

    // 달력 타일 내용 설정
    const tileContent = ({ date, view }) => {
        if (view !== "month") return null; // 월별 보기에서만 표시

        const formattedDate = date.toISOString().split("T")[0];
        const dataForDate = processedData.find((item) => item.day === formattedDate);

        if (!dataForDate) return null; // 데이터가 없는 경우 표시하지 않음

        return (
            <div className="tile-content">
                <div className="stress">{dataForDate.averageStress.toFixed(2)}</div>
                <div className="concentration">
                    {dataForDate.averageConcentration.toFixed(2)}
                </div>
            </div>
        );
    };

    return (
        <div className="daily-statistics">
            <Calendar className="custom-calendar" tileContent={tileContent} />
        </div>
    );
}

export default DailyStatistics;
