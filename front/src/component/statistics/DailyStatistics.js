import Calendar from "react-calendar";
import Typography from "@mui/material/Typography";
import "react-calendar/dist/Calendar.css";
import React, { useState, useEffect } from "react";
import "../../css/statistics/DailyStatistics.css";

function DailyStatistics(Data) {
    const [processedData, setProcessedData] = useState([]);

    // const rawData = Data.body
    const rawData = {
        day: "2024-10-15,2024-10-15,2024-10-16,2024-11-19,2024-11-19,2024-11-19,2024-11-20,2024-11-20,2024-12-05,2024-12-05,2024-12-06",
        stress: "0.4,0.5,0.6,0.1,0.2,0.3,0.5,0.5,0.3,0.4,0.2",
        concentration: "3,3.5,4,5,4,3,2,3.5,4,4.2,3.8",
    };

    useEffect(() => {
        const processData = (data) => {
            const days = data.day.split(",");
            const stressValues = data.stress.split(",").map(Number);
            const concentrationValues = data.concentration.split(",").map(Number);

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
        };

        const result = processData(rawData);
        setProcessedData(result);
    }, []);

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
            <Calendar className="custom-calendar"
                      tileContent={tileContent} />
        </div>
    );
}

export default DailyStatistics;
