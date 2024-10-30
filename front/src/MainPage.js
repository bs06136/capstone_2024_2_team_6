import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function MainPage() {
    const [fileList, setFileList] = useState('');

    // 버튼 3 클릭 시 파일 목록 요청 함수
    const fetchFileList = () => {
        fetch('http://localhost:8080/signal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'show=true',  // show 파라미터 전송
        })
            .then(response => response.text())
            .then(data => {
                setFileList(data);  // 서버로부터 파일 목록을 받아 상태로 저장
            })
            .catch(error => {
                console.error('파일 목록 가져오기 실패:', error);
            });
    };

    return (
        <div className="App">
            <h1>메인 페이지 테스트 중...</h1>
            <hr />

            {/* 버튼 1: 파일 업로드 페이지로 이동 */}
            <Link to="/upload">
                <button>전송</button>
            </Link>

            {/* 버튼 2: 파일 다운로드 페이지로 이동 */}
            <Link to="/download">
                <button>요청</button>
            </Link>

            {/* 버튼 3: 파일 목록 요청 */}
            <button onClick={fetchFileList}>파일 목록 보기</button>

            {/* 파일 목록 표시 */}
            {fileList && (
                <div>
                    <h3>서버에 저장된 파일 목록:</h3>
                    <p>{fileList}</p>
                </div>
            )}
        </div>
    );
}

export default MainPage;
