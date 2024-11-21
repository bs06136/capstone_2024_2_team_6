import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './Login';
import './MainPage.css';
import defaultImage from './images/default_profile.png';
import DeviceListDialog from './component/DeviceListDialog';
import UserListDialog from './component/UserListDialog';
import UserDetailPopup from './Page/UserDetailPopup';
import LEDSwitch from './LEDSwitch';
import axios from 'axios';
import { Dialog } from "@mui/material";
import config from './config';
import Card from "@mui/material"

class MainPage extends Component {
    render() {
      return (
        <div className="Main">
          <Logo></Logo>
          <hr></hr>
          <Body></Body>
        </div>
      );
    }
  }
  
class Logo extends Component {
  render() {
    return (
      <div className="logo">
        <h1>
          <Link to="/">
            캡스톤디자인 6팀
          </Link>
        </h1>
        <Topbar></Topbar>
      </div>
    );
  }
}

class Topbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceOpen: false, // 다이얼로그의 열림/닫힘 상태
      userOpen: false, // 다이얼로그의 열림/닫힘 상태
      //unique_number: props.unique_number
    };
  }

  // 다이얼로그 열기
  DeviceListClick = () => {
    this.setState({ deviceOpen: true });
  };

  UserListClick = () => {
    this.setState({ userOpen: true });
  };

  // 다이얼로그 닫기
  DeviceListClose = () => {
    this.setState({ deviceOpen: false });
  };

  UserListClose = () => {
    this.setState({ userOpen: false });
  };

  render() {
    const { deviceOpen, userOpen } = this.state;

    return (
      <div className="topbar">
        <ul>
          <li onClick={ this.UserListClick }>근무자 목록</li>
          <li onClick={ this.DeviceListClick }>장비 목록</li>
          <li>목록 1</li>
          <li>목록 2</li>
        </ul>
        <DeviceListDialog open={ deviceOpen } onClose={ this.DeviceListClose }></DeviceListDialog>
        <UserListDialog
          open={ userOpen }
          onClose={ this.UserListClose }
          userList={ ["User1", "User2", "User3"] }
        ></UserListDialog>
      </div>
    );
  }
}
  
class Body extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      dataList: [],
    };
  }

  componentDidMount() {
    this.fetchData();

    // N 초마다 데이터를 갱신하도록 설정
    this.interval = setInterval(this.fetchData, 5000000);  // 5000초
  }

  componentWillUnmount() {
    // 컴포넌트 언마운트 시 interval 정리
    clearInterval(this.interval);
  }

  fetchData = async () => {
    const { unique_number } = this.context;

    console.log("MainPage unique_number : ", unique_number)

    try {
      const response = await axios.get(
        config.apiUrl + '/api/GET/data_renew', {  // 서버 주소에 맞게 변경
          params: {
            user_id: unique_number
          }
        }
      );

      if (response.status === 200) {
        // 서버에서 받은 데이터를 JSON 형식으로 파싱하고 요소들을 구분하여 배열로 저장
        const dataList = Object.entries(response.data).map(([device_id, value]) => {
          const [worker_id, data] = value.split(', ');
          return { device_id, worker_id, data };
        });
        // 파싱한 배열 데이터를 state에 저장
        this.setState({ dataList });
        //console.log("데이터 갱신중...");
      }
    } catch (error) {
      console.error("데이터 가져오기 오류", error);
    }
  };

  render() {
    const { dataList } = this.state;

    return (
      <div className="body">
        <Sidebar></Sidebar>
        <Main dataList={dataList}></Main>
      </div>
    );
  }
}
  
class Sidebar extends Component {
  render() {
    return (
      <div className="sidebar">
        <h1>사이드</h1>
        <GroupList></GroupList>
        <div className="bottomButton">
          <button>추가</button>
          <button>삭제</button>
          <button>수정</button>
        </div>
      </div>
    );
  }
}
  
class GroupList extends Component {
  render() {
    return (
      <div className='grouplist'>
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
  }
}
  
class Main extends Component {
  render() {
    const dataList = this.props.dataList;

    return (
      <div className="main">
        {dataList.map((item, index) => (
          <Profile key={ index } worker_id={ item.worker_id } data={ item.data }></Profile>
        ))}
      </div>
    );
  }
}
  
class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userDetailPopUp: false,
    };
  }

  UserClick = () => {
    this.setState({ userDetailPopUp: true });
  };

  UserClickClose = () => {
    this.setState({ userDetailPopUp: false });
  };

  render() {
    const worker_id = this.props.worker_id;
    const data = this.props.data;
    const { userDetailPopUp } = this.state;

    return (
      <div className="profile">
        <p>{ worker_id }</p>
        <div className="person">
          <img src={ defaultImage } alt="테스트"></img>
          <LEDSwitch data={ data }></LEDSwitch>
        </div>
        <button onClick={ this.UserClick }>
          상세 정보 확인
        </button>
        <Dialog open={userDetailPopUp} onClose={this.UserClickClose}>
          <UserDetailPopup userId={ worker_id } />
        </Dialog>
      </div>
    );
  }
}

export default MainPage;