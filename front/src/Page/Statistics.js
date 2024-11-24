import React, {useEffect, useState} from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
    Box,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid, MenuItem, Select,
    Tab,
    Tabs
} from "@mui/material";
import DailyStatistics from "../component/statistics/DailyStatistics";
import MonthlyStatistics from "../component/statistics/MonthlyStatistics";
import StatisticsGraph from "../component/statistics/StatisticsGraph";
import axios from "axios";
import config from "../config";

// a11yProps 함수: 탭에 접근성 속성을 추가하는 함수
function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        "aria-controls": `vertical-tabpanel-${index}`,
    };
}

// TabPanel 컴포넌트: 각 탭의 내용을 렌더링
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ padding: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function Statistics({ open, onClose}) {
    const ID = localStorage.getItem("uniqueNumber");
    const [value, setValue] = useState(0);
    const [users, setUsers] = useState([]); // 사용자 목록 상태
    const [selectedUser, setSelectedUser] = useState(''); // 선택된 사용자 상태


    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [serverResponse, setServerResponse] = useState("");

    // 입력 필드 값 변화 처리 함수
    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    // 입력 버튼 클릭 시 실행되는 함수
    const handleSubmit = async () => {
        // 시작일자와 종료일자가 비어있는지 체크
        if (startDate && endDate) {
            const formattedStartDate = new Date(startDate).toISOString().split('T')[0];  // yyyy-mm-dd
            const formattedEndDate = new Date(endDate).toISOString().split('T')[0];  // yyyy-mm-dd
            console.log("시작일자:", formattedStartDate);
            console.log("종료일자:", formattedEndDate);

            // const response =await axios.get(`${config.apiUrl}/api/GET/detail/data_period`, {
            //     params: {
            //         worker_id: ID,
            //         start_time: startDate,
            //         end_time: endDate
            //     }
            // })

            const response = {
                status: "success",
                message: "Data retrieved successfully",
                body: {
                    day: ["2024-10-15", "2024-10-15", "2024-10-16", "2024-11-19", "2024-11-19", "2024-11-19", "2024-11-20", "2024-11-20", "2024-12-05", "2024-12-05", "2024-12-06"],
                    stress: ["0.4", "0.5", "0.6", "0.1", "0.2", "0.3", "0.5", "0.5", "0.3", "0.4", "0.2"],
                    concentration: ["3", "3.5", "4", "5", "4", "3", "2", "3.5", "4", "4.2", "3.8"]
                },
                metadata: {
                    total_entries: 11,
                    request_time: "2024-11-22T12:00:00Z",
                    processing_time_ms: 45
                }
            };
            setServerResponse(response);
            console.log(serverResponse);

        } else {
            alert("시작일자와 종료일자를 모두 입력해주세요.");
        }
    };

    // 탭 변화 처리 함수
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const 리셋 = () => {
        setServerResponse("");
    }

    //사용자 목록 부르는 useEffect
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

    const UserListhandleChange = (event) => {
        setSelectedUser(event.target.value);
    };


    return (
        <Dialog
            open={open}
            onClose={onClose}
            sx={{"& .MuiDialog-paper": {
               width: "650px", maxWidth: "1000px"
            },}}
        >
            <DialogTitle>사용자 통계</DialogTitle>

            <Select value={selectedUser} onChange={UserListhandleChange} fullWidth>
                <MenuItem value="">
                    사용자를 선택하세요
                </MenuItem>
                {users.map((user, index) => (
                    <MenuItem key={index} value={user}>
                        {user}
                    </MenuItem>
                ))}
            </Select>

            <DialogContent>
                <Box sx={{ padding: 2, display: "flex" }}>
                    {/* 좌측 입력 섹션 */}
                    <Box>
                        <Grid container spacing={1} justifyContent="center">
                            {/* 시작일자 */}
                            <Grid item>
                                <Card variant="outlined" sx={{ minWidth: 150, padding: 1 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ marginBottom: 1 }}>
                                            시작일자
                                        </Typography>
                                        <TextField
                                            variant="outlined"
                                            margin="normal"
                                            size="small"
                                            sx={{ width: 200 }}
                                            value={startDate}
                                            onChange={handleStartDateChange}
                                            type="date" // HTML5의 date input 사용
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 종료일자 */}
                            <Grid item>
                                <Card variant="outlined" sx={{ minWidth: 150, padding: 1 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ marginBottom: 1 }}>
                                            종료일자
                                        </Typography>
                                        <TextField
                                            variant="outlined"
                                            margin="normal"
                                            size="small"
                                            sx={{ width: 200 }}
                                            value={endDate}
                                            onChange={handleEndDateChange}
                                            type="date" // HTML5의 date input 사용
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* 입력 및 리셋 버튼 */}
                        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2, gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ padding: "8px 16px", borderRadius: 20, fontSize: 14 }}
                                onClick={handleSubmit}
                            >
                                입력
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                sx={{ padding: "8px 16px", borderRadius: 20, fontSize: 14 }}
                                onClick={리셋}
                            >
                                리셋
                            </Button>
                        </Box>

                        <br />
                        <Tabs
                            orientation="horizontal"
                            variant="scrollable"
                            value={value}
                            onChange={handleChange}
                            aria-label="horizontal tabs"
                            sx={{
                                border: "1px solid",
                                borderRadius: "10px",
                                borderRight: 1,
                                borderColor: "divider",
                            }}
                        >
                            <Tab label="일별 통계" {...a11yProps(0)} />
                            <Tab label="월별 통계" {...a11yProps(1)} />
                            <Tab label="그래프" {...a11yProps(2)} />
                        </Tabs>
                        <TabPanel value={value} index={0}>
                            <DailyStatistics Data={serverResponse.body}/>
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            <MonthlyStatistics Data={serverResponse.body}/>
                        </TabPanel>
                        <TabPanel value={value} index={2}>
                            그래프
                            <StatisticsGraph Data={serverResponse.body}/>
                        </TabPanel>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">닫기</Button>
            </DialogActions>
        </Dialog>
    );
}

export default Statistics;
