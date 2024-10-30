import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './upload.css';  // 업로드 페이지 스타일 추가

function FileUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [save, setSave] = useState(false);      // save 옵션 상태
    const [archive, setArchive] = useState(false); // archive 옵션 상태
    const navigate = useNavigate();

    // 파일 선택 핸들러
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // 파일 전송 핸들러
    const handleFileUpload = () => {
        if (!selectedFile) {
            alert('파일을 선택하세요.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('save', save);  // save 옵션 추가
        formData.append('archive', archive);  // archive 옵션 추가

        fetch('http://localhost:8080/signal', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.text())
            .then(data => {
                alert('파일이 성공적으로 전송되었습니다.');
                navigate('/');  // 파일 전송 완료 후 메인 페이지로 이동
            })
            .catch(error => {
                console.error('파일 전송 실패:', error);
            });
    };

    return (
        <div className="upload-container">
            <h2 className="upload-header">파일 업로드 페이지</h2>

            {/* 파일 선택 */}
            <input className="upload-input" type="file" onChange={handleFileChange} />

            {/* save 옵션 체크박스 */}
            <div className="upload-options">
                <label>
                    <input
                        type="checkbox"
                        checked={save}
                        onChange={() => setSave(!save)}
                    />
                    파일 저장
                </label>

                {/* archive 옵션 체크박스 */}
                <label>
                    <input
                        type="checkbox"
                        checked={archive}
                        onChange={() => setArchive(!archive)}
                    />
                    파일 아카이브
                </label>
            </div>

            {/* 파일 전송 버튼 */}
            <button className="upload-button" onClick={handleFileUpload}>파일 전송</button>

            {/* 선택된 파일 정보 */}
            {selectedFile && <p className="upload-file-info">선택된 파일: {selectedFile.name}</p>}
        </div>
    );
}

export default FileUpload;
