import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';
import defaultImage from './images/default_profile.png';
import LEDSwitch from './LEDSwitch';
import axios from 'axios';


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
  render() {
    return (
      <div className="topbar">
        <ul>
          <Link to="/">
            <li>근무자 목록</li>
          </Link>
          <Link to="/">
            <li>장비 목록</li>
          </Link>
          <li>목록 1</li>
          <li>목록 2</li>
        </ul>
      </div>
    );
  }
}
  
class Body extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataList: [],
      unique_number: props.unique_number
    };
  }

  componentDidMount() {
    this.fetchData();

    // N 초마다 데이터를 갱신하도록 설정
    this.interval = setInterval(this.fetchData, 5000);  // 5초
  }

  componentWillUnmount() {
    // 컴포넌트 언마운트 시 interval 정리
    clearInterval(this.interval);
  }

  fetchData = async() => {
    const { unique_number } = this.state;

    try {
      const response = await axios.get(
        'https://e35c447b-f64a-49f7-b716-ad3207d52ba3.mock.pstmn.io/api/GET/data_renew', {  // 서버 주소에 맞게 변경
        params: {
          user_id: unique_number
        }
      });

      if (response.status == 200) {
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
        <Main dataList={ dataList }></Main>
      </div>
    )
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
  render() {
    const worker_id = this.props.worker_id;
    const data = this.props.data;

    return (
      <div className="profile">
        <p>{ worker_id }</p>
        <div className="person">
          <img src={ defaultImage } alt="테스트"></img>
          <LEDSwitch data={ data }></LEDSwitch>
        </div>
        <button>
          상세 정보 확인
        </button>
      </div>
    );
  }
}

export default MainPage;