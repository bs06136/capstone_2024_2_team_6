import React, { useEffect } from 'react';
import Actor from "../component/Actor";
import Detail from "../component/Detail";
import Button from "@mui/material/Button";
import "../css/UserAddOrEdit.css";
import Typography from "@mui/material/Typography";
import axios from "axios";
import TextField from "@mui/material/TextField";
import config from "../config";
import { MenuItem, Select } from "@mui/material";

function UserAddOrEdit({ givenName }) {
    const [userName, setUserName] = React.useState(givenName);
    const [deviceId, setDeviceId] = React.useState("장치번호");
    const [userDetail, setUserDetail] = React.useState(" ");
    const [trackingOption, setTrackingOption] = React.useState("0"); // 0은 각성, 1은 졸음, 2는 수면

    const deviceList = ["EEG1", "EEG2", "EEG3"];

    // GET 요청
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/GET/${deviceId}/data`);
                setUserName(response.data["name"]);
                setDeviceId(response.data["deviceId"]);
                setUserDetail("\n" + response.data["detailData"]);
            } catch (error) {
                console.error("데이터를 가져오는 중 오류 발생:", error);
            }
        };

        fetchData();
    }, []);

    // Post 요청
    const saveButton = async () => {
        try {
            const response = await axios.post(`${config.apiUrl}/api/POST/user/enrollment`, {
                name: userName,
                deviceId: deviceId,
                detailData: userDetail,
                option: trackingOption
            });
            console.log("서버 응답:", response.data);
        } catch (error) {
            console.error("saveButton ERROR!!!", error);
        }
    };

    // Detail 이벤트 핸들러
    const handleDetailChange = (newDetail) => {
        setUserDetail(newDetail);
    };

    const deviceSelect = (event) => {
        setDeviceId(event.target.value);
    };

    // trackingOption을 설정하는 함수
    const handleTrackingOptionChange = (option) => {
        setTrackingOption(option);
    };

    return (
        <div className="UserAddOrEdit">
            <div className="UserImage">
                <Actor imageOption="true" />
                <div className="text">
                    <Typography variant="h7" margin="10px"> 이름 </Typography>
                    <TextField
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <Typography variant="h7" margin="10px"> 장치번호 </Typography>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={deviceId}
                        label="device"
                        onChange={deviceSelect}
                    >
                        {deviceList.map((device) => (
                            <MenuItem key={device} value={device}>
                                {device}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
            </div>

            <div className="UserDetailedData">
                <Detail
                    className="EditableDetail"
                    minRows={15}
                    Data={userDetail}
                    onChange={handleDetailChange}
                />
            </div>

            <div className="WakeOrSleep">
                <Button
                    variant="outlined"
                    className="wake"
                    onClick={() => handleTrackingOptionChange("0")}
                    style={{
                        backgroundColor: trackingOption === "0" ? "#1976d2" : "",
                        color: trackingOption === "0" ? "white" : ""
                    }}
                >
                    각성
                </Button>
                <Button
                    variant="outlined"
                    className="drowsy"
                    onClick={() => handleTrackingOptionChange("1")}
                    style={{
                        backgroundColor: trackingOption === "1" ? "#1976d2" : "",
                        color: trackingOption === "1" ? "white" : ""
                    }}
                >
                    졸음
                </Button>
                <Button
                    variant="outlined"
                    className="sleep"
                    onClick={() => handleTrackingOptionChange("2")}
                    style={{
                        backgroundColor: trackingOption === "2" ? "#1976d2" : "",
                        color: trackingOption === "2" ? "white" : ""
                    }}
                >
                    수면
                </Button>
            </div>

            <Button variant="contained" onClick={saveButton}>저장하기</Button>
        </div>
    );
}

export default UserAddOrEdit;
