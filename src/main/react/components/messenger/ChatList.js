import React, {useEffect, useState} from 'react';
import { FaUserCircle } from 'react-icons/fa';
import ChatRoomModal from './ChatRoomModal'
import NewChatModal from "./NewChatModal";
import {LuMessageSquarePlus} from "react-icons/lu";


    const ChatList = ({ chatList, formatDate, isChatModalOpen, selectedChat, openChatModal, closeChatModal, refreshChatList }) => {

        const [isNewChatModalOpen, setNewChatModalOpen] = useState(false);

        // 우클릭 메뉴 state
        const [menuVisible, setMenuVisible] = useState(false);
        const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
        const [selectedChatNo, setSelectedChatNo] = useState(null);  // 우클릭한 채팅방 ID 저장


        // 새 채팅 모달 열기/닫기 핸들러
        const openNewChatModal = () => setNewChatModalOpen(true);
        const closeNewChatModal = () => setNewChatModalOpen(false);


        // 우클릭 메뉴 열기 핸들러
        const handleContextMenu = (event, chatNo) => {
            event.preventDefault();
            setSelectedChatNo(chatNo); // 선택한 채팅방 ID 저장
            setMenuPosition({ x: event.pageX, y: event.pageY });
            setMenuVisible(true);
        };

        // 메뉴 아이템 클릭 핸들러
        const handleMenuClick = (action) => {
            setMenuVisible(false);

            if (action === 'edit') {
                console.log("방 제목 수정 클릭됨: 채팅방 ID =", selectedChatNo);
                // 방 제목 수정 로직 추가
            } else if (action === 'leave') {
                console.log("채팅방 나가기 클릭됨: 채팅방 ID =", selectedChatNo);
                // 채팅방 나가기 로직 추가
            }
        };

        // 메뉴 외부 클릭 감지하여 메뉴 숨기기
        useEffect(() => {
            const handleClickOutside = () => {
                if (menuVisible) setMenuVisible(false);
            };
            window.addEventListener('click', handleClickOutside);
            return () => window.removeEventListener('click', handleClickOutside);
        }, [menuVisible]);

        return (
        <div className="chat-list-container">

            {/* 헤더 */}
            <div className="chat-list-header">
                <button className="new-chat-button" onClick={openNewChatModal} aria-label="새로운 채팅">
                    <LuMessageSquarePlus />
                </button>
            </div>

            {/* 채팅 목록 */}
            <ul className="chat-list" >
                {chatList.map((chat, index) => (
                    <li
                        className="chat-item"
                        key={chat?.id || index}
                        onClick={() => openChatModal(chat.chatNo)}
                        onContextMenu={(event) => handleContextMenu(event, chat.chatNo)}
                    >
                        <div className={`chat-icon-grid ${chat.participantCount > 2 ? '' : 'single'}`}>
                            {chat.participantCount > 2 ? (
                                <>
                                    {/* 단톡방 */}
                                    <FaUserCircle className="chat-icon icon1"/>
                                    <FaUserCircle className="chat-icon icon2"/>
                                    <FaUserCircle className="chat-icon icon3"/>
                                    <FaUserCircle className="chat-icon icon4"/>
                                </>
                            ) : (
                                <FaUserCircle className="chat-icon"/>
                            )}
                        </div>
                        <div className="chat-info">
                            <div className="chat-name">
                                {chat.chatTitle || chat.chatOriginTitle}
                                {/* 채팅 생성시, 상대방 이름으로 채팅방 이름이 들어가도록 로직 짤 것, 1:1은 상대방 이름. 단톡방은 ㅇㅇㅇ외 n인으로 */}
                                <span className="chat-time">
                                    {chat.chatSendDate ? formatDate(chat.chatSendDate) : ''}
                                </span>
                            </div>
                            <div className="last-message">
                                {chat.chatMessageContent || ''}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* 우클릭 메뉴 */}
            {menuVisible && (
                <div className="context-menu" style={{top: menuPosition.y, left: menuPosition.x}}>
                    <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
                        <li onClick={() => handleMenuClick('edit')} style={{ padding: '4px 8px', cursor: 'pointer' }}>방 제목 수정</li>
                        <li onClick={() => handleMenuClick('leave')} style={{ padding: '4px 8px', cursor: 'pointer' }}>나가기</li>
                    </ul>
                </div>
            )}

            {/* 새 채팅 추가 모달 */}
            {isNewChatModalOpen && (
                <div className="new-chat-modal" onClick={(e) => e.target === e.currentTarget && closeNewChatModal()}>
                    <div className="new-chat-modal-content">
                        <NewChatModal
                            closeNewChatModal={closeNewChatModal}
                            refreshChatList={refreshChatList}
                        />
                    </div>
                </div>
            )}

            {/* 특정 채팅 조회 모달 */}
            {isChatModalOpen && (
                <div>
                    <ChatRoomModal
                        chatNo={selectedChat}
                        closeChatModal={closeChatModal}
                    />
                </div>
            )}
        </div>
        )
    };

export default ChatList;