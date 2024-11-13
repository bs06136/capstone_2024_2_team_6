import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import MainPage from './MainPage';
import Login from './Login';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Routes>
          <Route path="/" element={<Login></Login>}></Route>
            <Route path="/main" element={<MainPage></MainPage>}></Route>
          </Routes>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;