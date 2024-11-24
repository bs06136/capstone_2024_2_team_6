import Button from "@mui/material/Button";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import TextField from "@mui/material/TextField";
import "../css/ListDialog.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";

function DeviceListDialog({ open, onClose }) {
    const ID = localStorage.getItem("uniqueNumber");
    const [devices, setDevices] = useState([]); // 장비 목록 상태
    const [selectedDevice, setSelectedDevice] = useState(''); // 선택된 장비 상태
    const [newDevice, setNewDevice] = useState(''); // 새 장비 이름 상태

    // 장비 목록을 가져오는 useEffect
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = {
                    devices: "Device1,Device2,Device3,Device4,Device5"
                };
                // 실제 API 호출: const response = await axios.get(`${config.apiUrl}/api/GET/${ID}/device_list`);

                const deviceList = response.data.devices.split(',');
                setDevices(deviceList);
            } catch (error) {
                console.error('장비 목록을 가져오는 중 에러 발생:', error);
            }
        };

        fetchData();
    }, []);


    // 새로운 장비 이름 입력 처리
    const handleNewDeviceChange = (event) => {
        setNewDevice(event.target.value);
    };


    const onClickAddButton = async () => {
        if (newDevice.trim()) {
            try {
                const response = await axios.post(`${config.apiUrl}/api/POST/device/enrollment`, {
                    user_id: ID,
                    device_id: newDevice
                });

                if (response.status === 200) {
                    setDevices((prevDevices) => [...prevDevices, newDevice]);
                    setNewDevice(''); // 입력 필드 초기화
                }
            } catch (error) {
                console.error('장비 추가 실패:', error);
            }
        } else {
            alert('장비 이름을 입력하세요');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <div className="dialog">
                <DialogTitle>장비목록</DialogTitle>
                <DialogContent>
                    <List className="List">
                        {devices.map((device, index) => (
                            <div key={index}>
                                <ListItem>
                                    <ListItemText primary={device} />
                                </ListItem>
                                <Divider />
                            </div>
                        ))}
                    </List>


                    <TextField
                        label="장비추가"
                        value={newDevice}
                        onChange={handleNewDeviceChange}
                        fullWidth
                        sx={{ marginBottom: 2 }}
                    />

                    <Button onClick={onClickAddButton} variant="contained" color="primary">
                        장비추가
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">닫기</Button>
                </DialogActions>
            </div>
        </Dialog>
    );
}

export default DeviceListDialog;
