import React from "react";
import Draggable from "react-draggable";
import { FaRegTimesCircle } from "react-icons/fa";
import DOMPurify from 'dompurify';

const ReceivedNoteModal = ({ note, onClose }) => {
    if (!note) return null;

    console.log("ReceivedNoteModal 열린 쪽지:", note); // 확인용 로그
    const cleanHTML = DOMPurify.sanitize(note.messageContent);

    return (
        <Draggable handle=".note-modal-header">
            <div className="received-note-modal">
                <div className="note-modal-header">
                    <h2>받은 쪽지</h2>
                    <button onClick={onClose} className="close-button">
                        <FaRegTimesCircle />
                    </button>
                </div>
                <div className="note-modal-body">
                    <div className="recipient-section">
                        <label>보낸사람:</label>
                        <div className="readonly-field">{note.employeeName}</div>
                    </div>
                    <div className="recipient-section">
                        <label>받는사람:</label>
                        <div className="readonly-field">
                            {note.recipientNames && note.recipientNames.length > 0 ? (
                                note.recipientNames.map((recipient) => (
                                    <span key={recipient} className="recipient-tag">
                                        {recipient}
                                    </span>
                                ))
                            ) : (
                                <span>수신자 없음</span> // 수신자가 없을 때 표시할 내용 (선택사항)
                            )}
                        </div>
                    </div>

                    <div className="message-content-section">
                        <div className="message-content" dangerouslySetInnerHTML={{__html: cleanHTML}} />
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
