// src/main/react/layout/Layout.js
import React, {useContext, useEffect, useRef, useState} from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../resources/static/css/common/Layout.css';
import Toast from '../components/common/Toast'; // 토스트 컴포넌트
import ConfirmCustom from '../components/common/ConfirmCustom'; // confirm 모달 컴포넌트
import {useLocation} from 'react-router-dom';
import EmailSidebar from './EmailSidebar';
import {MessengerProvider} from "../context/MessengerContext";
import {UserContext, UserProvider} from '../context/UserContext';
import SockJS from "sockjs-client";
import {useMessengerHooks} from "../components/messenger/useMessengerHooks";
import { Client as StompClient } from '@stomp/stompjs';


function Layout({currentMenu, children}) {
    const { user, setUser } = useContext(UserContext) || {};
    //
    // if (!user) {
    //     return <div>Loading...</div>; // 유저 데이터 로딩 중에 표시할 내용
    // } // 프로젝트 마무리할때 로딩넣기

    const {
        noteList,
        setNoteList,
        newNote,
        setNewNote,
    } = useMessengerHooks();

    const location = useLocation();
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
                    setNoteList((prevNoteList) => [receivedNote, ...prevNoteList]);
                });
            },
            onDisconnect: () => console.log("WebSocket 연결이 닫혔습니다."),
        });

        stompClient.activate();


        return () => {
            stompClient.deactivate()
                .then(() => console.log("WebSocket 연결이 성공적으로 해제되었습니다."))
                .catch((error) => console.error("WebSocket 해제 중 오류:", error));
        };
    }, []);

    const handleCloseAlert = () => setNewNote(null);


    return (
        <UserProvider>
            <MessengerProvider>
        <div className="container">

                    <Header/>
                    <div className="main-container">
                        {location.pathname === "/email" ||
                        location.pathname === "/receivedMail" ||
                        location.pathname === "/sentMail" ||
                        location.pathname === "/draftMailBox" ||
                        location.pathname === "/emailViewer" ||
                        location.pathname === "/trashMailBox" ?
                            <EmailSidebar currentMenu={currentMenu}/> :
                            <Sidebar currentMenu={currentMenu}/>}

                        {children}
                        <Toast/> {/* Toast 메세지 */}
                        <ConfirmCustom/> {/* confirm 모달 */}

                    </div>
        </div>
            </MessengerProvider>
        </UserProvider>
    )
}
export default Layout;
