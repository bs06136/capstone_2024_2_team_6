import Button from "@mui/material/Button";
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText } from "@mui/material";
import "../css/ListDialog.css";
import { useEffect, useState } from "react";
import UserAddOrEdit from "../Page/UserAddOrEdit";
import axios from "axios";
import config from "../config";

function UserListDialog({ open, onClose, userList}) {
    const ID = localStorage.getItem("uniqueNumber");
    const [addUserOpen, setAddUserOpen] = useState(false);
    const [userNames, setUserNames] = useState([]);
    const [users, setUsers] = useState([]); // 사용자 목록 상태


    // 사용자 추가 다이얼로그 열기/닫기 핸들러
    const handleAddUserOpen = () => {
        setAddUserOpen(true);
    };
    const handleAddUserClose = () => {
        setAddUserOpen(false);
    };

    console.log("UserListDialog Props: ", { open, onClose, userList, ID });

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             // API 요청 보내기
    //             const response = await axios.get(`${config.apiUrl}/api/GET/data_renew`, {
    //                 params: { user_id: ID },
    //             });
    //
    //
    //             // 응답 데이터 처리
    //             const data = response.data;
    //             const names = Object.keys(data);
    //
    //             console.log(data);
    //
    //
    //             setUserNames(names);
    //         } catch (error) {
    //             console.error("데이터 가져오기 실패:", error);
    //         }
    //     };
    //
    //     if (open) {
    //         fetchData();
    //     }
    // }, [open, ID]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = {
                    worker: "Alice,Bob,Charlie,David,Eve,Frank,Grace,Heidi"
                }
                // const response = await axios.get(`${config.apiUrl}/api/GET/${ID}/device_list`);

                const userList = response.worker.split(',');
                console.log(userList)
                setUsers(userList);

            } catch (error) {
                console.error('데이터를 가져오는 중 에러 발생:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Dialog open={open} onClose={onClose}>
            <div className="dialog">
                <DialogTitle>사용자목록</DialogTitle>
                <DialogContent>
                    <List>
                        {users.map((user, index) => (
                            <div key={index}>
                                <ListItem>
                                    <ListItemText primary={user} />
                                </ListItem>
                                {index < userNames.length - 1 && <Divider component="li" />}
                            </div>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddUserOpen}>사용자 추가</Button>
                    <Button onClick={onClose} color="primary">닫기</Button>
                </DialogActions>
                <Dialog open={addUserOpen} onClose={handleAddUserClose}>
                    <UserAddOrEdit givenName={"새로운 사용자"} userId={ID} />
                </Dialog>
            </div>
        </Dialog>
    );
}

export default UserListDialog;
