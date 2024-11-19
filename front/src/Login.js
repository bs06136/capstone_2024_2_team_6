import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import "./Login.css";
import config from './config';

function Login() {
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unique_number, setUniqueNumber] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "user_id") setUserId(value);
    else if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`${config.apiUrl}/api/GET/login`, {
        params: {
          user_id,
          password,
        },
      });

      if (response.status === 200 && response.data !== "false_wrong" && response.data !== "false_error") {
        console.log("로그인 성공:", response.data);
        setIsLoggedIn(true);
        setUniqueNumber(response.data);
      } else {
        setErrorMessage("로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 요청 오류:", error);
      setErrorMessage("서버와 연결할 수 없습니다.");
    }
  };

  if (isLoggedIn) {
    localStorage.setItem("uniqueNumber", unique_number);
    return <Navigate to="/main" />;
  }

  return (
      <div className="login">
        <h1>로그인</h1>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <label>ID</label>
          <input
              type="text"
              name="user_id"
              value={user_id}
              onChange={handleChange}
              required
          />
          <label>Password</label>
          <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              required
          />
          <button type="submit">Sign in</button>
        </form>
      </div>
  );
}

export default Login;
