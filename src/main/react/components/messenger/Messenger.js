import React, {useEffect, useState} from 'react';
import {FaComments, FaInfoCircle, FaUserAltSlash} from 'react-icons/fa';
import {BsEnvelope} from "react-icons/bs";
import {SlOrganization} from "react-icons/sl";
import Select from 'react-select'; // react-select 라이브러리
import Tree from "rc-tree"; // react-tree 라이브러리
import "rc-tree/assets/index.css"
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from "axios";
import {useMessengerHooks} from "./useMessengerHooks";
import Chat from "./Chat";
import Note from "./Note";
import {IoChevronDown, IoClose} from "react-icons/io5";


// ⭐ 뷰 컴포넌트: Home, Info, Note, Chat
const Home = ({treeData, expandedKeys, handleCheck}) => (
    <div className="messenger-content">
        <Tree
            treeData={treeData}
            defaultExpandAll={true}
            onExpand={(keys) => setExpandedKeys(keys)}
            checkable
            onCheck={handleCheck}
        />
    </div>
);

const Info = () => (
    <div>
        <h3>유저정보 화면</h3>
        {/* 유저정보 UI*/}
    </div>
);

function Messenger({isOpen, toggleMessenger }) {

    const {

        // ⭐ 동적 뷰
        activeView,
        setActiveView,
        isLoading,

        // 🔵 유저
        user,
        status,
        setStatus,
        handleStatusChange,
        userIcon,
        customStyles,
        statusMessage,
        setStatusMessage,
        handleStatusMessageChange,

        // 🟠 쪽지
        isNewNoteModalOpen,
        openNewNoteModal,
        closeNewNoteModal,
        noteList,
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


    const [isStatusMessageOpen, setIsStatusMessageOpen] = useState(false); // 🔵 상태명 입력창 열림/닫힘 관리


    // 🔴 수신자 목록을 관리하는 state
    const [selectedRecipients, setSelectedRecipients] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const MySwal = withReactContent(Swal);

    // 트리 데이터를 설정하는 useEffect
    useEffect(() => {
        const storedEmployeeList = localStorage.getItem('employeeList');
        if (storedEmployeeList) {
            const employeeList = JSON.parse(storedEmployeeList);

            // 서버에서 가져온 데이터를 트리 형식으로 변환
            const treeStructure = buildTreeData(employeeList);
            setTreeData(treeStructure);  // 트리 데이터로 설정
        }
    }, []);

    // 트리 데이터가 변경된 후 expandedKeys를 설정하는 useEffect
    useEffect(() => {
        if (treeData.length > 0) {
            // 모든 노드를 확장하도록 키를 추출하여 설정
            const allKeys = extractKeys(treeData);
            setExpandedKeys(allKeys);  // 모든 노드를 확장
        }
    }, [treeData]);


    // 서버에서 받은 평면 데이터를 트리 구조로 변환하는 함수
    // const buildTreeData = (data) => {
    //     const departmentMap = {};
    //     const tree = [
    //         {
    //             key: "0",
    //             title: "Erpre",
    //             icon: <span>🍎</span>,
    //             children: []
    //         }
    //     ];

    const buildTreeData = (data) => {
        if (!Array.isArray(data)) {
            console.warn('data가 배열이 아닙니다. 빈 배열로 설정합니다.');
            data = [];
        }

        const departmentMap = {};
        const tree = [
            {
                key: "0",
                title: "Erpre",
                icon: <span>🍎</span>,
                children: []
            }
        ];

        //     // 각 직원 데이터를 부서별로 그룹화
        //     data.forEach(employee => {
        //         const departmentName = employee.departmentName;
        //         const employeeNode = {
        //             key: employee.employeeId,
        //             title: employee.employeeName,
        //             isLeaf: true
        //         };
        //
        //         // 해당 부서가 이미 존재하는지 확인
        //         if (!departmentMap[departmentName]) {
        //             const departmentNode = {
        //                 key: employee.departmentId,
        //                 title: departmentName,
        //                 children: []
        //             };
        //             departmentMap[departmentName] = departmentNode;
        //             tree[0].children.push(departmentNode);
        //         }
        //
        //         departmentMap[departmentName].children.push(employeeNode);
        //     });
        //
        //     return tree;
        // }

        // 각 직원 데이터를 부서별로 그룹화
        data.forEach(employee => {
            const departmentName = employee.departmentName;
            const employeeNode = {
                key: employee.employeeId,
                title: employee.employeeName,
                isLeaf: true
            };

            if (!departmentMap[departmentName]) {
                const departmentNode = {
                    key: employee.departmentId,
                    title: departmentName,
                    children: []
                };
                departmentMap[departmentName] = departmentNode;
                tree[0].children.push(departmentNode);
            }

            departmentMap[departmentName].children.push(employeeNode);
        });

        return tree;
    }

    // 상태 메시지 저장 여부 확인 창
    function handleStatusMessageSave() {
        if (isStatusMessageOpen) {
            // 상태 메시지 입력 창이 열린 상태라면 상태 메시지 저장
            MySwal.fire({
                title: '상태명을 변경하시겠습니까?',
                text: `변경된 상태명: ${statusMessage}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '확인',
                cancelButtonText: '취소'
            }).then((result) => {
                if (result.isConfirmed) {
                    // 상태 메시지를 저장하는 API 호출
                    updateStatusMessage(statusMessage);
                    setIsStatusMessageOpen(false); // 상태명 입력창 닫기
                }
            });
        } else {
            // 상태명 입력 창 열기
            setIsStatusMessageOpen(true);
        }

    }

    // 상태명을 업데이트하는 함수
    const updateStatusMessage = (newStatusMessage) => {
        axios.post('/api/update-status', {statusMessage: newStatusMessage})
            .then((response) => {
                MySwal.fire('저장 완료!', '상태명이 변경되었습니다.', 'success');
            })
            .catch((error) => {
                MySwal.fire('오류 발생!', '상태명 변경 중 문제가 발생했습니다.', 'error');
            });
    }

    // 모든 노드의 키를 추출하는 함수
    const extractKeys = (nodes) => {
        let keys = [];
        nodes.forEach(node => {
            keys.push(node.key);
            if (node.children) {
                keys = keys.concat(extractKeys(node.children));
            }
        });
        return keys;
    };

    // 현재 상태 아이콘 가져오는 함수
    const getStatusIcon = () => {
        const selectedOption = userIcon.find(option => option.value === status);
        return selectedOption ? selectedOption.icon : <FaUserAltSlash/>;
    };

    // 커스텀 옵션 컴포넌트
    const Option = (props) => {
        return (
            <div {...props.innerProps} className="custom-option">
                {props.data.icon}
                <span style={{marginLeft: '8px'}}>{props.label}</span>
            </div>
        );

    }

    // 선택된 옵션에 아이콘 표시
    const SingleValue = ({children, ...props}) => (
        <div className="single-value" {...props.innerProps}>
            {props.data.icon}
            <span style={{marginLeft: '8px'}}>{children}</span>
        </div>
    );


    // 🔴 수신자 목록 업데이트 함수
    const handleCheck = (checkedKeys, {checkedNodes}) => {
        const recipientNames = checkedNodes
            .filter(node => !node.children) // 자식 노드만 필터링
            .map(node => node.title); // 직원 이름 가져옴

        console.log(recipientNames);

        setSelectedRecipients(recipientNames);
    }

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
                        <div className="messenger-header"><h3>
                            {activeView === 'home' && 'ERPRE'}
                            {activeView === 'info' && 'MY'}

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
                        {activeView !== 'info' && (
                            <div className="search-wrap messenger-search">
                                <div className={`search_box ${messengerSearchText ? 'has_text' : ''}`}>
                                    <label className="label_floating">
                                        {activeView === 'home' && '이름, 부서명' ||
                                            activeView === 'note' && '이름, 내용' ||
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

                        {/* 유저 프로필*/}
                        {(activeView === 'home' || activeView === 'info') && (
                            <div className="messenger-user">
                                <div className="erpre-logo">
                                    <img src="/img/erpre.png" alt="회사 로고"/>
                                </div>
                                <div className="info">
                                    <div className="info-wrapper">
                                        <div className="user-name">{user?.employeeName || '사용자 정보 없음'}</div>
                                        {/* 상태 아이콘 및 변경 */}
                                        <div className="profile status">
                                            <div className="status-select-wrapper">
                                                <Select
                                                    value={userIcon.find((option) => option.value === status)}
                                                    onChange={handleStatusChange}
                                                    options={userIcon}
                                                    styles={customStyles}
                                                    components={{Option, SingleValue}}
                                                    isSearchable={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* SweetAlert로 상태 변경 확인 및 저장 버튼 */}
                                    <button className="status-message" onClick={handleStatusMessageSave}>
                                        {user?.statusMessage || '상태메세지 없음'}
                                    </button>
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
                        {activeView === 'home' &&
                            <Home
                                treeData={treeData}
                                expandedKeys={expandedKeys}
                                handleCheck={handleCheck}
                            />}
                        {activeView === 'info' && <Info/>}
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
                                noteList={noteList}
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
