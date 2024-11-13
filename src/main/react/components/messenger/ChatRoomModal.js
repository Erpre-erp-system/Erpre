import React, {useContext, useEffect, useRef, useState} from "react";
import axios from "axios";
import Draggable from "react-draggable";
import {FaRegSmile, FaUserCircle} from "react-icons/fa";
import SockJS from 'sockjs-client';
import {Client as StompClient} from '@stomp/stompjs';
import {IoClose} from "react-icons/io5";
import {UserContext} from "../../context/UserContext";
import {AiFillPicture} from "react-icons/ai";
import Picker from "emoji-picker-react";

const ChatRoomModal = ({chatTitle, chatList, setChatList, chatNo, closeChatModal, fetchChatList}) => {
    const [isLoading, setIsLoading] = useState(false); // 로딩 state
    const {user} = useContext(UserContext); // 현재 로그인한 유저 state
    const [messages, setMessages] = useState([]); // 채팅방 메시지 목록 state
    const [message, setMessage] = useState(""); // 현재 입력중인 메시지 state
    const [image, setImage] = useState(null); // 이미지 파일
    const [imagePreview, setImagePreview] = useState(null); // 이미지 미리보기 URL
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // 이모티콘 state
    const emojiPickerRef = useRef(null); // 이모티콘 Picker 참조

    // Websocket 연결 관련 Ref
    const stompClientRef = useRef(null); // WebSocket 객체 참조
    const chatBodyRef = useRef(null); // 채팅 메시지 출력 영역 참조 - 스크롤 위치 관리
    const subscriptionRef = useRef(null); // WebSocket 구독 객체 참조

    // 이모지 클릭 핸들러 함수
    const onEmojiClick = (emojiObject) => {
        setMessage(prevMessage => prevMessage + emojiObject.emoji); // 이모티콘을 메시지에 추가
    };

    const updateChatList = (newMessage) => {
        setTimeout(() => {
            setChatList(prevChatList => {

                const updatedChatList = prevChatList.map(chat =>
                    chat.chatNo === chatNo
                        ? {
                            ...chat,
                            chatMessageContent: newMessage.chatMessageContent,
                            chatSendDate: newMessage.chatSendDate
                        }
                        : chat
                );

                // 채팅방 리스트를 마지막 메시지 시간을 기준으로 내림차순 정렬
                return updatedChatList.sort((a, b) => {
                    const dateA = new Date(a.chatSendDate);
                    const dateB = new Date(b.chatSendDate);
                    return dateB - dateA; // 최신 메시지가 맨 위로 오도록 정렬
                });
            });
        }, 0);
    };

    // 외부 클릭으로 이모티콘 창 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        return `${ampm} ${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`;
    };

    const formatDateHeader = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    // 채팅방 데이터 가져오기 (비동기)
    const fetchChatRoom = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/messengers/chat/${chatNo}`);
            const chatMessages = response.data.chatMessages;
            setMessages(Array.isArray(chatMessages) ? chatMessages : []);
            console.log("채팅 데이터", response.data);
        } catch (error) {
            console.error("채팅 데이터를 가져오는 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const connectWebSocket = () => {
            if (!stompClientRef.current) {
                const socket = new SockJS('http://localhost:8787/talk');
                const stompClient = new StompClient({
                    webSocketFactory: () => socket,
                    reconnectDelay: 10000,
                    onConnect: () => {
                        console.log("WebSocket 연결 성공");
                        subscribeToChat(chatNo); // 연결 후 채팅방 구독
                    },
                    onStompError: (error) => console.error("WebSocket 연결 오류:", error),
                    onDisconnect: () => console.error("WebSocket 연결이 닫혔습니다."),
                });

                stompClientRef.current = stompClient;
                stompClient.activate();
            } else {
                subscribeToChat(chatNo);
            }
        };

        // 구독 함수
        const subscribeToChat = (chatNo) => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                console.log(`기존 채팅방 /topic/chat/${chatNo} 구독 해제`);
            }

            subscriptionRef.current = stompClientRef.current.subscribe(`/topic/chat/${chatNo}`, (message) => {
                const newMessage = JSON.parse(message.body);
                setMessages((prevMessages) => {
                    if (!prevMessages.some((msg) => msg.chatMessageNo === newMessage.chatMessageNo)) {
                        updateChatList(newMessage);
                        scrollToBottom();
                        return [...prevMessages, newMessage];
                    }
                    return prevMessages;
                });
                console.log("수신 메시지", newMessage);
            });
            console.log(`채팅방 /topic/chat/${chatNo} 구독 완료`);
        };

        fetchChatRoom();
        connectWebSocket();

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
                console.log("WebSocket 구독 해제");
            }
            if (stompClientRef.current) {
                stompClientRef.current.deactivate(); // WebSocket 연결 해제
                stompClientRef.current = null;
                console.log("WebSocket 연결 해제");
            }
        };
    }, [chatNo, setChatList]);


    const handleSendMessage = async () => {
        if (!message.trim() && !image) {
            alert("메시지 내용을 입력하세요.");
            return;
        }

        try {
            if (stompClientRef.current && stompClientRef.current.connected) {
                let imageUrl = null;

                if (image) {
                    const formData = new FormData();
                    formData.append("file", image);
                    formData.append("fileType", "chat");

                    try {
                        const response = await axios.post("/api/files/upload", formData, {
                            headers: {"Content-Type": "multipart/form-data"},
                        });
                        imageUrl = `/api/files/chat/${response.data}`;
                        console.log("Uploaded image URL:", imageUrl);

                        scrollToBottom();
                    } catch (error) {
                        console.error("이미지 업로드 중 오류 발생:", error);
                        return;
                    }
                }

                const newMessage = {
                    chatNo: chatNo,
                    chatSenderId: user.employeeId,
                    chatMessageContent: message || "", // 텍스트 내용
                    chatFileUrl: imageUrl,             // 이미지 URL
                    chatFileName: image ? image.name : null, // 이미지 파일명
                    type: "message",
                };

                stompClientRef.current.publish({
                    destination: `/app/chat/${chatNo}`,
                    body: JSON.stringify(newMessage),
                });

                setMessage("");
                setImage(null);
                setImagePreview(null);
                scrollToBottom();
            } else {
                alert("WebSocket 연결이 끊겼습니다. 다시 연결해주세요.");
            }
        } catch (error) {
            console.error("메시지 전송 중 오류 발생:", error);
            alert("메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요.");
        }
    };


    // 이미지 선택 함수
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i; // 허용하는 확장자 리스트
        if (selectedFile && selectedFile.type.startsWith("image/") && allowedExtensions.test(selectedFile.name)) {
            setImage(selectedFile); // 이미지 파일로 설정
            setImagePreview(URL.createObjectURL(selectedFile));
        } else {
            alert("이미지 파일만 업로드할 수 있습니다. (jpg, jpeg, png, gif)");
            e.target.value = '';
        }
    };

    // 이미지 미리보기 삭제 함수
    const removeImagePreview = () => {
        setImage(null);
        setImagePreview(null);
    };

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    // 날짜 구분선이 포함된 메시지 목록 생성
    const getMessagesWithDateSeparators = () => {
        const result = [];
        let lastDate = null;

        messages.forEach((msg) => {
            const messageDate = new Date(msg.chatSendDate).toLocaleDateString();
            if (messageDate !== lastDate) {
                result.push({isDateSeparator: true, date: msg.chatSendDate});
                lastDate = messageDate;
            }
            result.push(msg);
        });

        return result;
    };

    useEffect(() => {
        scrollToBottom();
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
                        <h2>{chatTitle || ''}</h2>
                        <IoClose className="close-button" title="닫기" onClick={closeChatModal}/>
                    </div>
                    <div className="chat-room-body" ref={chatBodyRef}>
                        {getMessagesWithDateSeparators().map((message, index) => (
                            message.isDateSeparator ? (
                                <div key={index} className="date-separator">
                                    <span>{formatDateHeader(message.date)}</span>
                                </div>
                            ) : (
                                <div
                                    key={index}
                                    className={`chat-message-container ${message.chatSenderId === user.employeeId ? "own" : "other"}`}
                                >
                                    {message?.chatSenderId !== user.employeeId && (
                                        <div className="message-recipient">
                                            {message?.employeeImageUrl ? (
                                                <img
                                                    src={message.employeeImageUrl}
                                                    alt="프로필 이미지"
                                                    className="profile-image"
                                                />
                                            ) : (
                                                <FaUserCircle className="profile-image"/>
                                            )}
                                        </div>
                                    )}
                                    <div className="message-wrap">
                                        {message?.chatSenderId !== user.employeeId && (
                                            <span className="sender-name">{message.chatSenderName}</span>
                                        )}
                                        <div
                                            className={`chat-message ${message.chatSenderId === user.employeeId ? "own" : "other"}`}
                                        >
                                            {/* 이미지가 있을 경우 */}
                                            {message.chatFileUrl && (
                                                <img
                                                    src={message.chatFileUrl}
                                                    alt="이미지 메시지"
                                                    className="message-image"
                                                />
                                            )}
                                            {/* 텍스트 메시지 */}
                                            {message.chatMessageContent && <p>{message.chatMessageContent}</p>}
                                        </div>
                                        <div
                                            className={`message-timestamp ${message.chatSenderId === user.employeeId ? "timestamp-right" : "timestamp-left"}`}
                                        >
                                            {formatDate(message.chatSendDate)}
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    {/* footer */}
                    <div className="chat-room-footer">
                        <div className="chat-room-btn">
                            <input
                                type="file"
                                id="file-upload"
                                style={{display: "none"}}
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload" className="file-icon">
                                <AiFillPicture/>
                            </label>
                            <button className="file-icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                <FaRegSmile/>
                            </button>
                            {showEmojiPicker && (
                                <div className="emoji-picker-container" ref={emojiPickerRef}>
                                    <Picker onEmojiClick={onEmojiClick}/>
                                </div>
                            )}
                        </div>
                        <div className="chat-input-container">
                            {/* 이미지 미리보기 */}
                            <div className="chat-input-preview-wrapper">
                                {imagePreview && (
                                    <div className="image-preview" onClick={removeImagePreview}>
                                        <img src={imagePreview} alt="미리보기" className="preview-thumbnail"/>
                                    </div>
                                )}
                                <input
                                    type="text"
                                    className="chat-input"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                />
                            </div>
                            <button className="chat-room-submit-btn" onClick={handleSendMessage}>전송</button>
                        </div>
                    </div>
                </div>
            </Draggable>
        </div>
    );
};

export default ChatRoomModal;
