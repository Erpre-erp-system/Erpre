import React, {useEffect, useState} from 'react';
import { FaUserCircle } from 'react-icons/fa';
import ChatRoomModal from './ChatRoomModal'
import NewChatModal from "./NewChatModal";
import {LuMessageSquarePlus} from "react-icons/lu";
import Swal from 'sweetalert2';
import axios from "axios";


const Chat = ({ chatList, setChatList, formatDate, isChatModalOpen, selectedChat, openChatModal, closeChatModal, fetchChatList }) => {


    // 우클릭 메뉴 state
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedChatNo, setSelectedChatNo] = useState(null);  // 우클릭한 채팅방 ID 저장


    // 새 채팅 모달 열기/닫기 핸들러
    const [isNewChatModalOpen, setNewChatModalOpen] = useState(false);
    const openNewChatModal = () => setNewChatModalOpen(true);
    const closeNewChatModal = () => setNewChatModalOpen(false);


    // 우클릭 메뉴 열기 핸들러
    const handleContextMenu = (event, chatNo) => {
        event.preventDefault();
        event.stopPropagation();

        const x = event.pageX;
        const y = event.pageY;

        const menuWidth = 150;
        const menuHeight = 100;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let adjustedX = x;
        let adjustedY = y;

        if (x + menuWidth > windowWidth) {
            adjustedX = windowWidth - menuWidth - 10; // 우측 벗어남 방지
        }

        if (y + menuHeight > windowHeight) {
            adjustedY = windowHeight - menuHeight - 10; // 아래쪽 벗어남 방지
        }

        setMenuPosition({ x: adjustedX, y: adjustedY });
        setSelectedChatNo(chatNo);
        setMenuVisible(true);
    };

    // 메뉴 아이템 클릭 핸들러
    const handleMenuClick = (action) => {
        setMenuVisible(false);
        const selectedChat = chatList.find(chat => chat.chatNo === selectedChatNo);

        if (action === 'edit') {
            if (selectedChat) {
                showInputAlert(selectedChat);
            }
        } else if (action === 'leave') {
            if (selectedChat) {
            showDeleteAlert(selectedChat)
            }
        }
    };

    // 우클릭 메뉴 - 채팅방 이름 수정
    const showInputAlert = (chat) => {
        Swal.fire({
            title: `${chat?.chatTitle}`,
            input: 'text',
            inputLabel: '새로운 채팅방 이름을 입력하세요',
            inputPlaceholder: '50자 이하',
            showCancelButton: true,
            confirmButtonText: '저장',
            cancelButtonText: '취소',
            inputAttributes: {
                autocomplete: 'off'
            },
            inputValidator: (value) => {
                if (!value) {
                    return '공백은 불가능합니다';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const newTitle = result.value;
                console.log("새로운 방 제목:", newTitle);
                updateChatTitle(chat.chatNo, newTitle);
            }
        });
    };

    // 우클릭 메뉴 - 채팅방 나가기
    const showDeleteAlert = (chat) => {
        Swal.fire({
            title: `${chat?.chatTitle}`,
            html: '정말로 이 채팅방을 나가시겠습니까?<br/>퇴장 후 대화 내용은 복구가 불가능합니다',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '나가기',
            cancelButtonText: '취소',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // 채팅방 나가기 로직 추가
                console.log("채팅방에서 나갑니다: 채팅방 ID =", chat.chatNo);
                leaveChatRoom(chat.chatNo);
            }
        });
    };

    // 방 제목 수정 함수
    const updateChatTitle = async (chatNo, newTitle) => {
        try {
            const response
                = await axios.put(`/api/messengers/chat/update/title`, { chatNo: chatNo, chatTitle: newTitle })

            console.log('채팅방 이름 업데이트:', response.data)

            fetchChatList();
        } catch (error) {
            console.error('채팅방 이름 업데이트 중 오류 발생', error);
        }
    }

    // 방 나가기 함수
    const leaveChatRoom = async (chatNo) => {
        try {
            const response
                = await axios.delete(`/api/messengers/chat/delete/${chatNo}`);
            fetchChatList();
        } catch (error) {
            console.error('채팅방을 나가는 중 오류 발생', error)
        }
    }

    // 메뉴 외부 클릭 감지하여 메뉴 숨기기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuVisible && !event.target.closest('.context-menu') && !event.target.closest('.chat-item')) {
                setMenuVisible(false);
            }
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