import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { Box } from "@mui/material";

function Detail({ minRows = 6, Data, onChange, fieldDisable }) {
    // 초기값으로 Data를 사용하고, 데이터가 없으면 빈 문자열로 설정
    const [userDetail, setUserDetail] = useState(Data || "");  // Data가 없으면 빈 문자열로 초기화

    useEffect(() => {
        // 부모로부터 Data 값이 변경되면 상태를 업데이트
        if (Data !== undefined && Data !== null) {
            setUserDetail(Data);  // Data가 유효할 때만 상태 업데이트
        } else {
            setUserDetail("");  // Data가 없으면 빈 문자열로 설정
        }
    }, [Data]);  // Data가 변경될 때마다 업데이트

    const handleChange = (event) => {
        const newValue = event.target.value;
        setUserDetail(newValue);  // 내부 상태 업데이트
        onChange(newValue);       // 부모 컴포넌트에 값 전달
    };

    return (
        <div>
            <TextField
                id="User_detailed"
                label="사용자 세부정보"
                variant="standard"
                multiline
                fullWidth
                minRows={minRows} // 세로 크기랑 연관 있음
                value={userDetail || ""}  // 상태 값 (항상 정의된 값으로 전달)
                disabled={fieldDisable}
                onChange={handleChange}  // 값이 변경될 때 부모에게 전달
                InputProps={{
                    disableUnderline: true, // 바닥 선을 없앰
                }}
            />
        </div>
    );
}

export default Detail;
