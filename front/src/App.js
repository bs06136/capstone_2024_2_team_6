import logo from './logo.svg';
import './App.css';
import EEG_Slider from "./component/EEG_Slider";
import UserSetting from "./component/UserSetting";
import UserDetailPopup from "./Page/UserDetailPopup";
import UserAddOrEdit from "./Page/UserAddOrEdit";
import {Route, Routes} from "react-router-dom";

function App() {
  return (
      <div>
          <UserDetailPopup />
      </div>
  );
}

export default App;
