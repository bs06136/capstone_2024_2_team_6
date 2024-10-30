import React, { useState } from 'react';
import './down.css';  // 다운로드 페이지 스타일 추가

function FileDown() {
    const [filename, setFilename] = useState('');  // 파일 요청을 위한 상태
    const [fileContent, setFileContent] = useState('');  // 파일 내용을 저장할 상태

    // 파일 요청 핸들러 (파일 요청 시 호출)
    const handleFileRequest = () => {
        if (!filename) {
            alert('파일 이름을 입력하세요.');
            return;
        }

        fetch(`http://localhost:8080/download?filename=${filename}`)
            .then(response => {
                if (response.status === 404) {
                    alert('파일이 존재하지 않습니다.');
                } else {
                    // 파일 내용을 텍스트로 읽어서 상태에 저장
                    response.text().then(data => {
                        setFileContent(data);  // 파일 내용을 페이지에 출력할 수 있도록 상태로 저장
                    });
                }
            })
            .catch(error => {
                console.error('파일 요청 실패:', error);
            });
    };

    return (
        <div className="file-down-container">
            <h2>파일 내용 보기</h2>
            {/* 파일 요청 입력 필드 */}
            <input
                type="text"
                placeholder="요청할 파일 이름 입력"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}  // 파일 이름 입력 필드
            />
            {/* 파일 요청 버튼 */}
            <button onClick={handleFileRequest}>파일 요청</button>

            {/* 파일 내용 출력 */}
            {fileContent && (
                <div className="file-content">
                    <h3>파일 내용:</h3>
                    <pre>{fileContent}</pre>  {/* 파일 내용을 출력 */}
                </div>
            )}
        </div>
    );
}

export default FileDown;
