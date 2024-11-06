import React, {useEffect, useState} from 'react';
import NewNoteModal from "./NewNoteModal";
import ReceivedNoteModal from "./ReceivedNoteModal";
import {BsEnvelopePlusFill} from "react-icons/bs";
import {FaStar} from "react-icons/fa";
import axios from "axios";
import DOMPurify from "dompurify";

const Note = ({ isNewNoteModalOpen, openNewNoteModal, closeNewNoteModal, noteList = [], setNoteList, formatDate }) => {

    const [noteDetail, setNoteDetail] = useState(null); // 선택된 쪽지의 조회된 상세 정보

    // 북마크 선택/해제 함수
    const handleBookmark = async (note) => {
        try {
            await axios.put(`/api/messengers/note/${note.messageNo}/bookmark`);

            setNoteList((prevNoteList) =>
                prevNoteList.map((n) =>
                    n.messageNo === note.messageNo
                        ? { ...n, bookmarkedYn: n.bookmarkedYn === 'Y' ? 'N' : 'Y' }
                        : n
                )
            );
        } catch (error) {
            console.error("북마크 업데이트 중 오류:", error);
        }
    };

    // 쪽지 상세 조회 호출
    const handleOpenNote = async (note) => {
        try {
            const response = await axios.put(`/api/messengers/note/${note.messageNo}`);
            setNoteDetail(response.data);

            console.log('쪽지 상세 조회 데이터:', response.data);
        } catch (error) {
            console.error("쪽지 상세 조회 중 오류 발생:", error);
        }
    }

    // 쪽지 상세 조회 닫기
    const handleCloseNote = () => {
        setNoteDetail(null);
    }



    return (
        <div className="note-list-container">

            {/* 헤더 */}
            <div className="note-list-header">
                <button className="new-note-button" onClick={openNewNoteModal} aria-label="새로운 쪽지">
                    <BsEnvelopePlusFill/>
                </button>
            </div>

            {/* 본문 */}
            <div className="note-list">
                {noteList.map((note, index) => {
                    const cleanHTML = DOMPurify.sanitize(note.messageContent);

                    return (
                        <div className="note-item" key={index} onClick={() => handleOpenNote(note)}>
                            <div
                                className="note-star"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookmark(note);
                                }}
                            >
                                {note.bookmarkedYn === 'Y' ? (
                                    <FaStar className="star-icon active"/>
                                ) : (
                                    <FaStar className="star-icon"/>
                                )}
                            </div>
                            <div className="note-info">
                                <div className="note-sender">{note.employeeName}</div>
                                <div className="note-content" dangerouslySetInnerHTML={{__html: cleanHTML}}></div>
                            </div>
                            <div className="note-date">{formatDate(note.messageSendDate)}</div>
                        </div>
                    );
                })}
            </div>

            {/* 새 쪽지 추가 모달 */}
            {isNewNoteModalOpen && (
                <div className="new-note-modal-content">
                    <NewNoteModal
                        closeNewNoteModal={closeNewNoteModal}
                    />
                </div>
            )}

            {/* 수신 쪽지 모달 */}
            {noteDetail && (
                <ReceivedNoteModal
                    note={noteDetail}
                    onClose={handleCloseNote}
                />
            )}
        </div>
    );
};

export default Note;