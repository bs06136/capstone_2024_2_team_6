import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Actor from "../component/Actor";
import UserStatus from "../component/UserStatus";
import Detail from "../component/Detail";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material'; // MUI Dialog 컴포넌트 임포트
import '../css/UserDetailPopUp.css';
import StickGraph from "../component/StickGraph";
import UserAddOrEdit from "./UserAddOrEdit";
import Typography from "@mui/material/Typography";
import axios from "axios";
import config from "../config";

const UserDetailPopup = ({userId}) => {
    const [open, setOpen] = useState(false);  // 다이얼로그의 열림/닫힘 상태를 관리
    const [name, setName] = useState("로딩중");  // 이름
    const [userDetail, setUserDetail] = useState("로딩중");
    const [option, setOption] = useState("로딩중");

    const getUserInfo = async () => {
        try
        {
            console.log("Fetching user info for userId:", userId);
            const response =
                await axios.get(`${config.apiUrl}/api/GET/detail/${userId}/info`);

        setName(response.data["name"]);
        setUserDetail(response.data["detail"]);
        setOption(response.data["option_value"]);
        }
        catch (error) {
            //donothing
        }
    }

    // 다이얼로그 열기
    const handleEditClick = () => {
        setOpen(true);
    };

    // 다이얼로그 닫기
    const handleClose = () => {
        setOpen(false);
    };

    // 이름 저장
    const handleSave = () => {
        console.log("저장된 이름:", name);  // 이름을 저장하거나 처리하는 로직
        setOpen(false);  // 다이얼로그 닫기
    };


    const handleDetailChange = (newDetail) => {
        setUserDetail(newDetail);
    };

    /*
    useEffect( () => {
            getUserInfo();
    }, [])
*/
    useEffect(() => {
        const fetchData = async () => {
            await getUserInfo();
        };
        fetchData();
    }, []);

    return (
        <div className="popup">
            <button className="edit-button" onClick={handleEditClick}>수정</button>

            {/* 다이얼로그 컴포넌트 */}
            <Dialog open={open}
                    onClose={handleClose}
            >
                <DialogTitle>사용자 정보 입력</DialogTitle>
                <DialogContent>
                    <UserAddOrEdit userName={name} userId={userId}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            <div className="upper-part">
                <div className="actor-section">
                    {name !== "로딩중" ? (
                        <div className="actor">
                            <Actor userName={name}/> {/* userName을 props로 전달 */}
                        </div>
                    ) : (
                        <div>Loading...</div> // 로딩 중 메시지
                    )}
                    <div className="user-status">
                        <Button variant="outlined">{option}</Button>
                    </div>
                </div>

                <div className="detail-section">
                    <Typography fontSize="h5">{name}</Typography>
                    <Typography fontSize="h5">{userId}</Typography>
                    <div className="details" width="100%">
                        <Detail Data={userDetail}
                                onChange={handleDetailChange}
                                fieldDisable={true}
                        />
                    </div>
                </div>
            </div>

            <div className="lower-part">
                <div className="graph-section">
                    <div className="Stick-graph"><StickGraph user_Id={userId} /></div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPopup;
