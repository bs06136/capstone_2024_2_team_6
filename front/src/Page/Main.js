import Button from "@mui/material/Button";
import DeviceListDialog from "../component/DeviceListDialog";
import {useState} from "react";
import UserListDialog from "../component/UserListDialog";
import UserDetailPopup from "./UserDetailPopup";
import {Dialog, DialogActions} from "@mui/material";

function Main () {
    const [deviceOpen, setDeviceOpen] = useState(false); // 다이얼로그의 열림/닫힘 상태
    const [userOpen, setUserOpen] = useState(false); // 다이얼로그의 열림/닫힘 상태
    const [userDetailPopUp, setUserDetailPopUp] = useState(false);

    // 다이얼로그 열기
    const DeviceListClick = () => {
        setDeviceOpen(true);
    };
    const UserListClick = () => {
        setUserOpen(true);
    };
    const UserClick = () => {
        setUserDetailPopUp(true);
    }

    // 다이얼로그 닫기
    const DeviceListClose = () => {
        setDeviceOpen(false);
    };
    const UserListClose = () => {
        setUserOpen(false);
    };
    const UserClickClose = () => {
        setUserDetailPopUp(false);
    }

    return (
        <div>
            {/* 버튼을 클릭하면 다이얼로그가 열림 */}
            <Button onClick={DeviceListClick}>장비목록</Button>
            <Button onClick={UserListClick}>사용자추가</Button>
            <Button onClick={UserClick}>사용자</Button>
            <DeviceListDialog
                open={deviceOpen}
                onClose={DeviceListClose}
            />
            <UserListDialog
                open={userOpen}
                onClose={UserListClose}
                userList={["User1","User2","User3"]}
            />
            <Dialog open={userDetailPopUp} onClose={UserClickClose}>
                <UserDetailPopup userId={6594593}/>
            </Dialog>


        </div>
    );
}

export default Main;