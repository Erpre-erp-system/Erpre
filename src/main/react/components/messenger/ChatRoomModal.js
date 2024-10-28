import React, {useContext, useEffect, useRef, useState} from "react";
import axios from "axios";
import Draggable from "react-draggable";
import {UserContext} from "../../context/UserContext";

const ChatRoomModal = ({ chatNo, closeChatModal }) => {

    const { user } = useContext(UserContext);
    const userName = user?.employeeName;

    // 채팅 데이터 state
    const [chatData, setChatData] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const chatBodyRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(`/api/messengers/chat/${chatNo}`);
                setChatData(response.data);
                console.log("채팅 데이터:", response.data);
            } catch (error) {
                console.error("채팅 데이터를 가져오는 중 오류 발생:", error);
            }
        })();
    }, [chatNo]);

    if (!chatData) {
        return <div>채팅 데이터를 가져오는 중</div>;
    }

    const handleSendMessage = () => {
        if (message.trim()) {
            const newMessage = {
                content: message,
                sender: userName,
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages([...messages, newMessage]);
            setMessage("");

            // 메시지 전송 후 스크롤을 최신 메시지로 이동
            setTimeout(() => {
                if (chatBodyRef.current) {
                    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
                }
            }, 100);
        }
    };

    return (
        <div className="chat-room-modal">
            <Draggable handle=".chat-room-header">
            <div className="chat-room">
                <div className="chat-room-header">
                    <h2>{chatData.chatTitle}</h2>
                    <button onClick={closeChatModal} className="close-button">닫기</button>
                </div>
                <div
                    className="chat-room-body"
                    ref={chatBodyRef}
                >
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chat-message ${msg.sender === userName ? "own" : ""}`}
                        >
                            <div className="message-sender">{msg.sender}</div>
                            <div className="message-content">{msg.content}</div>
                            <div className="message-timestamp">{msg.timestamp}</div>
                        </div>
                    ))}
                </div>
                <div className="chat-room-footer">
                    <input
                        type="text"
                        placeholder="메시지를 입력하세요."
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
