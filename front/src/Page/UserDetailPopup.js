import React from 'react';
import Actor from "../../../../capstone_2024_2_team_6/front/src/component/Actor";
import UserStatus from "../../../../capstone_2024_2_team_6/front/src/component/UserStatus";
import Detail from "../../../../capstone_2024_2_team_6/front/src/component/Detail";
import '../css/UserDetailPopUp.css';
import StickGraph from "../../../../capstone_2024_2_team_6/front/src/component/StickGraph";

const UserDetailPopup = () => {
    return (
        <div className="popup">
            <button className="edit-button">수정</button>

            <div className="upper-part">
                <div className="actor-section">
                    <div className="actor"><Actor/></div>
                    <div className="user-status"><UserStatus/></div>
                </div>

                <div className="detail-section">
                    <div className="details" width="100%">
                        <Detail/>
                    </div>
                </div>
            </div>

            <div className="lower-part">
                <div className="graph-section">
                    <div className="Stick-graph"><StickGraph/></div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailPopup;
