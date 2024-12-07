import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login';
import MainPageWrapper from './MainPage';

class App extends Component {
  render() {
    return (
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/main" element={<MainPageWrapper />} />
              <Route path="/workers" element={<Login />} />
              <Route path="/devices" element={<Login />} />
            </Routes>
          </div>
        </BrowserRouter>
    );
  }
}

export default App;