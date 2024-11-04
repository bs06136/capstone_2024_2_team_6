import React from 'react';
import ActorImage from '../Image/Actor.png'

function Actor() {
    return (
        <div>
            <img src={ActorImage} alt="picture1" height="150px" width="200px" />

        </div>
    );
}//사용자 ID를 받아서 이미지를 변경하는 기능 추가 필요

export default Actor;
