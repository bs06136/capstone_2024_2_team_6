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
import config from './config';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const Card = styled(MuiCard)(({ theme }) => ({
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

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

    return (
        <div className="topbar">
            <ul>
                <li onClick={() => setUserOpen(true)}>근무자 목록</li>
                <li onClick={() => setDeviceOpen(true)}>장비 목록</li>
                <li>목록 1</li>
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
        </div>
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
                        const [worker_id, data] = value.split(', ');
                        return { device_id, worker_id, data };
                    });
                    setDataList(parsedData);
                }
            } catch (error) {
                console.error("데이터 가져오기 오류", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000000);
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
          <Card variant="outlined" sx={{ minHeight: '700px' }}>
            <DrousyAndStressSideBar ID={unique_Number}/>
          </Card>
        </div>
    </div>
);

const Main = ({ dataList }) => (
    <div className="main">
      <Card variant="outlined" sx={{ minHeight: '700px' }}>
        {dataList.map((item, index) => (
          <Profile key={index} worker_id={item.worker_id} data={item.data} />
        ))}
      </Card>
    </div>
);

const Profile = ({ worker_id, data }) => {
    const [userDetailPopUp, setUserDetailPopUp] = useState(false);

    return (
        <div className="profile">
          <Card variant="outlined">
            <p>{worker_id}</p>
            <div className="person">
              <img src={defaultImage} alt="테스트" />
              <LEDSwitch data={data} />
            </div>
            <Button onClick={() => setUserDetailPopUp(true)}>상세 정보 확인</Button>
            <Dialog open={userDetailPopUp} onClose={() => setUserDetailPopUp(false)}>
              <UserDetailPopup userId={worker_id} />
            </Dialog>
          </Card>
        </div>
    );
};

export default MainPage;
