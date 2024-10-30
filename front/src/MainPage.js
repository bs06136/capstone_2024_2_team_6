import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';
import defaultImage from './images/default_profile.png';

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
        <Link to="/login">
          <div className="logo">
            <h1>캡스톤디자인 6팀</h1>
          </div>
        </Link>
        
      )
    }
  }
  
  class Body extends Component {
    render() {
      return (
        <div className="body">
          <Sidebar></Sidebar>
          <Main></Main>
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
      return (
        <div className="main">
          <Profile number="1"></Profile>
          <Profile number="2"></Profile>
          <div className="buttons">
            <button>추가</button>
            <button>삭제</button>
          </div>
        </div>
      );
    }
  }
  
  class Profile extends Component {
    render() {
      return (
        <div className="profile">
          <p>사용자 {this.props.number}</p>
          <div className="person">
            <img src={defaultImage} alt="테스트"></img>
            <ul>
              <li>각성</li>
              <li>졸음</li>
            </ul>
          </div>
          <button>
            상세 정보 확인
          </button>
        </div>
      );
    }
  }
  
  export default MainPage;