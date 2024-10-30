import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage';
import './App.css';
import FileUpload from './FileUpload';
import FileDown from './FileDown';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/upload" element={<FileUpload />} />
                <Route path="/download" element={<FileDown />} />
            </Routes>
        </Router>
    );
}

export default App;
