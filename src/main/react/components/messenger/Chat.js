import React, {useState} from 'react';
import { FaUserCircle } from 'react-icons/fa';
import ChatRoomModal from './ChatRoomModal'
import NewChatModal from "./NewChatModal";
import {LuMessageSquarePlus} from "react-icons/lu";
import {useChatHooks} from "./useChatHooks";


const Chat = ({ chatList, setChatList, formatDate, isChatModalOpen, selectedChat, openChatModal, closeChatModal, fetchChatList }) => {

    const {

        // 🟡 우클릭
        menuVisible,
        menuPosition,
        handleContextMenu,
        handleMenuClick,

    } = useChatHooks(chatList,fetchChatList);

    // 새 채팅 모달 열기/닫기 핸들러
    const [isNewChatModalOpen, setNewChatModalOpen] = useState(false);
    const openNewChatModal = () => setNewChatModalOpen(true);
    const closeNewChatModal = () => setNewChatModalOpen(false);


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
                    onClick={(event) => {
                        // 마우스 왼쪽 버튼 클릭(버튼 코드 0)일 때만 채팅 모달 열기
                        if (event.button === 0) {
                            openChatModal(chat.chatNo);
                        }
                    }}
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
                            {chat?.chatTitle}
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
            <div
                className="context-menu"
                style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
            >
                <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
                    <li onClick={() => handleMenuClick('edit')} style={{ padding: '4px 8px', cursor: 'pointer' }}>채팅방 이름 수정</li>
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
                        fetchChatList={fetchChatList}
                    />
                </div>
            </div>
        )}

        {/* 개별 채팅방 조회 모달 */}
        {isChatModalOpen && (
            <div>
                <ChatRoomModal
                    chatList={chatList}
                    setChatList={setChatList}
                    chatNo={selectedChat}
                    closeChatModal={closeChatModal}
                    formatDate={formatDate}
                    fetchChatList={fetchChatList}
                />
            </div>
        )}
    </div>
    )
};

export default Chat;