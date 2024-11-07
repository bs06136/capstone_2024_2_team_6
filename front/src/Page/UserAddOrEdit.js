import React, { useEffect } from 'react';
import Actor from "../component/Actor";
import Detail from "../component/Detail";
import Button from "@mui/material/Button";
import "../css/UserAddOrEdit.css";
import Typography from "@mui/material/Typography";
import axios from "axios";
import TextField from "@mui/material/TextField";

function UserAddOrEdit() {

    const [userName, setUserName] = React.useState("사용자 이름");
    const [deviceId, setDeviceId] = React.useState("장치번호");
    const [userDetail, setUserDetail] = React.useState("");  // 기본값을 빈 문자열로 설정

    //GET 요청.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/GET/1234/data');
                setUserName(response.data["name"]);
                setDeviceId(response.data["deviceId"]);
                setUserDetail("\n" + response.data["detailData"]);
            } catch (error) {
                console.error("데이터를 가져오는 중 오류 발생:", error);
            }
        };

        fetchData();
    }, []);

    //Post 요청
    const saveButton = async () => {
        try {
            const response = await axios.post('http://localhost:8080/api/POST/user/enrollment', {
                name: userName,
                deviceId: deviceId,
                detailData: userDetail
            });
            console.log('서버 응답:', response.data);
        } catch (error) {
            console.error("saveButton ERROR!!!", error);
        }
    }
    //Detail 이벤트 핸들러. -> child객체에 있는 값 읽어오는거
    const handleDetailChange = (newDetail) => {
        setUserDetail(newDetail);
    };

    return (
        <div className="UserAddOrEdit">
            <div className="UserImage">
                <Actor />
                <div className="text">
                    <Typography variant="h7" margin="10px"> 이름 </Typography>
                    <TextField
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <Typography variant="h7" margin="10px"> 장치번호 </Typography>
                    <TextField disabled={true} value={deviceId} />
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
                <Button variant="outlined" className="wake"> 각성 </Button>
                <Button variant="outlined" className="sleep"> 수면 </Button>
            </div>

            <Button variant="contained" onClick={saveButton}>저장하기</Button>
        </div>
    );
}

export default UserAddOrEdit;
