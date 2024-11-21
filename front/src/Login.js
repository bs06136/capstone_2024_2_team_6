import React, { Component, createContext } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import "./Login.css";
import config from './config';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
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

// Context 생성
export const AuthContext = createContext();

class AuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unique_number: null,
      setUniqueNumber: this.setUniqueNumber,
    };
  }

  setUniqueNumber = (unique_number) => {
    this.setState({ unique_number });
  };

  render() {
    return (
      <AuthContext.Provider value={this.state}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

class Login extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      user_id: "",
      password: "",
      errorMessage: "",
      isLoggedIn: false,
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { user_id, password } = this.state;
    const { setUniqueNumber } = this.context;

    try {
      const response = await axios.get( // 서버 주소에 맞게 변경
        config.apiUrl + "/api/GET/login", {
          method: 'GET',
          params: {
            user_id,
            password
          }
      });

      if (response.status === 200 && response.data !== "false_wrong" && response.data !== "false_error") { // 로그인 성공 시 특정 NUM을 받음
        console.log('로그인 성공:', response.data);
        setUniqueNumber(response.data);
        this.setState({ isLoggedIn: true });
      } else {
        this.setState({ errorMessage: '로그인에 실패했습니다.' });
      }
    } catch (error) {
      console.error('로그인 요청 오류:', error);
      this.setState({ errorMessage: '서버와 연결할 수 없습니다.' });
    }
  };

  render() {
    const { user_id, password, errorMessage, isLoggedIn } = this.state;
    const { unique_number } = this.context;

    if (isLoggedIn) {
      return <Navigate to="/main" state={{ unique_number: unique_number }} />;
    }

    return (
      <div className="login">
        <SignInContainer direction="column" justifyContent="space-between">
          <Card variant="outlined">
            <h1>로그인</h1>
            { errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p> }
            <form onSubmit={ this.handleSubmit }>
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
                onChange={ this.handleChange }
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
                onChange={ this.handleChange }
                required
              />
              <Button type="submit" variant='contained'>Sign in</Button>
            </form>
          </Card>
        </SignInContainer>
      </div>
    );
  }
}

export default Login;
export { AuthProvider };
