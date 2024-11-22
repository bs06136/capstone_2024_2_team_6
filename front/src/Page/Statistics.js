import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Box, Card, CardContent, Grid, Tab, Tabs } from "@mui/material";
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

function Statistics() {
    const ID = localStorage.getItem("uniqueNumber");
    const [value, setValue] = useState(0);

    // 시작일자와 종료일자를 관리하는 상태
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
            const response =await axios.get(`${config.apiUrl}/api/GET/detail/data_period`, {
                params: {
                    worker_id: ID,
                    start_time: startDate,
                    end_time: endDate
                }
            })
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

    return (
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
                    <DailyStatistics Data={serverResponse}/>
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <MonthlyStatistics Data={serverResponse}/>
                </TabPanel>
                <TabPanel value={value} index={2}>
                    그래프
                    <StatisticsGraph Data={serverResponse}/>
                </TabPanel>
            </Box>
        </Box>
    );
}

export default Statistics;
