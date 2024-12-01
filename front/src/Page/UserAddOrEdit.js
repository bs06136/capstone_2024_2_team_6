import React, { useEffect, useState } from 'react';
import Actor from "../component/Actor";
import Detail from "../component/Detail";
import Button from "@mui/material/Button";
import "../css/UserAddOrEdit.css";
import Typography from "@mui/material/Typography";
import axios from "axios";
import TextField from "@mui/material/TextField";
import config from "../config";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";

function UserAddOrEdit({ givenName, userId }) {
    const ID = localStorage.getItem("uniqueNumber");

    const [userName, setUserName] = useState(givenName);
    const [deviceId, setDeviceId] = useState("장치번호");
    const [userDetail, setUserDetail] = useState(" ");
    const [trackingOption, setTrackingOption] = useState("0"); // 0은 각성, 1은 졸음, 2는 수면
    const [deviceList, setDeviceList] = useState(["Loading", "Loading", "Loading"]);
    const [selectedDevice, setSelectedDevice] = useState('');
    const [inputUserId, setInputUserId] = useState(userId);  // 사용자 번호를 입력받을 상태 추가

    // GET 요청
    console.log(userId);
    useEffect(() => {
        // device 목록을 가져오는 비동기 함수
        const getDeviceList = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/GET/${ID}/device_list`);

                const device = response.data.device.split(',');
                setDeviceList(device);
            } catch (error) {
                console.error('장비 목록을 가져오는 중 에러 발생:', error);
            }
        };
        getDeviceList();

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
                worker_name: userName,
                worker_id: inputUserId,  // 입력된 사용자 번호를 전달
                detail: userDetail,
                option: trackingOption,
                device_Id: selectedDevice,
                admin_id: ID
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

    const handleDeviceChange = (event) => {
        setSelectedDevice(event.target.value); // 선택된 장비 업데이트
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
                    <br/>
                    <TextField
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        label={"이름"}
                    />
                    <br/>
                    <TextField
                        value={inputUserId}
                        onChange={(e) => setInputUserId(e.target.value)} // 사용자 번호 입력 변경
                        label="사용자번호"
                    />
                    <br/>
                    <FormControl fullWidth>
                        <InputLabel id="device-select-label">장치번호</InputLabel>
                        <Select
                            labelId="device-select-label"
                            value={selectedDevice}
                            onChange={handleDeviceChange}
                            fullWidth
                            disabled={false}  // 비활성화 여부를 동적으로 설정할 수 있습니다.
                            label="Select Device"
                        >
                            <MenuItem value="">
                                <em>장비를 선택하세요</em>
                            </MenuItem>
                            {deviceList.map((device, index) => (
                                <MenuItem key={index} value={device}>
                                    {device}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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