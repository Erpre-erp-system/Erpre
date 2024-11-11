import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import {FaPaperclip, FaUserCircle} from "react-icons/fa";
import SockJS from 'sockjs-client';
import { Client as StompClient } from '@stomp/stompjs';
import {IoClose} from "react-icons/io5";

const ChatRoomModal = ({ chatList, setChatList, chatNo, closeChatModal, formatDate, fetchChatList }) => {
    // 로딩 관리 state
    const [isLoading, setIsLoading] = useState(false);

    // 현재 로그인한 유저 state
    const [user, setUser] = useState('')

    // 채팅 메시지 state
    const [messages, setMessages] = useState([]); // 채팅방 내 모든 메시지 저장 - 화면 표시용
    const [message, setMessage] = useState(""); // 현재 입력중인 메시지 저장

    // Websocket 연결 관련 state
    const stompClientRef = useRef(null); // WebSocket 연결 객체를 참조하는 useRef
    const chatBodyRef = useRef(null); // 채팅 메시지 출력 영역 참조 - 스크롤 위치 관리
    const subscriptionRef = useRef(null); // WebSocket 구독 객체 참조 - 새로운 채팅 메시지 수신하는 WebSocket 구독 관리

    // 채팅방 데이터 가져오기 (비동기)
    const fetchChatRoom = async () => {
        setIsLoading(true);

        try {
            const response = await axios.get(`/api/messengers/chat/${chatNo}`);
            const { employeeId, chatMessages } = response.data;

            setUser(employeeId);
            setMessages(chatMessages || []);
            console.log("채팅 데이터", response.data);
        } catch (error) {
            console.error("채팅 데이터를 가져오는 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // WebSocket 연결 설정
    const connectWebSocket = () => {
        if (stompClientRef.current?.connected) {
            console.log("이미 WebSocket에 연결되어 있습니다.");
            return;
        }

        const socket = new SockJS('http://localhost:8787/talk');
        const stompClient = new StompClient({
            webSocketFactory: () => socket,
            reconnectDelay: 10000,
            onConnect: () => {
                console.log("WebSocket 연결 성공");

                // 기존 구독이 있다면 해제
                if (subscriptionRef.current) {
                    subscriptionRef.current.unsubscribe();
                }

                // 채팅방 구독
                subscriptionRef.current = stompClient.subscribe(`/topic/chat/${chatNo}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    console.log("새로운 메시지 수신:", newMessage);
                    console.log("받아온 message", message);

                    // 중복 여부 확인 후 메시지 추가
                    setMessages((prevMessages) => {
                        const isDuplicate = prevMessages.some((msg) => msg.chatMessageNo === newMessage.chatMessageNo);
                        if (!isDuplicate) {
                            return [...prevMessages, newMessage];
                        }
                        return prevMessages;
                    });
                    console.log("수신 메시지 목록:", message);
                });

                console.log(`채팅방 /topic/chat/${chatNo} 구독 완료`);
            },
            onStompError: (error) => {
                console.error("WebSocket 연결 오류:", error);
            },
            onDisconnect: () => { // onWebSocketClose 대신 onDisconnect 사용
                console.error("WebSocket 연결이 닫혔습니다.");
            }
        });

        stompClientRef.current = stompClient;
        stompClient.activate();
    };

    // 메시지 전송 함수
    const handleSendMessage = () => {
        console.log("handleSendMessage 함수 호출");

        if (message.trim() && stompClientRef.current && stompClientRef.current.connected) {
            const newMessage = {
                chatNo: chatNo,
                chatSenderId: user,
                chatMessageContent: message
            };

            // 메시지 전송
            stompClientRef.current.publish({
                destination: `/app/chat/${chatNo}`,
                body: JSON.stringify(newMessage)
            });

            // 메시지 초기화
            setMessage("");

            // 메시지를 전송한 직후에도 스크롤 이동
            setTimeout(() => {
                if (chatBodyRef.current) {
                    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
                }
            }, 1);
        }
    };

    useEffect(() => {
        // 기존 연결 해제
        if (stompClientRef.current) {
            stompClientRef.current.deactivate().then(() => {
                console.log("이전 WebSocket 연결 해제");
            });
        }

        fetchChatRoom().then(() => {
            connectWebSocket();
        });


        return () => {
            // 컴포넌트 언마운트 시 구독 및 연결 해제
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
            if (stompClientRef.current) {
                stompClientRef.current.deactivate().then(() => {
                    console.log("WebSocket 연결 해제");
                    stompClientRef.current = null;
                });
            }
        };
    }, [chatNo]);

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
                        <IoClose className="close-button" title="닫기" onClick={closeChatModal}/>
                    </div>
                    <div className="chat-room-body" ref={chatBodyRef}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`chat-message ${message.chatSenderId === user ? "own" : ""}`}
                            >
                                {message.chatSenderId !== user && (
                                    <div className="message-recipient">
                                        {message.employeeImageUrl ? (
                                            <img
                                                src={message.employeeImageUrl}
                                                alt="수신자 프로필"
                                                className="profile-image"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = FaUserCircle;
                                                }}
                                            />
                                        ) : (
                                            <FaUserCircle className="chat-icon"/>
                                        )}
                                    </div>
                                )}
                                <div className="message-content">{message.chatMessageContent}</div>
                                <div className="message-sender">{message.employeeName}</div>
                                <div className="message-timestamp">{formatDate(message.chatSendDate)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="chat-room-footer">
                        <div className="file-icon">
                            <FaPaperclip/>
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
