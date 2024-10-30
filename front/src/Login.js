import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import "./Login.css";

class Login extends Component {
    render() {
        return (
            <div className="login">
                <h1>로그인</h1>
                <label>ID</label>
                <input></input>
                <label>Password</label>
                <input></input>
                <Link to="/">
                    <button>
                        Sign in
                    </button>
                </Link>
            </div>
        );
    }
}

export default Login;