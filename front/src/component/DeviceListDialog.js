import Button from "@mui/material/Button";
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText } from "@mui/material";
import TextField from "@mui/material/TextField";
import "../css/ListDialog.css";
import { useState } from "react";
import axios from "axios";

function DeviceListDialog({ open, onClose, deviceList }) {
    const [newDevice, setNewDevice] = useState(""); // 입력된 장비 추가 ID 상태

    // TextField의 입력 값을 상태에 저장
    const handleChange = (event) => {
        setNewDevice(event.target.value);
    };

    // 추가 버튼 클릭 시 실행
    const onClickAddButton = async () => {
        try {
            const response = await axios.post(`${config.apiUrl}/api/POST/device/enrollment`, {
                DeviceID: newDevice
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
