import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import MainPage from './MainPage';
import Login from './Login';
import Statistics from "./Page/Statistics";
import StickGraph from "./component/StickGraph";


class App extends Component {
  render() {
    return (
    //   <BrowserRouter>
    //     <div className="App">
    //       <Routes>
    //         <Route path="/" element={<Login></Login>}></Route>
    //         <Route path="/main" element={<MainPage></MainPage>}></Route>
    //         <Route path="/workers" element={<Login></Login>}></Route>
    //         <Route path="devices" element={<Login></Login>}></Route>
    //       </Routes>
    //     </div>
    //   </BrowserRouter>
        <Statistics/>
    );
  }
}

export default App;