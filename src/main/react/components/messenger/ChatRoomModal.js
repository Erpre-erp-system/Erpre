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

    const handleSendMessage = () => {
        if (message.trim() && stompClientRef.current && stompClientRef.current.connected) {
            const newMessage = {
                chatNo: chatNo,
                chatSenderId: user,
                chatMessageContent: message
            };
            stompClientRef.current.publish({
                destination: `/app/talk/chat/${chatNo}`,
                body: JSON.stringify(newMessage)
            });
            setMessage("");

            // 메시지를 전송한 직후에도 스크롤 이동
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

        if (stompClientRef.current?.connected) {
            console.log("이미 WebSocket에 연결되어 있습니다.");
            return;
        }

        const socket = new SockJS('/talk');
        const stompClient = new StompClient({
            webSocketFactory: () => socket,
            reconnectDelay: 10000, // 5초마다 자동 재연결 시도
            onConnect: () => {
                console.log("WebSocket 연결 성공");

                // 채팅방 구독
                stompClient.subscribe(`/topic/chat/${chatNo}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages((prevMessages) => [...prevMessages, newMessage]);


                    console.log("새로운 메시지 수신:", newMessage);
                });

                // 로그 추가: 채팅방 구독 확인
                console.log(`채팅방 /topic/chat/${chatNo} 구독 완료`);

                // 메시지 수신 확인 로그
                console.log("메시지 수신:", message);
            },
            onStompError: (error) => {
                console.error("WebSocket 연결 오류:", error);
            },
            onWebSocketClose: () => {
                console.error("WebSocket 연결이 닫혔습니다.");
            }
        });

        stompClientRef.current = stompClient;
        stompClient.activate();
    };

    useEffect(() => {
        // 기존 연결 해제
        if (stompClientRef.current) {
            stompClientRef.current.deactivate(() => {
                console.log("이전 WebSocket 연결 해제");
                stompClientRef.current = null;
            });
        }

        fetchChatRoom().then(() => {
            connectWebSocket();
        });

        console.log("ChatRoomModal 렌더링, chatNo:", chatNo);
        console.log("connectWebSocket 함수 호출 시점:", new Date().toISOString());

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate().then(() => {
                    console.log("WebSocket 연결 해제");
                    stompClientRef.current = null;
                });
            }
        };
    }, []);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

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
