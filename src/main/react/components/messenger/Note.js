import React, {useEffect, useState} from 'react';
import NewNoteModal from "./NewNoteModal";
import ReceivedNoteModal from "./ReceivedNoteModal";
import {BsEnvelopePlusFill} from "react-icons/bs";
import {FaStar, FaTrashAlt} from "react-icons/fa";
import axios from "axios";
import DOMPurify from "dompurify";
import Swal from "sweetalert2";
import { useMessenger } from '../../context/MessengerContext';

const Note = ({ noteStatus, isNewNoteModalOpen, openNewNoteModal, closeNewNoteModal, noteList = [], setNoteList, formatDate }) => {

    const [noteDetail, setNoteDetail] = useState(null); // 선택된 쪽지의 조회된 상세 정보
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedNoteNo, setSelectedNoteNo] = useState(null);
    const [recallMenuVisible, setRecallMenuVisible] = useState(false);
    const [deleteMenuVisible, setDeleteMenuVisible] = useState(false);

    // 메뉴 열기 핸들러
    const handleContextMenu = (event, messageNote) => {
        event.preventDefault();
        event.stopPropagation();

        const x = event.pageX;
        const y = event.pageY;

        const menuWidth = 150;
        const menuHeight = 100;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        let adjustedX = x;
        let adjustedY = y;

        if (x + menuWidth > windowWidth) {
            adjustedX = windowWidth - menuWidth - 10;
        }

        if (y + menuHeight > windowHeight) {
            adjustedY = windowHeight - menuHeight - 10;
        }

        setMenuPosition({ x: adjustedX, y: adjustedY });
        setSelectedNoteNo(messageNote);
        setMenuVisible(true);

        // 상태가 "sent"인 경우 회수하기 메뉴 표시
        if (noteStatus === "sent") {
            setRecallMenuVisible(true);
        } else {
            setRecallMenuVisible(false);
        }

        // 수신자일 때는 언제나 삭제하기 메뉴 표시
        setDeleteMenuVisible(true);
    };

    // 메뉴 클릭 핸들러
    const handleMenuClick = (action) => {
        setMenuVisible(false);  // 메뉴 클릭 후 메뉴를 숨김
        setRecallMenuVisible(false);
        setDeleteMenuVisible(false);

        const selectedNote = noteList.find(note => note.messageNo === selectedNoteNo);

        if (action === 'recall') {
            if (selectedNote) {
                showRecallAlert(selectedNote);
            }
        } else if (action === 'delete') {
            if (selectedNote) {
                showDeleteAlert(selectedNote);
            }
        }
    };

