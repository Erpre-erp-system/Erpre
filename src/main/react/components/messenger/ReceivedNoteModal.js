import React, { useContext } from "react";
import Draggable from "react-draggable";
import DOMPurify from 'dompurify';
import { UserContext } from "../../context/UserContext";
import {FaReply, FaStar, FaTrashAlt} from "react-icons/fa";

const ReceivedNoteModal = ({ note, onClose, handleBookmark, deleteNote }) => {
    if (!note) return null;

    const { user } = useContext(UserContext);
    console.log("ReceivedNoteModal 열린 쪽지:", note); // 확인용 로그
    const cleanHTML = DOMPurify.sanitize(note.messageContent);

    // 날짜 형식 포맷 함수
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');

        const period = hours < 12 ? '오전' : '오후';
        const formattedHour = hours % 12 || 12; // 12시간 형식으로 표시

        return `${year}.${month}.${day} ${period} ${String(formattedHour).padStart(2, '0')}:${minutes}`;
    };

    return (
        <Draggable handle=".note-modal-header">
            <div className="received-note-modal">
                <div className="note-modal-header">
                    <div className="note-actions">
                        <button
                            className="note-action-button del"
                            onClick={() => deleteNote(note.messageNo)} // deleteNote 호출
                        >
                            <FaTrashAlt/>
                        </button>
                        <button
                            className="note-action-button bookmark"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBookmark(note); // 전달된 handleBookmark 사용
                            }}>
                            {note.bookmarkedYn === 'Y' ? (
                                <FaStar className="star-icon active"/>
                            ) : (
                                <FaStar className="star-icon"/>
                            )}
                        </button>
                        <button className="note-action-button reply">
                            <FaReply/>
                        </button>
                    </div>
                    <div className="received-date">
                        {formatDate(note.messageSendDate)}
                    </div>
                </div>

                <div className="note-modal-body">
                    <div className="note-meta-section">
                        <div className="meta-row">
                            <label>보낸 사람</label>
                            <span className="note-name">{note.employeeName} {note.employeeJobName} ({note.employeeDepartmentName})</span>
                        </div>
                        <div className="meta-row">
                            <label>받는 사람</label>
                            <span>{user.employeeName}</span>
                        </div>
                    </div>

                    <div className="note-divider" />

                    <div className="message-content-section">
                        <div className="message-content" dangerouslySetInnerHTML={{ __html: cleanHTML }} />
                    </div>

                    <div className="note-footer">
                        <button onClick={onClose} className="close-button-footer">닫기</button>
                    </div>
                </div>
            </div>
        </Draggable>
    );
};

export default ReceivedNoteModal;
