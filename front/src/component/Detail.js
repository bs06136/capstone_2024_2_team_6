import React from 'react';
import TextField from '@mui/material/TextField';
import {Box} from "@mui/material";

function Detail() {
    return (
        <div>
            <TextField
                id="User_detailed"
                label="사용자 세부정보"
                variant="outlined"
                multiline
                fullWidth
                height="100%"
                minRows={6} // 원하는 줄 수만큼 설정
            />
        </div>
    );
}

export default Detail;
