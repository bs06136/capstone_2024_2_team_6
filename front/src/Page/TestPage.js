import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function TestPage() {

    const tileContent = ({ date, view }) => {
        if (view !== "month") return null; // 월별 보기에서만 표시

        const formattedDate = date.toISOString().split("T")[0]; // yyyy-mm-dd 형식

        // 11월 1일에만 41 표시
        if (formattedDate == "2024-11-01") {
            return (
                <div className="tile-content">
                    <div>41</div> {/* 11월 1일에 41 표시 */}
                </div>
            );
        }

        return null; // 다른 날짜는 아무 것도 표시하지 않음
    };

    return (
        <div>
            <Calendar className="custom-calendar" tileContent={tileContent} />
        </div>
    );

}

    export default TestPage;
