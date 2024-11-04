import React, {useEffect, useState} from 'react';
import NewNoteModal from "./NewNoteModal";
import {BsEnvelopePlusFill} from "react-icons/bs";
import {FaStar} from "react-icons/fa";
import axios from "axios";

const Note = ({ isNewNoteModalOpen, openNewNoteModal, closeNewNoteModal, noteList = [], formatDate }) => {

    // 북마크 체크 함수

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
                {noteList.map(((note, index) => (
                    <div className="note-item" key={index}>
                        <div className="note-star">
                            {note.bookmarkedYn === 'Y' ? <FaStar className="star-icon active"/> :
                                <FaStar className="star-icon"/>}
                        </div>
                        <div className="note-info">
                            <div className="note-sender">{note.employeeName}</div>
                            <div className="note-content">{note.messageContent}</div>
                        </div>
                        <div className="note-date">{formatDate(note.messageSendDate)}</div>
                    </div>
                )))}
            </div>

            {/* 새 쪽지 추가 모달 */}
            {isNewNoteModalOpen && (
                <div onClick={(e) => e.target === e.currentTarget && closeNewNoteModal()}>
                    <div className="new-note-modal-content">
                        <NewNoteModal
                            closeNewNoteModal={closeNewNoteModal}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default Note;