// 메뉴 외부 클릭 감지하여 메뉴 숨기기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuVisible &&
                !event.target.closest('.context-menu') &&
                !event.target.closest('.note-item')
            ) {
                setMenuVisible(false);
                setRecallMenuVisible(false);
                setDeleteMenuVisible(false);
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [menuVisible]);

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

    // 쪽지 삭제 함수
    const deleteNote = async (noteStatus = null, messageNo = null) => {
        try {
            await axios.put(`/api/messengers/note/delete`, null, {
                params: {
                    ...(noteStatus && { noteStatus }),
                    ...(messageNo && { messageNo })
                }
            });
            setNoteList((prevNoteList) =>
                messageNo ? prevNoteList.filter((note) => note.messageNo !== messageNo) : []
            );
        } catch (error) {
            console.error('쪽지 삭제 중 오류 발생:', error);
        }
    };

    // 개별 쪽지 삭제 경고창
    const showDeleteAlert = (note) => {
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
                console.log("쪽지를 삭제합니다:", note.messageNo);
                deleteNote(null, note.messageNo); // 개별 삭제
            }
        });
    };


    // 전체 삭제 경고창
    const showDeleteAllAlert = () => {
        Swal.fire({
            title: `전체 쪽지 삭제`,
            html: '정말로 모든 쪽지를 삭제하시겠습니까?<br/>삭제 후 모든 쪽지 내용은 복구가 불가능합니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '전체 삭제',
            cancelButtonText: '취소',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                console.log("모든 쪽지를 삭제합니다.");
                deleteNote(noteStatus);
            }
        });
    };

    // 쪽지 회수 함수
    const recallNote = async (messageNo) => {
        try {
            await axios.put(`/api/messengers/note/recall/${messageNo}`);
            setNoteList((prevNoteList) => prevNoteList.filter((note) => note.messageNo !== messageNo));
        } catch (error) {
            if (error.response && error.response.status === 400) {
                Swal.fire("회수 불가", "수신자가 이미 쪽지를 읽었기 때문에 회수할 수 없습니다.", "warning");
            } else {
                console.error("쪽지 회수 중 오류 발생:", error);
            }
        }
    };

    // 쪽지 회수 확인 및 경고창
    const  showRecallAlert = (note) => {
        Swal.fire({
            title: "쪽지 회수",
            html: '쪽지를 회수하시겠습니까?<br/>회수 후 쪽지 내용은 수신자에게 보이지 않습니다.',
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "회수",
            cancelButtonText: "취소",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                recallNote(note.messageNo);
            }
        });
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

    // 쪽지 내용을 요약해서 표시하는 함수
    const getPreviewContent = (htmlContent) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
        const imgTags = doc.getElementsByTagName("img");

        if (imgTags.length === 1 && doc.body.children.length === 1) {
            // 이미지 단독
            return "<사진>";
        } else if (imgTags.length > 0) {
            // 이미지와 텍스트 혼합
            return `${doc.body.innerText.substring(0, 20)}... <사진>`;
        } else {
            // 텍스트 단독
            return doc.body.innerText.length > 0
                ? doc.body.innerText.substring(0, 20) + (doc.body.innerText.length > 20 ? '...' : '')
                : "내용 없음";
        }
    };

    return (
        <div className="note-list-container">

            {/* 헤더 */}
            <div className="note-list-header">
                <button className="new-note-button" onClick={openNewNoteModal} aria-label="새로운 쪽지">
                    <BsEnvelopePlusFill/>
                </button>
                <button className="delete-note-button" onClick={showDeleteAllAlert} aria-label="전체 삭제">
                    <FaTrashAlt />
                </button>
            </div>

            {/* 본문 */}
            <div className="note-list">
                {noteList.map((note, index) => {
                    const cleanHTML = DOMPurify.sanitize(note.messageContent);
                    const previewContent = getPreviewContent(cleanHTML);

                    return (
                        <div
                            className={`note-item ${note.recipientReadYn === 'N' ? 'unread' : ''}`}
                            key={index}
                            onClick={() => handleOpenNote(note)}
                            onContextMenu={(event) => handleContextMenu(event, note.messageNo)}
                        >
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
                                <div className="note-content">{previewContent}</div>
                            </div>
                            <div className="note-date">{formatDate(note.messageSendDate)}</div>
                        </div>
                    );
                })}
            </div>

            {/* 우클릭 메뉴 */}
            {(recallMenuVisible || deleteMenuVisible) && (
                <div
                    className="context-menu"
                    style={{
                        top: `${menuPosition.y}px`,
                        left: `${menuPosition.x}px`,
                        height: 'auto',
                    }}
                >
                    <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
                        {recallMenuVisible && (
                            <li
                                onClick={() => handleMenuClick('recall')}
                                style={{
                                    padding: '4px 8px',
                                    cursor: 'pointer'
                                }}
                            >
                                회수하기
                            </li>
                        )}
                        {deleteMenuVisible && (
                            <li
                                onClick={() => handleMenuClick('delete')}
                                style={{
                                    padding: '4px 8px',
                                    cursor: 'pointer'
                                }}
                            >
                                삭제
                            </li>
                        )}
                    </ul>
                </div>
            )}

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
                    handleBookmark={handleBookmark}
                    deletenote={deleteNote}
                />
            )}
        </div>
    );
};

export default Note;