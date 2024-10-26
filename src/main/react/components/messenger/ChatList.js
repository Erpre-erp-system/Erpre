import React, {useState} from 'react';
import { FaUserCircle } from 'react-icons/fa';
import ChatRoom from './ChatRoom'


    const ChatList = ({ chatList, formatDate, isChatModalOpen, selectedChat, openChatModal, closeChatModal }) => {


        return (
        <div className="chat-list-container">

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

            {/* 모달 오버레이 */}
            {isChatModalOpen && (
                <div className="chat-modal-overlay">
                    <div className="chat-modal-content">
                        <ChatRoom chatNo={selectedChat} closeChatModal={closeChatModal}/>
                    </div>
                </div>
            )}

        </div>
        )
    };

export default ChatList;