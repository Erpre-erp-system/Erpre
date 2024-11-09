import React, {useContext} from 'react';
import '../../resources/static/css/common/Header.css';
import {FaBell, FaCommentDots, FaEnvelope} from 'react-icons/fa'; // React Icons를 사용
import Messenger from '../components/messenger/Messenger'
import {MessengerContext} from '../../react/context/MessengerContext';
import '../../resources/static/css/messenger/Messenger.css';
import "../../resources/static/css/messenger/Chat.css";
import "../../resources/static/css/messenger/Note.css";
import "../../resources/static/css/messenger/Info.css";



function Header() {
    const {isMessengerOpen, setMessengerOpen} = useContext(MessengerContext);

    // 메신저 열림/닫힘 반전
    const toggleMessenger = () => {
        setMessengerOpen(!isMessengerOpen);
    };

    const handleEmailClick = () => {
        window.location.href = '/receivedMail';
    }

    return (
        <header>
            <div className="header-container">
                <div className="logo">
                    <a href="/"><img src="/img/logo2.png" alt="IKEA Logo"/><span>Erpenterprise Resource  Planning</span></a>
                </div>
                <div className="header-icons">
                    <FaEnvelope className="header-icon mail" title="메일" onClick={handleEmailClick}/>
                    <FaCommentDots className="header-icon messenger" title="메신저" onClick={toggleMessenger}/>
                    <FaBell className="header-icon alarm" title="알림"/>
                </div>
            </div>
            <div className="bottom-border"></div>

            {/* 메신저 컴포넌트 */}
            <Messenger isOpen={isMessengerOpen} toggleMessenger={toggleMessenger}/>
        </header>
    );
}

export default Header;
