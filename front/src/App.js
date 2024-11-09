import logo from './logo.svg';
import './App.css';
import EEG_Slider from "./component/EEG_Slider";
import UserSetting from "./component/UserSetting";
import UserDetailPopup from "./Page/UserDetailPopup";
import UserAddOrEdit from "./Page/UserAddOrEdit";
import {Route, Routes} from "react-router-dom";
import DeviceListDialog from "./component/DeviceListDialog";
import Main from "./Page/Main";

function App() {
  return (
      <div>
          <Main />
      </div>
  );
}

export default App;
