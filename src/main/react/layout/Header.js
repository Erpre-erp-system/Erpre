import React, {useContext, useEffect, useState} from 'react';
import '../../resources/static/css/common/Header.css';
import {FaBell, FaCommentDots, FaEnvelope} from 'react-icons/fa'; // React Icons를 사용
import Messenger from '../components/messenger/Messenger'
import {MessengerContext} from '../context/MessengerContext';
import '../../resources/static/css/messenger/Messenger.css';
import "../../resources/static/css/messenger/Chat.css";
import "../../resources/static/css/messenger/Note.css";
import "../../resources/static/css/messenger/Info.css";
import SockJS from "sockjs-client";
import { Client as StompClient } from '@stomp/stompjs';
import {useMessengerHooks} from "../components/messenger/useMessengerHooks";
import ReceivedNoteModal from "../components/messenger/ReceivedNoteModal";


function Header() {

    const {
        noteList,
        setNoteList,
    } = useMessengerHooks();

    const {isMessengerOpen, setMessengerOpen} = useContext(MessengerContext);
    const handleCloseAlert = () => setNewNote(null);
    const [newNote, setNewNote] = useState(null);

    // 메신저 열림/닫힘 반전
    const toggleMessenger = () => {
        setMessengerOpen(!isMessengerOpen);
    };

    const handleEmailClick = () => {
        window.location.href = '/receivedMail';
    }

    // 최상위 루트에서 쪽지 구독
    useEffect(() => {
        const socket = new SockJS('http://localhost:8787/talk');
        const stompClient = new StompClient({
            webSocketFactory: () => socket,
            reconnectDelay: 10000,
            onConnect: () => {
                console.log("쪽지 WebSocket 연결 성공");

                stompClient.subscribe('/user/queue/note', (message) => {
                    const receivedNote = JSON.parse(message.body);
                    console.log("수신한 쪽지:", receivedNote);
                    setNoteList((prevNoteList) => [receivedNote, ...prevNoteList]);
                    setNewNote(receivedNote); // 새로운 쪽지를 받아올 때마다 모달을 활성화하도록 설정
                });
            },
            onDisconnect: () => console.log("쪽지 WebSocket 연결이 닫혔습니다."),
        });

        stompClient.activate();


        return () => {
            stompClient.deactivate()
                .then(() => console.log("쪽지 WebSocket 연결이 성공적으로 해제되었습니다."))
                .catch((error) => console.error("쪽지 WebSocket 해제 중 오류:", error));
        };
    }, []);

    // 디버깅용
    useEffect(() => {
        if (newNote) {
            console.log("모달에 떠야 할 새로운 쪽지:", newNote);
        }
    },[newNote]);

    return (
        <header>
            <div className="header-container">
                <div className="logo">
                    <a href="/main"><img src="/img/logo2.png" alt="IKEA Logo"/><span>Erpenterprise Resource  Planning</span></a>
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
            {newNote && (
                <ReceivedNoteModal
                    note={newNote}
                    onClose={handleCloseAlert}
                />
            )}
        </header>
    );
}

export default Header;
