import React, { useState, useEffect } from 'react';
import './MainPage.css';
import defaultImage from './images/default_profile.png';
import DeviceListDialog from './component/DeviceListDialog';
import UserListDialog from './component/UserListDialog';
import UserDetailPopup from './Page/UserDetailPopup';
import LEDSwitch from './LEDSwitch';
import axios from 'axios';
import { Dialog } from "@mui/material";
import DrousyAndStressSideBar from "./component/DrousyAndStressSideBar";
import Statistics from "./Page/Statistics";
import config from './config';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Typography from '@mui/material/Typography';
import Bedtime from '@mui/icons-material/Bedtime';
import { useNavigate } from 'react-router-dom';

const Card = styled(MuiCard)(({ theme }) => ({
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const MainPage = () => {
    const unique_Number = localStorage.getItem("unique_Number");
    console.log(unique_Number);
    return (
        <div className="Main">
            <TopAppBar unique_Number={ unique_Number } />
            <Body unique_Number={unique_Number} />
        </div>
    );
};

const TopAppBar = ({ unique_Number }) => {
    const [deviceOpen, setDeviceOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [statisticsOpen, setStatisticsOpen] = useState(false);

    const navigate = useNavigate();

    const handleLogout = () => {
      if (window.confirm('정말 로그아웃 하시겠습니까?')) {
        localStorage.removeItem('unique_Number');
        navigate('/');
      }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position='static'>
                <Toolbar>
                    <Bedtime sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}></Bedtime>
                    <Typography variant="h5" component="div" sx={{
                        mr: 2,
                        flexGrow: 1,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                    }}>
                        캡스톤디자인 6팀
                    </Typography>
                    <ButtonGroup variant='contained' color='inherit' size='large' sx={{ mr: 2.3, backgroundColor: 'white', color: 'black' }}>
                        <Button onClick={() => setUserOpen(true)}>
                            근무자 목록
                        </Button>
                        <Button onClick={() => setDeviceOpen(true)}>
                            장비 목록
                        </Button>
                        <Button onClick={()=> setStatisticsOpen(true)}>
                            통계
                        </Button>
                        <Button onClick={ handleLogout }>
                          로그아웃
                        </Button>
                    </ButtonGroup>
                </Toolbar>
            </AppBar>
            <DeviceListDialog
                open={deviceOpen}
                onClose={() => setDeviceOpen(false)}
                ID={unique_Number}
            />
            <UserListDialog
                open={userOpen}
                onClose={() => setUserOpen(false)}
                userList={["User1", "User2", "User3"]}
                ID={unique_Number}
            />
            <Statistics
                open={statisticsOpen}
                onClose={()=>setStatisticsOpen(false)}
            />
        </Box>
    );
};

const Body = ({ unique_Number }) => {
    const [dataList, setDataList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(config.apiUrl + '/api/GET/data_renew', {
                    params: { user_id: unique_Number },
                });

                if (response.status === 200) {
                    const parsedData = Object.entries(response.data).map(([device_id, value]) => {
                        const [worker_id, focus_data, stress_data] = value.split(', ');
                        return { device_id, worker_id, focus_data,  stress_data};
                    });
                    setDataList(parsedData);
                }
            } catch (error) {
                console.error("데이터 가져오기 오류", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 500);
        return () => clearInterval(interval);
    }, [unique_Number]);

    return (
        <div className="body">
            <Sidebar unique_Number={unique_Number}/>
            <Main dataList={dataList} />
        </div>
    );
};

const Sidebar = (unique_Number) => (
    <div className="sidebar">
        <div style={{height:"100%", margin: "auto" }}>
            <DrousyAndStressSideBar ID={unique_Number}/>
        </div>
        {/*<GroupList />*/}
        {/*<div className="bottomButton">*/}
        {/*    <button>추가</button>*/}
        {/*    <button>삭제</button>*/}
        {/*    <button>수정</button>*/}
        {/*</div>*/}
    </div>
);

const Main = ({ dataList }) => (
    <div className="main">
        <Card variant='outlined' sx={{ display: "flex", height: "100%", width: "100%"}}>
            {dataList.map((item, index) => (
                <Profile key={index} worker_id={item.worker_id} focus_data={item.focus_data} stress_data={item.stress_data}/>
            ))}
        </Card>
    </div>
);

const Profile = ({ worker_id, focus_data, stress_data }) => {
    const [userDetailPopUp, setUserDetailPopUp] = useState(false);
    const [name, setName] =useState(" ")

    useEffect(() => {
        // getName 함수 정의
        const getName = async () => {
            try {
                const response = await axios.get(`${config.apiUrl}/api/GET/detail/${worker_id}/name`);
                const name = response.data.name;
                setName(name);
            } catch (error) {
                console.error("Error fetching name:", error);
            }
        };

        // 5초마다 getName을 호출하도록 설정 (예: 5000ms = 5초)
        const intervalId = setInterval(() => {
            getName();
        }, 500);

        // 컴포넌트가 언마운트되거나 worker_id가 변경될 때마다 interval을 clear
        return () => clearInterval(intervalId);

    }, [worker_id]); // worker_id가 변경될 때마다 호출

    return (
        <div className="profile">
            <Card variant="outlined">
                <p>{name}</p>
                <div className="person">
                    {}
                    <img
                        src={`./images/${worker_id}.png`}
                        alt={`${worker_id} 이미지`}
                        onError={(e) => (e.target.src = defaultImage)} // 이미지가 없으면 기본 이미지 출력

                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                    />
                    {}
                    <div>
                        {/*<p>Focus Data: {parseFloat(focus_data).toFixed(5)}</p>*/}
                        <LEDSwitch type="focus" data={focus_data} />
                    </div>
                    <div>
                        {/*<p>Stress Data: {parseFloat(stress_data).toFixed(5)}</p>*/}
                        <LEDSwitch type="stress" data={stress_data} />
                    </div>
                </div>
                <Button variant="outlined" onClick={() => setUserDetailPopUp(true)}>상세 정보 확인</Button>
                <Dialog open={userDetailPopUp} onClose={() => setUserDetailPopUp(false)}>
                    <UserDetailPopup userId={worker_id} />
                </Dialog>
            </Card>
        </div>
    );
};


/*
const Profile = ({ worker_id, focus_data, stress_data }) => {
    const [userDetailPopUp, setUserDetailPopUp] = useState(false);

    return (
        <div className="profile">
            <p>{worker_id}</p>
            <div className="person">
                {} //동적 이미지 로드
                <img
                    src={`./images/${worker_id}.png`}
                    alt={`${worker_id} 이미지`}
                    onError={(e) => (e.target.src = defaultImage)} // 이미지가 없으면 기본 이미지 출력

                    style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
                {}
                //Focus와 Stress 데이터
                <div>
                    <p>Focus Data: {parseFloat(focus_data).toFixed(5)}</p>
                    <LEDSwitch data={focus_data} />
                </div>
                <div>
                    <p>Stress Data: {parseFloat(stress_data).toFixed(5)}</p>
                    <LEDSwitch data={stress_data} />
                </div>
            </div>
            {}
            //상세 정보 확인 버튼
            <button onClick={() => setUserDetailPopUp(true)}>상세 정보 확인</button>
            <Dialog open={userDetailPopUp} onClose={() => setUserDetailPopUp(false)}>
                <UserDetailPopup userId={worker_id} />
            </Dialog>
        </div>
    );
};*/

const GroupList = () => (
    <div className="grouplist">
        <ul>
            <li>메인 그룹</li>
            <ul>
                <li>사용자 1</li>
                <li>사용자 2</li>
            </ul>
            <li>하위 그룹 1</li>
            <ul>
                <li>사용자 1</li>
                <li>사용자 2</li>
            </ul>
        </ul>
    </div>
);

export default MainPage;