import Button from "@mui/material/Button";
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText } from "@mui/material";
import TextField from "@mui/material/TextField";
import "../css/ListDialog.css";
import React, {useEffect, useState} from "react";
import axios from "axios";
import config from "../config";

function DeviceListDialog({ open, onClose, ID}) {
    const [newDevice, setNewDevice] = useState(""); // 입력된 장비 추가 ID 상태
    const [deviceList,setDeviceList] = useState(["Loading", "Loading", "Loading"]); //이것도 수정해야됨. Main 화면으로부터 받아오거나 GET을 추가해야됨.

    console.log("DeviceListDialog")
    console.log(open)
    console.log(onClose)
    console.log(`${ID}`)
    // GET 요청
    useEffect(() => {
        // device 목록을 가져오는 비동기 함수
        const getDeviceList = async () => {
            try {
                // 서버의 data_renew API를 호출
                const response = await axios.get(`${config.apiUrl}/api/GET/data_renew` , {
                    params: {
                        user_id:`${ID}`
                    }
                });


                // 서버로부터 받은 데이터가 JSON 형태일 때
                if (response.data) {
                    // 서버 응답에서 device 목록 추출
                    const deviceData = response.data;
                    const devices = Object.keys(deviceData); // JSON 객체의 key를 사용하여 device 목록 추출

                    // device 목록을 상태로 설정
                    console.log(devices);
                    setDeviceList(devices);
                }
            } catch (error) {
                console.error("Error fetching device list:", error);
            }
        };
        getDeviceList();
    },[open]);

    // TextField의 입력 값을 상태에 저장
    const handleChange = (event) => {
        setNewDevice(event.target.value);
    };

    // 추가 버튼 클릭 시 실행
    const onClickAddButton = async () => {
        try {
            const response = await axios.post(`${config.apiUrl}/api/POST/device/enrollment`, {
                device_id: newDevice,

            });
        }catch (error) {
            {/*일단 아무것도 안함. */}
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <div className="dialog">
                <DialogTitle>장비목록</DialogTitle>
                <DialogContent>
                    <List className="List">
                        {deviceList.map((device, index) => (
                            <div key={index}>
                                <ListItem>
                                    <ListItemText primary={device} />
                                </ListItem>
                                {index < deviceList.length - 1 && <Divider component="li" />}
                            </div>
                        ))}
                    </List>
                    <div className="addDevice">
                        <TextField
                            label="장비추가"
                            value={newDevice}
                            onChange={handleChange}
                        />
                        <Button onClick={onClickAddButton}>장비추가</Button>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">닫기</Button>
                </DialogActions>
            </div>
        </Dialog>
    );
}

export default DeviceListDialog;
