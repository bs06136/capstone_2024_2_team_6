import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ActorImage from '../images/Actor.png';

/*
function Actor({ userName, imageOption }) {
    const [userImage, setUserImage] = useState(null);

    // 서버에서 사용자 이미지 요청
    useEffect(() => {
        const fetchUserImage = async () => {
            try {
                const response = await axios.get(`/api/user/${userName}/image`, { responseType: 'blob' });
                if (response.data) {
                    const imageURL = URL.createObjectURL(response.data);
                    setUserImage(imageURL);
                } else {
                    setUserImage(ActorImage);
                }
            } catch (error) {
                console.error("사용자 이미지를 가져오는 중 오류 발생:", error);
                setUserImage(ActorImage);
            }
        };

        // fetchUserImage();
    }, [userName]);

    // 이미지 업로드 핸들러
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const targetWidth = 200; // 원하는 너비
                    const targetHeight = 200; // 원하는 높이
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                    canvas.toBlob((blob) => {
                        const imageURL = URL.createObjectURL(blob);
                        setUserImage(imageURL); // 미리보기용 이미지 설정

                        // 서버로 이미지 업로드
                        const formData = new FormData();
                        formData.append('image', blob, file.name);
                        axios.post(`/api/user/${userName}/image-upload`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        }).then(response => {
                            console.log('이미지 업로드 성공:', response.data);
                        }).catch(error => {
                            console.error('이미지 업로드 중 오류 발생:', error);
                        });
                    }, 'image/jpeg');
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <label htmlFor="image-upload">
                <img
                    src={userImage || ActorImage}
                    alt="User"
                    width="200" // 원하는 이미지 너비
                    height="200" // 원하는 이미지 높이
                    style={{ objectFit: "cover", cursor: imageOption ? "pointer" : "default" }}
                />
            </label>
            {imageOption && (
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                />
            )}
        </div>
    );
}*/

function Actor({ userName, imageOption }) {
    const [userImage, setUserImage] = useState(`images/${userName}.png`);

    // 이미지 업로드 핸들러
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const targetWidth = 200; // 원하는 너비
                    const targetHeight = 200; // 원하는 높이
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                    canvas.toBlob((blob) => {
                        const imageURL = URL.createObjectURL(blob);
                        setUserImage(imageURL); // 미리보기용 이미지 설정
                    }, 'image/jpeg');
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (userName !== "default") {
            setUserImage(`images/${userName}.png?v=${Date.now()}`);
        }
    }, [userName]);

    return (
        <div>
            {/* 이미지 표시 */}
            <label htmlFor="image-upload">
                <img
                    src={userImage}
                    alt={`${userName} 이미지`}
                    width="200" // 이미지 너비
                    height="200" // 이미지 높이
                    style={{ objectFit: "cover", cursor: imageOption ? "pointer" : "default" }}
                    onError={(e) => {e.target.src = ActorImage
                        console.log(`이미지 경로: /images/${userName}.png`);}} // 이미지 로드 실패 시 기본 이미지로 대체
                />
            </label>
            {/* 이미지 업로드 */}
            {imageOption && (
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageUpload}
                />
            )}
        </div>
    );
}

export default Actor;
