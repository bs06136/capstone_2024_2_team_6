import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import EEG_Slider from "./EEG_Slider";
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';

export default function UserSetting() {
    const [sliderValues, setSliderValues] = React.useState([4.0, 8.0, 12.0]); // 초기 상태 설정

    const handleSliderChange = (newValues) => {
        setSliderValues(newValues); // 슬라이더 값 업데이트
    };

    const handleTextFieldChange = (index, newValue) => {
        const parsedValue = parseFloat(newValue); // 문자열을 부동 소수점으로 변환
        if (!isNaN(parsedValue)) {
            const newSliderValues = [...sliderValues];
            newSliderValues[index] = parsedValue; // 텍스트 필드 인덱스에 맞춰 슬라이더 값 업데이트
            setSliderValues(newSliderValues); // 상태 업데이트
        }
    };

    return (
        <div>
            <Typography
                variant='h2'
                gutterBottom={true}
            >
                사용자 EEG 스펙트럼 구간 설정
            </Typography>
            <div>
                <Box
                    component="form"
                    sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        id="delta-value"
                        label="Delta"
                        variant="standard"
                        value={sliderValues[0]} // 슬라이더 첫 번째 값
                        onChange={(e) => handleTextFieldChange(0, e.target.value)} // 인덱스 0을 위한 핸들러
                    />
                    <TextField
                        id="theta-value"
                        label="Theta"
                        variant="standard"
                        value={sliderValues[1]} // 슬라이더 두 번째 값
                        onChange={(e) => handleTextFieldChange(1, e.target.value)} // 인덱스 1을 위한 핸들러
                    />
                    <TextField
                        id="alpha-value"
                        label="Alpha"
                        variant="standard"
                        value={sliderValues[2]} // 슬라이더 세 번째 값
                        onChange={(e) => handleTextFieldChange(2, e.target.value)} // 인덱스 2를 위한 핸들러
                    />
                </Box>
            </div>
            <div>
                <EEG_Slider onChange={handleSliderChange} value={sliderValues} /> {/* 슬라이더 값 전달 */}
            </div>
            <Button variant="outlined">저장</Button><Button variant="outlined">취소</Button>
            <Typography
                gutterBottom={true}
            >
                저장기능 구현 안했음!!
                사실 구현된 기능같은거 없음!!
            </Typography>
        </div>
    );
}
