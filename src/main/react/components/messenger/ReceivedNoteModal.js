import React, {useContext, useEffect, useState} from "react";
import Draggable from "react-draggable";
import DOMPurify from 'dompurify';
import { UserContext } from "../../context/UserContext";
import {FaReply, FaStar, FaTrashAlt} from "react-icons/fa";
import Swal from "sweetalert2";
import NewNoteModal from "./NewNoteModal";

const ReceivedNoteModal = ({ note, onClose, handleBookmark, deleteNote }) => {
    if (!note) return null;

    // const [selectedNoteNo, setSelectedNoteNo] = useState('');
    const { user } = useContext(UserContext);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    console.log("ReceivedNoteModal 열린 쪽지:", note); // 확인용 로그
    //
    // useEffect(() => {
    //     if (note && note.messageNo) {
    //         setSelectedNoteNo(note.messageNo);
    //     }
    // }, [note]);

    const cleanHTML = DOMPurify.sanitize(note.messageContent);

    // 삭제 경고창 및 요청
    const showDeleteAlert = () => {
        Swal.fire({
            title: `쪽지 삭제`,
            html: '해당 쪽지를 정말 삭제하시겠습니까?<br/>삭제된 쪽지는 복구할 수 없습니다.<br/>※ 나에게 보낸 쪽지인 경우, 받은 쪽지함과 보낸 쪽지함에서 모두 삭제됩니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteNote(null, note.messageNo);
            }
        });
    };

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
        <div>
        <Draggable>
            <div className="received-note-modal">
                <div className="note-modal-header-re">
                    <div className="note-actions">
                        <button
                            className="note-action-button del"
                            onClick={() => deleteNote(null, note?.messageNo)} // deleteNote 호출
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
                        <button
                            className="note-action-button reply"
                            onClick={() => setReplyModalOpen(true)}
                        >
                            <FaReply />
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
                            <span className="note-name">{user.employeeName} {user.jobName} ({user.departmentName})</span>
                        </div>
                    </div>

                    <div className="note-divider"/>

                    <div className="note-content-section">
                        <div className="note-content" dangerouslySetInnerHTML={{ __html: cleanHTML }} />
                    </div>

                    <div className="note-footer">
                        <button onClick={onClose} className="close-button-footer">닫기</button>
                    </div>
                </div>
            </div>

        </Draggable>

            {/* 답장 모달 */}
            {replyModalOpen && (
                <NewNoteModal
                    closeNewNoteModal={() => setReplyModalOpen(false)}
                    initialRecipients={[{
                        employeeId: note.employeeId,
                        employeeName: note.employeeName
                    }]}
                />
            )}
        </div>
    );
};

export default ReceivedNoteModal;
