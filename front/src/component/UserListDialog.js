import Button from "@mui/material/Button";
import { Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, ListItemText } from "@mui/material";
import "../css/ListDialog.css";
import { useState } from "react";
import UserAddOrEdit from "../Page/UserAddOrEdit";
import Typography from "@mui/material/Typography";

function UserListDialog({ open, onClose, userList, ID }) {
    const [addUserOpen, setAddUserOpen] = useState(false);
    // 사용자 추가 다이얼로그 열기/닫기 핸들러
    const handleAddUserOpen = () => {
        setAddUserOpen(true);
    };
    const handleAddUserClose = () => {
        setAddUserOpen(false);
    };
    console.log("UserListDialog Props: ", { open, onClose, userList: ["User1", "User2", "User3"], ID });


    return (
        <Dialog open={open} onClose={onClose}>
            <div className="dialog">
                <DialogTitle>사용자목록</DialogTitle>
                <DialogContent>
                    <List>
                        {userList.map((user, index) => (
                            <div key={index}>
                                <ListItem>
                                    <ListItemText primary={user} />
                                </ListItem>
                                {index < userList.length - 1 && <Divider component="li" />}
                            </div>
                        ))}
                    </List>

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddUserOpen}>사용자 추가</Button>
                    <Button onClick={onClose} color="primary">닫기</Button>
                </DialogActions>
                <Dialog open={addUserOpen} onClose={handleAddUserClose}>
                    <UserAddOrEdit givenName={"새로운 사용자"} userId={ID}/>
                </Dialog>
            </div>
        </Dialog>
    );
}

export default UserListDialog;
