import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';

const Separator = styled('div')(
    ({ theme }) => `
  height: ${theme.spacing(3)};
`,
);

const marks = [
    {
        value: 4.0,
        label: '<Delta',
    },
    {
        value: 8.0,
        label: '<theta',
    },
    {
        value: 12.0,
        label: '<alpha',
    },
    {
        value: 30.0,
        label: '<beta',
    },
];

function valuetext(value) {
    return `${value}`;
}

export default function EEG_Slider({ onChange, value }) {
    const handleChange = (event, newValue) => {
        onChange(newValue); // 슬라이더 값 변경 시 부모 컴포넌트에 전달
    };

    return (
        <Box sx={{ width: 500 }}>
            <Separator />
            <Typography id="EEG Range Slider" gutterBottom>
                EEG Range Slider
            </Typography>
            <Separator />
            <Slider
                track={false}
                aria-labelledby="EEG Range Slider"
                getAriaValueText={valuetext}
                value={value} // 부모 컴포넌트로부터 전달된 값 사용
                marks={marks}
                max={40.0}
                sx={{ width: '100%' }}
                size="small"
                step={0.1}
                valueLabelDisplay="on"
                onChange={handleChange} // 슬라이더의 값이 변경될 때 호출
                valueLabelFormat={(value) => `${value}`} // 라벨 포맷
            />
        </Box>
    );
}
