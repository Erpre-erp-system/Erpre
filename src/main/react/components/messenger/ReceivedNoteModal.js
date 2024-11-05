import React from "react";
import Draggable from "react-draggable";
import { FaRegTimesCircle } from "react-icons/fa";

const ReceivedNoteModal = ({ note, onClose }) => {
    if (!note) return null;

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
                        <div className="readonly-field">{note.senderName}</div>
                    </div>
                    <div className="recipient-section">
                        <label>받는사람:</label>
                        <div className="readonly-field">
                            {note.recipients.map((recipient) => (
                                <span key={recipient.employeeId} className="recipient-tag">
                                    {recipient.employeeName}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="message-content-section">
                        <label>내용:</label>
                        <div className="message-content">{note.messageContent}</div>
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
