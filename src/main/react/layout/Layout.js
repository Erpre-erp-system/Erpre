// src/main/react/layout/Layout.js
import React, {useEffect, useState} from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../resources/static/css/common/Layout.css';
import Toast from '../components/common/Toast'; // 토스트 컴포넌트
import ConfirmCustom from '../components/common/ConfirmCustom'; // confirm 모달 컴포넌트
import {useLocation} from 'react-router-dom';
import EmailSidebar from './EmailSidebar';
import {UserProvider} from '../context/UserContext';
import {MessengerProvider} from '../context/MessengerContext';
import ReceivedNoteModal from "../components/messenger/ReceivedNoteModal";



function Layout({currentMenu, children}) {
    // const { user } = useContext(UserContext);
    //
    // if (!user) {
    //     return <div>Loading...</div>; // 유저 데이터 로딩 중에 표시할 내용
    // } // 프로젝트 마무리할때 로딩넣기

    const location = useLocation();

    const [newNote, setNewNote] = useState(null);

    useEffect(() => {
        const eventSource = new EventSource('/api/messengers/note/subscribe');

        eventSource.addEventListener("NEW_NOTE", (event) => {
            const note = JSON.parse(event.data);
            setNewNote(note);
        });

        eventSource.onerror = (error) => {
            console.error('SSE 연결 오류:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const handleCloseAlert = () => setNewNote(null);


    return (
        <div className="container">
            <UserProvider>
                <MessengerProvider>
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
                        {newNote && (
                            <ReceivedNoteModal
                                note={newNote}
                                onClose={handleCloseAlert}
                            />
                        )}
                    </div>
                </MessengerProvider>
            </UserProvider>
        </div>

    )

}

export default Layout;
