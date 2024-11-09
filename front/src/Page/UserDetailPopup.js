import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Actor from "../../../../capstone_2024_2_team_6/front/src/component/Actor";
import UserStatus from "../../../../capstone_2024_2_team_6/front/src/component/UserStatus";
import Detail from "../../../../capstone_2024_2_team_6/front/src/component/Detail";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material'; // MUI Dialog 컴포넌트 임포트
import '../css/UserDetailPopUp.css';
import StickGraph from "../../../../capstone_2024_2_team_6/front/src/component/StickGraph";
import UserAddOrEdit from "./UserAddOrEdit";

const UserDetailPopup = ({userId}) => {
    const [open, setOpen] = useState(false);  // 다이얼로그의 열림/닫힘 상태를 관리
    const [name, setName] = useState("");  // 이름 상태
    {/*
        사용자 정보를 get으로 받아오고 그 정보에서 데이터를 넣어줘야함.
    */}

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

    const [userDetail, setUserDetail] = useState("User에 대한 정보를 GET으로 받아와서 상세정보를 넣어줘야함. 그리고 메인페이지에서 UserId를 전달받아야 함. ");
    const handleDetailChange = (newDetail) => {
        setUserDetail(newDetail);
    };

    return (
        <div className="popup">
            <button className="edit-button" onClick={handleEditClick}>수정</button>

            {/* 다이얼로그 컴포넌트 */}
            <Dialog open={open}
                    onClose={handleClose}
            >
                <DialogTitle>사용자 정보 입력</DialogTitle>
                <DialogContent>
                    <UserAddOrEdit userName={name}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            <div className="upper-part">
                <div className="actor-section">
                    <div className="actor"><Actor/></div>
                    <div className="user-status">
                        <Button variant="outlined">option:Get쓰는걸로수정해야됨</Button>
                    </div>
                </div>

                <div className="detail-section">
                    <div className="details" width="100%">
                        <Detail Data={userDetail} onChange={handleDetailChange} fieldDisable="true" />
                    </div>
                </div>
            </div>

            <div className="lower-part">
                <div className="graph-section">
                    <div className="Stick-graph"><StickGraph /></div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPopup;
