import Calendar from "react-calendar";
import Typography from "@mui/material/Typography";
import "react-calendar/dist/Calendar.css";
import React, { useState, useEffect } from "react";
import "../../css/statistics/MontlyStatistics.css";

function MonthlyStatistics(Data) {
    const [processedData, setProcessedData] = useState([]);

    console.log(Data);
    console.log(Data.Data);
    console.log(Data.Data.day);
    //Data.body로 썼는데 왜인지???? 에러가 나서 Data.Data 하니까 에러가 사라짐...

    const rawData = Data.Data;
    useEffect(() => {
        const processData = (data) => {
            try {

                const days = data.day.split(",");
                const stressValues = data.stress.split(",").map(parseFloat);
                const concentrationValues = data.concentration.split(",").map(parseFloat);

                console.log(stressValues);


                const groupedDataByMonth = {};

                days.forEach((day, index) => {
                    const month = day.substring(0, 7); // 월을 'yyyy-mm' 형식으로 추출 (예: '2024-11')

                    if (!groupedDataByMonth[month]) {
                        groupedDataByMonth[month] = { stress: [], concentration: [] };
                    }
                    groupedDataByMonth[month].stress.push(stressValues[index]);
                    groupedDataByMonth[month].concentration.push(concentrationValues[index]);
                });

                // 월별 평균 계산
                const averagedData = Object.entries(groupedDataByMonth).map(([month, values]) => ({
                    month,
                    averageStress:
                        values.stress.reduce((sum, val) => sum + val, 0) / values.stress.length,
                    averageConcentration:
                        values.concentration.reduce((sum, val) => sum + val, 0) / values.concentration.length,
                }));

                return averagedData;
            } catch (error) {
                console.error("Error processing data:", error);
                console.log(Data)
                console.log(rawData);
                return []; // 에러가 발생하면 빈 배열 반환
            }
        };

        // 데이터 처리 함수 호출
        const result = processData(rawData);
        setProcessedData(result);
    }, [rawData]); // rawData가 변경될 때마다 새로 처리

    // 월별 데이터가 해당 월에 맞게 표시되도록 tileContent를 설정
    const tileContent = ({ date, view }) => {
        if (view !== "year") return null; // 연간 보기에서만 표시

        const formattedMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const dataForMonth = processedData.find((item) => item.month === formattedMonth);

        if (!dataForMonth) return null; // 해당 월에 데이터가 없으면 아무 것도 표시하지 않음

        return (
            <div className="tile-content">
                <div className="tile-stress">
                    <span className="stress">{dataForMonth.averageStress.toFixed(2)}</span> {/* 스트레스 평균 */}
                </div>
                <div className="tile-concentration">
                    <span className="concentration">{dataForMonth.averageConcentration.toFixed(2)}</span> {/* 집중도 평균 */}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="calendar-wrapper">
                <Calendar view="year" tileContent={tileContent} />
            </div>
        </div>
    );
}

export default MonthlyStatistics;
