import React, {useEffect, useState} from 'react';
import NewNoteModal from "./NewNoteModal";
import {BsEnvelopePlusFill} from "react-icons/bs";
import {FaStar} from "react-icons/fa";
import axios from "axios";

const Note = ({ formatDate, noteStatus }) => {

    // !!! 검색 메서드 따로 공통 훅으로 빼기
    // 북마크 체크 함수

    // 🟠 새 쪽지 모달창 관리
    const [isNewNoteModalOpen, setNewNoteModalOpen] = useState(false);
    const openNewNoteModal = () => setNewNoteModalOpen(true);
    const closeNewNoteModal = () => setNewNoteModalOpen(false);

    // 🟠 쪽지 데이터 state
    const [noteData, setNoteData] = useState([]);

    // 🟠 쪽지 데이터를 불러오는 함수
    const fetchNoteList = async () => {
        try {
            const response = await axios.get('/api/messengers/note/list', {
                params: {
                    searchKeyword: searchKeyword || '',
                    status: noteStatus
                }
            });
            setNoteData(response.data);
        } catch (error) {
            console.error("쪽지 데이터를 불러오는 중 오류 발생:", error);
        }
    };

    // 🟠 검색
    const [searchKeyword, setSearchKeyword] = useState('');

    useEffect(() => {
        fetchNoteList();
        console.log(noteData);
    }, [searchKeyword, noteStatus]);


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
                {noteData.map(note => (
                    <div className="note-item" key={note.messageNo}>
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
                ))}
            </div>

            {/* 새 쪽지 추가 모달 */}
            {isNewNoteModalOpen && (
                <div className="new-note-modal" onClick={(e) => e.target === e.currentTarget && closeNewNoteModal()}>
                    <div className="new-note-modal-content">
                        <NewNoteModal
                            closeNewChatModal={closeNewNoteModal}
                        />
                    </div>
                </div>
            )}


        </div>
    );
};

export default Note;