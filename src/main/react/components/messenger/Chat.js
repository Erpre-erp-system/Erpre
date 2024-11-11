import React, {useContext, useState} from 'react';
import {FaUserCircle} from 'react-icons/fa';
import ChatRoomModal from './ChatRoomModal'
import UseEmployeeSearchModal from "./UseEmployeeSearchModal";
import {useChatHooks} from "./useChatHooks";
import {RiChatNewFill} from "react-icons/ri";
import {UserContext} from "../../context/UserContext";

const Chat = ({
                  chatList,
                  setChatList,
                  formatDate,
                  selectedChat,
                  isChatModalOpen,
                  openChatModal,
                  closeChatModal,
                  fetchChatList
              }) => {

    const {
        // 🟡 우클릭
        menuVisible,
        menuPosition,
        handleContextMenu,
        handleMenuClick,
    } = useChatHooks(chatList, fetchChatList);

    const {user} = useContext(UserContext);

    // 새 채팅 모달 열기/닫기 핸들러
    const [isEmployeeSearchModalOpen, setEmployeeSearchModalOpen] = useState(false);
    const openEmployeeSearchModal = () => setEmployeeSearchModalOpen(true);
    const closeEmployeeSearchModal = () => setEmployeeSearchModalOpen(false);

    return (
        <div className="chat-list-container">

            {/* 헤더 */}
            <div className="chat-list-header">
                <button className="new-chat-button" onClick={openEmployeeSearchModal} aria-label="새로운 채팅">
                    <RiChatNewFill/>
                </button>
            </div>

            {/* 채팅 목록 */}
            <ul className="chat-list">
                {chatList.map((chat, index) => {
                    // otherParticipants 정의: 현재 로그인한 사용자와 다른 참가자들만 포함
                    const otherParticipants = chat.participants
                        ? chat.participants.filter(participant => participant.participantId !== user.employeeId)
                        : [];

                    return (
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
                            <div className={`chat-icon-grid ${otherParticipants.length === 1 ? 'single' : ''}`}>
                                {otherParticipants.length > 1 ? (
                                    // 단체 채팅방: 최대 4개의 아이콘 표시
                                    otherParticipants.slice(0, 4).map((participant, i) => (
                                        participant.employeeImageUrl ? (
                                            <img
                                                key={i}
                                                src={participant.employeeImageUrl}
                                                alt="프로필 이미지"
                                                className={`chat-icon icon${i + 1}`}
                                            />
                                        ) : (
                                            <FaUserCircle key={i} className={`chat-icon icon${i + 1}`}/>
                                        )
                                    ))
                                ) : (
                                    // 1:1 채팅방
                                    otherParticipants.map((participant, i) => (
                                        participant.employeeImageUrl ? (
                                            <img
                                                key={i}
                                                src={participant.employeeImageUrl}
                                                alt="프로필 이미지"
                                                className="chat-icon"
                                            />
                                        ) : (
                                            <FaUserCircle key={i} className="chat-icon"/>
                                        )
                                    ))
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
                    );
                })}
            </ul>

            {/* 우클릭 메뉴 */}
            {menuVisible && (
                <div
                    className="context-menu"
                    style={{top: `${menuPosition.y}px`, left: `${menuPosition.x}px`}}
                >
                    <ul style={{margin: 0, padding: 0, listStyleType: 'none'}}>
                        <li onClick={() => handleMenuClick('edit')} style={{padding: '4px 8px', cursor: 'pointer'}}>채팅방 이름 수정</li>
                        <li onClick={() => handleMenuClick('leave')} style={{padding: '4px 8px', cursor: 'pointer'}}>나가기</li>
                    </ul>
                </div>
            )}

            {/* 새 채팅 추가 모달 */}
            {isEmployeeSearchModalOpen && (
                <div className="new-chat-modal"
                     onClick={(e) => e.target === e.currentTarget && closeEmployeeSearchModal()}>
                    <div className="new-chat-modal-content">
                        <UseEmployeeSearchModal
                            closeEmployeeSearchModal={closeEmployeeSearchModal}
                            fetchChatList={fetchChatList}
                            createUrl="/api/messengers/chat/create"
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
