import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import "./Login.css";
import config from './config';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: "",
      password: "",
      errorMessage: "",
      isLoggedIn: false,
      unique_number: ""
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    
    const { user_id, password } = this.state;
    
    try {
      const response = await axios.get( // 서버 주소에 맞게 변경
        config.apiUrl + "/api/GET/login", {
          method: 'GET',
          params: {
            user_id,
            password
          }
      });

      if (response.status == 200 && response.data !== "false_wrong" && response.data !== "false_error") { // 로그인 성공 시 특정 NUM을 받음
        console.log('로그인 성공:', response.data);
        this.setState({ isLoggedIn: true, unique_number: response.data });
      } else {
        this.setState({ errorMessage: '로그인에 실패했습니다.' });
      }
    } catch (error) {
      console.error('로그인 요청 오류:', error);
      this.setState({ errorMessage: '서버와 연결할 수 없습니다.' });
    }
  };

  render() {
    const { user_id, password, errorMessage, isLoggedIn, unique_number } = this.state;

    if (isLoggedIn) {
      return <Navigate to="/main" state={{ unique_number: unique_number }}></Navigate>;
    }

    return (
      <div className="login">
        <h1>로그인</h1>
        { errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p> }
        <form onSubmit={ this.handleSubmit }>
          <label>ID</label>
          <input type="text" name="user_id" value={ user_id } onChange={ this.handleChange } required></input>
          <label>Password</label>
          <input type="password" name="password" value={ password } onChange={ this.handleChange } required></input>
          <button type="submit">Sign in</button>
        </form>
      </div>
    );
  }
}

export default Login;