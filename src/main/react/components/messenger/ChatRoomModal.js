import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import Draggable from "react-draggable";
import {FaPaperclip} from "react-icons/fa";
import SockJS from 'sockjs-client';
import { Client as StompClient } from '@stomp/stompjs';



const ChatRoomModal = ({ chatList, setChatList, chatNo, closeChatModal, formatDate, fetchChatList }) => {

    // 로딩 관리
    const [isLoading, setIsLoading] = useState(false);

    // 현재 로그인한 유저 stat
    const [user, setUser] = useState('')

    // 채팅 메시지 state
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    // Websocket 연결 관련 state
    const stompClientRef = useRef(null);
    const chatBodyRef = useRef(null);


    // 채팅방 데이터 fetch (비동기)
    const fetchChatRoom = async () => {
        setIsLoading(true);

        try {
            const response = await axios.get(`/api/messengers/chat/${chatNo}`);
            const {employeeId, chatMessages} = response.data;

            setUser(employeeId); // 유저 아이디 설정
            setMessages(chatMessages || []); // 초기 메시지 설정
            console.log("채팅 데이터", response.data);
        } catch (error) {
            console.error("채팅 데이터를 가져오는 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 메시지 전송 함수
    const handleSendMessage = () => {
        if (message.trim() && stompClientRef.current && stompClientRef.current.connected) {
            const newMessage = {
                chatNo: chatNo,
                chatSenderId: user,
                chatMessageContent: message
            };

            console.log("전송할 메세지", newMessage);

            stompClientRef.current.publish({
                destination: `/app/talk/chat/${chatNo}`,
                body: JSON.stringify(newMessage)
            });
            setMessage("");

            // 새 메시지 전송시 스크롤을 최신 위치로 이동
            setTimeout(() => {
                if (chatBodyRef.current) {
                    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
                }
            }, 100);
        }
    };

    // WebSocket 연결 설정
    const connectWebSocket = () => {
        console.log("connectWebSocket 함수 호출");
        const socket = new SockJS('/talk');
        const stompClient = new StompClient({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("WebSocket 연결 성공");

                // 특정 채팅방 구독
                stompClientRef.current.subscribe(`/topic/chat/${chatNo}`, (message) => {
                    const newMessage = JSON.parse(message.body);

                    // 현재 chatList에 새 메시지 추가
                    setChatList((prevChatList) => {
                        const updatedChatList = prevChatList.map((chat) =>
                            chat.chatNo === chatNo ? { ...chat, lastMessage: newMessage.chatMessageContent } : chat
                        );
                        return updatedChatList;
                    });

                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                });
            },
            onStompError: (error) => {
                console.error("WebSocket 연결 오류:", error);
            }
        });

        stompClientRef.current = stompClient;
        stompClient.activate();
    };

    useEffect(() => {
        fetchChatRoom();
        connectWebSocket();
        fetchChatList();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate(() => {
                    console.log("WebSocket 연결 해제");
                });
            }
        };
    }, [chatNo]);

    if (isLoading) {
        return <div className="tr_empty">
            <div>
                <div className="loading">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>;
    }

    return (
        <div className="chat-room-modal">
            <Draggable handle=".chat-room-header">
                <div className="chat-room">
                    <div className="chat-room-header">
                        <h2>{messages?.[0]?.chatTitle || ''}</h2>
                        <button onClick={closeChatModal} className="close-button">닫기</button>
                    </div>
                    <div
                        className="chat-room-body"
                        ref={chatBodyRef}
                    >
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`chat-message ${message.chatSenderId === user ? "own" : ""}`}
                            >
                                <div className="message-sender">{message.chatSenderName}</div>
                                <div className="message-content">{message.chatMessageContent}</div>
                                <div className="message-timestamp">{formatDate(message.chatSendDate)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="chat-room-footer">
                        <div className="file-icon">
                            <FaPaperclip />
                        </div>
                        <input
                            type="text"
                            placeholder="메시지를 입력하세요"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage}>전송</button>
                    </div>
                </div>
            </Draggable>
        </div>
    );
};

export default ChatRoomModal;
