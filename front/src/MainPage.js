import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import config from "./config";

const MainPage = () => {
    const uniqueNumber = localStorage.getItem("uniqueNumber");
    console.log(uniqueNumber);
    return (
        <div className="Main">
            <Logo unique_Number={uniqueNumber}/>
            <hr />
            <Body unique_Number={uniqueNumber} />
        </div>
    )
};

const Logo = ({unique_Number}) => (
    <div className="logo">
        <h1>
            <Link to="/">캡스톤디자인 6팀</Link>
        </h1>
        <Topbar unique_Number={unique_Number}/>
    </div>
);

const Topbar = ({ unique_Number }) => {
    const [deviceOpen, setDeviceOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [statisticsOpen, setStatisticsOpen] = useState(false);

    return (
        <div className="topbar">
            <ul>
                <li onClick={() => setUserOpen(true)}>근무자 목록</li>
                <li onClick={() => setDeviceOpen(true)}>장비 목록</li>
                <li onClick={()=> setStatisticsOpen(true)}>통계</li>
                <li>목록 2</li>
            </ul>
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
        </div>
    );
};

const Body = ({ unique_Number }) => {
    const [dataList, setDataList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/GET/data_renew', {
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
        const interval = setInterval(fetchData, 5000);
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

const Main = ({ dataList }) => (
    <div className="main">
        {dataList.map((item, index) => (
            <Profile key={index} worker_id={item.worker_id} focus_data={item.focus_data} stress_data={item.stress_data}/>
        ))}
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
            <p>{name}</p>
            <div className="person">
                <img src={defaultImage} alt="테스트" />
                <LEDSwitch focus_data={focus_data} />
                <LEDSwitch stress_data={stress_data} />
            </div>
            <button onClick={() => setUserDetailPopUp(true)}>상세 정보 확인</button>
            <Dialog open={userDetailPopUp} onClose={() => setUserDetailPopUp(false)}>
                <UserDetailPopup userId={worker_id} />
            </Dialog>
        </div>
    );
};

export default MainPage;
