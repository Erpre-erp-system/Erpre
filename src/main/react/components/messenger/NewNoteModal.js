import React, { useState } from "react";
import Draggable from "react-draggable";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaRegPlusSquare } from "react-icons/fa";
import useEmployeeSearchModal from "./useEmployeeSearchModal";

const NewNoteModal = ({ closeNewNoteModal }) => {

    const [recipients, setRecipients] = useState("");
    const [messageContent, setMessageContent] = useState("");
    const [sendToMe, setSendToMe] = useState(false);
    const [scheduledSend, setScheduledSend] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const [isEmployeeSearchModalOpen, setEmployeeSearchModalOpen] = useState(false);

    const openEmployeeSearchModal = () => setEmployeeSearchModalOpen(true);
    const closeEmployeeSearchModal = () => setEmployeeSearchModalOpen(false);

    const quillModules = {
        toolbar: [
            ['link', 'image'],
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    return (
        <>
            <Draggable handle=".note-modal-header">
                <div className="new-note-modal">
                    <div className="note-modal-header">
                        <h2>쪽지 보내기</h2>
                        <button onClick={closeNewNoteModal} className="close-button">닫기</button>
                    </div>
                    <div className="note-modal-body">
                        <div className="recipient-section">
                            <label>받는사람</label>
                            <button
                                className="note-employee-search"
                                onClick={openEmployeeSearchModal}
                            >
                                <FaRegPlusSquare />
                            </button>
                            <input
                                type="text"
                                placeholder="받는 사람의 이름을 입력하거나, + 버튼을 눌러 검색하세요"
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                            />
                        </div>
                        <div className="options">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={sendToMe}
                                    onChange={() => setSendToMe(!sendToMe)}
                                />
                                나에게 보내기
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={scheduledSend}
                                    onChange={() => setScheduledSend(!scheduledSend)}
                                />
                                예약전송
                            </label>
                            {scheduledSend && (
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                />
                            )}
                        </div>
                        <ReactQuill
                            theme="snow"
                            value={messageContent}
                            onChange={setMessageContent}
                            modules={quillModules}
                            placeholder="메시지를 입력하세요"
                            className="message-textarea"
                        />
                        <div className="note-footer">
                            <button className="send-button">보내기</button>
                            <button onClick={closeNewNoteModal} className="cancel-button">닫기</button>
                        </div>
                    </div>
                </div>
            </Draggable>

            {/* 직원 검색 모달 */}
            {isEmployeeSearchModalOpen && (
                <useEmployeeSearchModal
                    closeEmployeeSearchModal={closeEmployeeSearchModal}
                    createUrl="/api/messengers/note/create"
                />
            )}
        </>
    );
};

export default NewNoteModal;
