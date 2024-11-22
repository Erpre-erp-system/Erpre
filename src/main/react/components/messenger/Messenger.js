import React from 'react';
import "rc-tree/assets/index.css"
import {FaComments, FaInfoCircle} from 'react-icons/fa';
import {BsEnvelope} from "react-icons/bs";
import {SlOrganization} from "react-icons/sl";
import {IoChevronDown, IoClose} from "react-icons/io5";
import MessengerHome from "./MessengerHome";
import Info from "./Info";
import Note from "./Note";
import Chat from "./Chat";
import {useMessengerHooks} from "./useMessengerHooks";

function Messenger({isOpen, toggleMessenger }) {

    const {

        // ⭐ 동적 뷰
        activeView,
        setActiveView,
        isLoading,

        // 🟠 쪽지
        isNewNoteModalOpen,
        openNewNoteModal,
        closeNewNoteModal,
        noteList,
        setNoteList,
        isNoteDropdownOpen,
        setIsNoteDropdownOpen,
        noteStatus,
        options,
        handleNoteStatus,

        // 🔴 채팅
        chatList,
        setChatList,
        fetchChatList,
        selectedChat,
        isChatModalOpen,
        openChatModal,
        closeChatModal,

        // 🟢 공통
        messengerSearchText,
        setMessengerSearchText,
        handleSearchDel,
        handleMessengerSearchTextChange,
        formatDate,

    } = useMessengerHooks();

    return (
        <div>
            {/* 슬라이드 패널*/}
            <div className={`messenger-panel ${isOpen ? 'open' : ''}`}>

                {/* 사이드바 */}
                <div className="sidebar">
                    {/* 사이드바 상단*/}
                    <div className="messenger-btn top">
                        <button className="btn1" onClick={() => setActiveView('home')}><SlOrganization/></button>
                        <button className="btn2" onClick={() => setActiveView('info')}><FaInfoCircle/></button>
                        <button className="btn4" onClick={() => setActiveView('note')}><BsEnvelope/></button>
                        <button className="btn3" onClick={() => setActiveView('chat')}><FaComments/></button>
                    </div>
                    {/* 사이드바 하단*/}
                    <div className="button bottom"></div>
                </div>


                        {/* 메신저 헤더 */}
                        <div className={`messenger-header ${activeView === 'info' ? 'info-header' : ''}`}>
                            <h3>
                                {activeView === 'home' && 'ERPRE'}
                                {activeView === 'info'}
                                {activeView === 'note' ? (
                                    <div className="dropdown-header" onClick={() => setIsNoteDropdownOpen(!isNoteDropdownOpen)}>
                                        <h3 className="dropdown-title">
                                            {options.find(opt => opt.value === noteStatus)?.label || '받은 쪽지'}
                                            <IoChevronDown />
                                        </h3>
                                        {isNoteDropdownOpen && (
                                            <div className="dropdown-content">
                                                {options.map((option, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => handleNoteStatus(option)}
                                                        className="dropdown-item"
                                                    >
                                                        {option.label}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {activeView === 'chat' && '채팅'}
                            </h3>
                                <IoClose className="messenger-close" title="닫기" onClick={toggleMessenger}/>
                        </div>

                        {/* 검색창 */}
                        {(activeView !== 'info' && activeView !== 'home') && (
                            <div className="search-wrap messenger-search">
                                <div className={`search_box ${messengerSearchText ? 'has_text' : ''}`}>
                                    <label className="label_floating">
                                        {activeView === 'note' && '이름, 내용' ||
                                            activeView === 'chat' && '참여자, 채팅방 이름, 메세지 내용'}
                                    </label>
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        className="box search"
                                        value={messengerSearchText}
                                        onChange={handleMessengerSearchTextChange}
                                        style={{ width: '265px' }}
                                    />
                                    {/* 검색어 삭제 버튼 */}
                                    {messengerSearchText && (
                                        <button
                                            className="btn-del"
                                            onClick={() => handleSearchDel(setMessengerSearchText)}
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                {/* 로딩 적용*/}
                {isLoading ? (
                    <div className="tr_empty">
                        <div>
                            <div className="loading">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>

                        {/* 메신저 본문 동적 뷰*/}
                        {activeView === 'home' && <MessengerHome />}
                        {activeView === 'info' &&
                            <Info />}
                        {activeView === 'chat' &&
                            <Chat
                                chatList={chatList}
                                setChatList={setChatList}
                                fetchChatList={fetchChatList}
                                formatDate={formatDate}
                                selectedChat={selectedChat}
                                isChatModalOpen={isChatModalOpen}
                                openChatModal={openChatModal}
                                closeChatModal={closeChatModal}
                            />}
                        {activeView === 'note' &&
                            <Note
                                noteStatus={noteStatus}
                                noteList={noteList}
                                setNoteList={setNoteList}
                                formatDate={formatDate}
                                isNewNoteModalOpen={isNewNoteModalOpen}
                                openNewNoteModal={openNewNoteModal}
                                closeNewNoteModal={closeNewNoteModal}
                            />}
                    </>
                )}
            </div>
        </div>
    );
}

export default Messenger;
