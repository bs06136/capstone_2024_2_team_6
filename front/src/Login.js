import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import "./Login.css";
import config from './config';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Lock from '@mui/icons-material/Lock';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '300%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto 0',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
      'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
        'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
        'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
          'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

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
    localStorage.setItem("unique_Number", unique_number);
    return <Navigate to="/main" />;
  }

  return (
      <div className="login">
        <SignInContainer direction="column" justifyContent="space-between">
          <Card variant="outlined">
            <h1>로그인</h1>
            { errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p> }
            <form onSubmit={ handleSubmit }>
              <TextField
                  type="text"
                  name="user_id"
                  slotProps={{
                    input: {
                      startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircle />
                          </InputAdornment>
                      ),
                    },
                  }}
                  size='small'
                  margin='normal'
                  fullWidth
                  placeholder='Enter your username'
                  value={ user_id }
                  onChange={ handleChange }
                  required
              />
              <TextField
                  type="password"
                  name="password"
                  slotProps={{
                    input: {
                      startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                      ),
                    },
                  }}
                  size='small'
                  margin='normal'
                  fullWidth
                  placeholder='Enter your password'
                  value={ password }
                  onChange={ handleChange }
                  required
              />
              <Button type="submit" variant='contained'>Sign in</Button>
            </form>
          </Card>
        </SignInContainer>
      </div>
  );
}

export default Login;