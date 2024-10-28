import React, {useState} from 'react';
import { FaUserCircle } from 'react-icons/fa';
import ChatRoomModal from './ChatRoomModal'
import NewChatModal from "./NewChatModal";
import {LuMessageSquarePlus} from "react-icons/lu";


    const ChatList = ({ chatList, formatDate, isChatModalOpen, selectedChat, openChatModal, closeChatModal }) => {

        const [isNewChatModalOpen, setNewChatModalOpen] = useState(false);

        // 새 채팅 모달 열기/닫기 핸들러
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
            <ul className="chat-list">
                {chatList.map((chat, index) => (
                    <li className="chat-item" key={chat?.id || index} onClick={() => openChatModal(chat.chatNo)}>
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
                                {chat.chatTitle}
                                {/* 채팅 생성시, 상대방 이름으로 채팅방 이름이 들어가도록 로직 짤 것, 1:1은 상대방 이름. 단톡방은 ㅇㅇㅇ외 n인으로 */}
                                <span className="chat-time">
                                    {formatDate(chat.chatSendDate)}
                                </span>
                            </div>
                            <div className="last-message">
                                {chat.chatMessageContent}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {/* 새 채팅 추가 모달 */}
            {isNewChatModalOpen && (
                <div className="new-chat-modal" onClick={(e) => e.target === e.currentTarget && closeNewChatModal()}>
                    <div className="new-chat-modal-content">
                        <NewChatModal closeNewChatModal={closeNewChatModal}></NewChatModal>
                    </div>
                </div>
            )}

            {/* 특정 채팅 조회 모달 */}
            {isChatModalOpen && (
                <div>
                    <ChatRoomModal chatNo={selectedChat} closeChatModal={closeChatModal}/>
                </div>
            )}
        </div>
        )
    };

export default ChatList;