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

function UserAddOrEdit({ givenName,userId }) {
    const [userName, setUserName] = React.useState(givenName);
    const [deviceId, setDeviceId] = React.useState("장치번호");
    const [userDetail, setUserDetail] = React.useState(" ");
    const [trackingOption, setTrackingOption] = React.useState("0"); // 0은 각성, 1은 졸음, 2는 수면

    const [deviceList,setDeviceList] = React.useState(["Loading", "Loading", "Loading"]); //이것도 수정해야됨. Main 화면으로부터 받아오거나 GET을 추가해야됨.

    // GET 요청
    useEffect(() => {
        // device 목록을 가져오는 비동기 함수
        const getDeviceList = async () => {
            try {
                // 서버의 data_renew API를 호출
                const response = await axios.get(`${config.apiUrl}/api/GET/data_renew`);

                // 서버로부터 받은 데이터가 JSON 형태일 때
                if (response.data) {
                    // 서버 응답에서 device 목록 추출
                    const deviceData = response.data;
                    const devices = Object.keys(deviceData); // JSON 객체의 key를 사용하여 device 목록 추출

                    // device 목록을 상태로 설정
                    setDeviceList(devices);
                }
            } catch (error) {
                console.error("Error fetching device list:", error);
            }
        };

        // 사용자 정보와 세부 데이터를 가져오는 비동기 함수
        const fetchData = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/GET/detail/${userId}/info`);

                // 서버에서 받은 사용자 정보를 상태로 설정
                setUserName(response.data["name"]);
                setDeviceId(response.data["deviceId"]);
                setUserDetail("\n" + response.data["detail"]);
            } catch (error) {
                console.error("데이터를 가져오는 중 오류 발생:", error);
            }
        };

        // 비동기 함수 호출
        getDeviceList();
        fetchData();
    }, []); // 빈 배열을 사용하여 컴포넌트 마운트 시 한 번만 실행되도록


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
                    <Typography>사용자 번호 : {userId}</Typography>
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
