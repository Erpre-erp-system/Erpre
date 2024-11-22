// ✏️
// 1. 상태 필터링에서 'null' 값으로 디폴트(전체)를 표현할지, 'all' 이라는 명시적인 값을 보내서 판단하게 할지 -> 추후 유지보수가 용이하도록 명시적인 값 사용, default = 'all'

import React, {useContext, useEffect, useRef, useState} from 'react';
import axios from "axios";
import Select from "react-select";
import Tree from "rc-tree";
import {UserContext} from "../../context/UserContext";
import SockJS from "sockjs-client";
import {Stomp} from "@stomp/stompjs";
import MySwal from "sweetalert2";
import {FaGlobe, FaUserAlt, FaUserAltSlash, FaUserCircle, FaUtensils} from "react-icons/fa";
import {MdMeetingRoom, MdWork} from "react-icons/md";
import {PiOfficeChairFill} from "react-icons/pi";
import InfoDetailModal from "./InfoDetailModal";
import NewNoteModal from "./NewNoteModal";
import useSearch from "./useSearch";
import {useMessengerHooks} from "./useMessengerHooks";
import ChatRoomModal from "./ChatRoomModal";

// Option 컴포넌트
const Option = (props) => {
    return (<div {...props.innerProps} className="custom-option">
        {props.data.icon}
        <span style={{marginLeft: '8px'}}>{props.label}</span>
    </div>);
};

// SingleValue 컴포넌트
const SingleValue = (props) => {
    return (<div {...props.innerProps} style={{display: 'flex', alignItems: 'center'}}>
        {props.data.icon}
        <span style={{marginLeft: '5px', verticalAlign: 'middle', lineHeight: '1'}}>{props.data.label}</span>
    </div>);
};

// 유저 상태 아이콘 및 선택 옵션
const userIcon = [{value: 'online', label: '온라인', icon: <FaUserAlt color="#28a745"/>}, {
    value: 'offline', label: '오프라인', icon: <FaUserAltSlash color="#6c757d"/>
}, {value: 'eating', label: '식사중', icon: <FaUtensils color="#ffc107"/>}, {
    value: 'working', label: '업무중', icon: <MdWork color="#17a2b8"/>
}, {value: 'meeting', label: '회의중', icon: <MdMeetingRoom color="#007bff"/>}, {
    value: 'absent', label: '부재중', icon: <PiOfficeChairFill color="#dc3545"/>
}];


// MessengerHome: 조직도와 유저 상태를 관리하는 메신저 홈 컴포넌트
const MessengerHome = () => {

    // Context: 전역 유저 정보 관리
    const {user, setUser} = useContext(UserContext);

    // 상태 관리
    const [isModalOpen, setModalOpen] = useState({info: false, note: false, chat: false}); // 모달 열림 상태
    const [orgStatus, setOrgStatus] = useState(() => { const employeeId = user?.employeeId; return employeeId ? localStorage.getItem(`orgStatus_${employeeId}`) || "all"  : "all";}); // 조직도 상태 필터링 (초기 상태: 로컬에 저장된 값)
    const [searchKeyword, setSearchKeyword] = useState(''); // 검색어 상태
    const [treeData, setTreeData] = useState([]); // 트리 데이터 상태
    const [expandedKeys, setExpandedKeys] = useState([]); // 확장된 트리 키 상태
    const [selectedEmployees, setSelectedEmployees] = useState([]); // 선택된 직원 상태
    const [selectedChatNo, setSelectedChatNo] = useState(null); // 선택된 채팅방 번호
    const [menuVisible, setMenuVisible] = useState(false); // 우클릭 메뉴 표시 상태
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0}); // 우클릭 메뉴 위치
    const stompClientRef = useRef(null); // WebSocket 클라이언트 레퍼런스

    // 우클릭 컨텍스트 메뉴 상태
    const [contextMenu, setContextMenu] = useState({visible: false, x: 0, y: 0, node: null});

    // 모달 열기 및 닫기 함수
    const openModal = (type) => {
        setModalOpen(prev => ({...prev, [type]: true}));
    };
    const closeModal = (type) => {
        setModalOpen(prev => ({...prev, [type]: false}));
    };

    // 상태 필터링 버튼 클릭 핸들러
    const statusFilter = () => {
        const nextStatus = { all: "online", online: "offline", offline: "all" };
        const newStatus = nextStatus[orgStatus];
        setOrgStatus(newStatus);
        localStorage.setItem(`orgStatus_${user.employeeId}`, newStatus);
    };

    // 조직도 상태 선택 옵션
    const orgStatusOptions = [{value: 'all', label: '전체'}, {value: 'online', label: '접속 중'}, // offline 외의 모든 상태
    ];

    // 공통 검색 훅: 검색 키워드 및 상태 기반으로 조직도 데이터 가져오기
    const {data: employeeData} = useSearch('/api/messengers/organization', searchKeyword, orgStatus);

    // 우클릭 이벤트 핸들러: 컨텍스트 메뉴 표시
    const handleRightClick = (info) => {
        console.log("우클릭 이벤트 발생:", info);
        console.log("선택된 직원 아이디", info.node.key);
        info.event.preventDefault();
        info.event.stopPropagation();

        const x = info.event.pageX;
        const y = info.event.pageY;

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

        setMenuPosition({x: adjustedX, y: adjustedY});
        setMenuVisible(true);

        // 우클릭한 직원의 정보만 selectedEmployees에 담기
        setSelectedEmployees([{
            employeeId: info.node.key, employeeName: info.node.title.props.children[1].props.children[0]
        }]);
    };


    // 메뉴 클릭 핸들러
    const handleMenuClick = async (action) => {
        setMenuVisible(false);

        if (action === 'startChat') {
            try {
                // 선택된 직원과의 채팅방 생성 요청
                const response = await axios.post('/api/messengers/chat/create', selectedEmployees.map(emp => emp.employeeId));


                console.log('채팅방 데이터:', response.data);
                const chatNo = response.data.chatNo;

                // 채팅방 번호를 상태에 저장하고 모달 열기
                setSelectedChatNo(chatNo);
                openModal("chat");
            } catch (error) {
                console.error("채팅방 생성 중 오류 발생:", error);
            }
        } else if (action === 'sendMessage') {
            openModal("note");
        } else if (action === 'viewDetail') {
            openModal("info");
        }
    };

    // 트리 노드 체크 핸들러
    const handleCheck = (checkedKeys, info) => {
        // 체크된 직원의 ID와 이름 추출
        const employees = info.checkedNodes
            .filter(node => node.isLeaf)
            .map(node => ({
                employeeId: node.key, employeeName: node.title.props.children[1].props.children[0]
            }));
        setSelectedEmployees(employees);
    };


    // 상태별 아이콘 가져오기 함수
    const getStatusIcon = (status) => {
        const validStatus = status || 'offline';
        const iconObj = userIcon.find((icon) => icon.value === validStatus);
        return iconObj ? (<span style={{
            width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            {iconObj.icon}
        </span>) : null;
    };


    // 트리 데이터를 새로운 상태로 업데이트하는 함수
    const updateTreeWithLoginStatus = (treeData, onlineUsers) => {
        return treeData.map((node) => {
            if (node.children) {
                return {
                    ...node, children: updateTreeWithLoginStatus(node.children, onlineUsers),
                };
            }
            const isOnline = onlineUsers.includes(node.key);
            return {
                ...node, title: (<div style={{display: 'flex', alignItems: 'center'}}>
                    {getStatusIcon(isOnline ? 'online' : 'offline')}
                    <span style={{marginLeft: '5px'}}>{node.title.props.children[1].props.children}</span>
                </div>),
            };
        });
    };


    // 트리 데이터를 새로운 상태로 업데이트하는 함수
    const updateTreeWithNewStatus = (treeData, statusUpdate) => {
        const {employeeId, newStatus} = statusUpdate;

        // 트리 노드를 업데이트하는 재귀 함수
        const updateNodeStatus = (nodes) => {
            return nodes.map(node => {
                if (node.key === employeeId) {
                    // 해당 직원의 상태를 업데이트
                    return {
                        ...node, title: (<div style={{display: "flex", alignItems: "center"}}>
                            {getStatusIcon(newStatus)} {/* 상태에 맞는 아이콘 */}
                            <span style={{marginLeft: "5px"}}>{node.title.props.children[1].props.children}</span>
                        </div>)
                    };
                } else if (node.children) {
                    // 자식 노드가 있는 경우, 재귀적으로 탐색하여 상태 업데이트
                    return {
                        ...node, children: updateNodeStatus(node.children),
                    };
                }
                return node;
            });
        };

        return updateNodeStatus(treeData);
    };

    // 웹소켓 연결
    useEffect(() => {
        const socket = new SockJS('http://localhost:8787/talk');
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient; // stompClientRef에 stompClient 저장

        stompClient.connect({}, () => {
            console.log("WebSocket 연결 성공");

            stompClient.subscribe('/topic/status', (statusResponse) => {
                const statusUpdate = JSON.parse(statusResponse.body);
                setTreeData((prevData) => updateTreeWithNewStatus(prevData, statusUpdate));
                console.log("상태 업데이트:", statusUpdate);
            });

            stompClient.subscribe('/topic/statusMessage', (statusMessageResponse) => {
                const statusMessageUpdate = statusMessageResponse.body;
                console.log("상태 메시지 업데이트:", statusMessageUpdate);
            });
        }, (error) => {
            console.log("WebSocket 연결 오류:", error);
        });

        stompClient.reconnectDelay = 10000;
        stompClient.activate();

        return () => {
            stompClient.deactivate()
                .then(() => console.log("WebSocket 연결 해제 성공"))
                .catch((error) => console.log("WebSocket 해제 오류", error));
        };
    }, []);

    // React-Select 커스텀 스타일
    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '30px',
            height: '30px',
            fontSize: '14px',
            display: 'flex',
            width: 'auto',
            minWidth: '120px',
            maxWidth: '150px',
            border: 'none',
            boxShadow: 'none',
            marginRight: '0',
        }), indicatorsContainer: (provided) => ({
            ...provided,
            height: '28px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0',
            marginLeft: '0px',
        }), indicatorSeparator: () => ({
            display: 'none',
        }), valueContainer: (provided) => ({
            ...provided,
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 4px',
        }), dropdownIndicator: (provided) => ({
            ...provided, transition: 'none', padding: '0', marginRight: '2px'
        }), option: (provided, state) => ({
            ...provided, display: 'flex', alignItems: 'center', fontSize: '14px', height: '40px',
        }), singleValue: (provided, state) => ({
            ...provided,
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            marginLeft: '0',
            justifyContent: 'flex-end',
            lineHeight: '1',
        }), menu: (provided) => ({
            ...provided,
            position: 'absolute',
            top: '100%',
            marginTop: '0',
            borderRadius: '0',
            width: 'auto',
            left: '35px',
            fontSize: '14px',
        }),
    };

    // 상태 변경 함수
    const handleStatusChange = async (selectedOption) => {
        const newStatus = selectedOption.value;
        setUser((prevUser) => ({
            ...prevUser, employeeStatus: newStatus
        }));

        try {
            await axios.put('/api/messengers/info/update', {employeeStatus: newStatus});
            window.showToast("상태가 변경되었습니다");

            // stompClientRef.current를 사용하여 stompClient에 접근
            stompClientRef.current.send('/app/status', {}, JSON.stringify({
                employeeId: user.employeeId, newStatus
            }));

            setSearchKeyword((prevKeyword) => prevKeyword + " ");
        } catch (error) {
            console.error("상태 업데이트 실패:", error);
        }
    };

    // 상태 메시지 변경 알림창
    function handleStatusMessage() {
        MySwal.fire({
            title: '상태 메시지 변경',
            input: 'text',
            inputPlaceholder: '50자 이하',
            inputAttributes: {
                maxlength: 50, 'aria-label': '50자 이하', autocomplete: 'off'
            },
            showCancelButton: true,
            confirmButtonText: '저장',
            cancelButtonText: '취소',
            preConfirm: (newStatusMessage) => {
                if (!newStatusMessage) {
                    MySwal.showValidationMessage('상태 메시지를 입력해주세요');
                    return false;
                }
                return newStatusMessage;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                updateStatusMessage(result.value);
            }
        });
    }

    // 상태 메시지 업데이트 함수
    const updateStatusMessage = (newStatusMessage) => {
        axios.put('/api/messengers/info/update', {employeeStatusMessage: newStatusMessage})
            .then((response) => {
                MySwal.fire('저장 완료', '상태 메시지가 변경되었습니다.', 'success');
                setUser((prevUser) => ({
                    ...prevUser, employeeStatusMessage: newStatusMessage
                }));
            })
            .catch((error) => {
                window.showToast("상태 메시지 변경 중 오류가 발생했습니다", 'error');
            });
    };

    // 직원 데이터 기반의 조직도 트리 구조 생성
    const createOrgTree = (data) => {
        const departmentMap = {};
        const tree = [{
            key: "0", title: (<div style={{fontWeight: "bold", display: "flex", alignItems: "center"}}>
                Erpre
            </div>), children: []
        }];

        data.forEach((employee) => {
            const departmentName = employee.departmentName;
            const employeeNode = {
                key: employee.employeeId, title: (<div style={{display: "flex", alignItems: "center"}}>
                    <div>
                        {getStatusIcon(employee.employeeStatus)}
                    </div>
                    <span>
                        {employee.employeeName} {employee.jobName}
                        <span
                            style={{
                                color: "rgb(142 141 148)",
                                fontSize: "14px",
                                marginLeft: "5px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "100px",
                                display: "inline-block",
                                verticalAlign: "middle",
                                position: "relative",
                                top: "-1px",
                            }}
                            title={employee.employeeStatusMessage}
                        >
                            {employee.employeeStatusMessage ? (employee.employeeStatusMessage) : ''}
                        </span>
                    </span>
                </div>), isLeaf: true,
            };

            if (!departmentMap[departmentName]) {
                const departmentNode = {
                    key: departmentName, title: <span style={{fontWeight: "bold"}}>{departmentName}</span>, children: []
                };
                departmentMap[departmentName] = departmentNode;
                tree[0].children.push(departmentNode);
            }

            departmentMap[departmentName].children.push(employeeNode);
        });

        return tree;
    };

    // 트리 구조의 모든 노드에서 키를 추출하여 초기 확장 상태에 사용
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

    // 트리 구조 생성 및 업데이트
    useEffect(() => {
        if (employeeData.length > 0) {
            const structuredData = createOrgTree(employeeData);
            setTreeData(structuredData);
            setExpandedKeys(extractKeys(structuredData));
        } else {
            setTreeData([]);
            setExpandedKeys([]);
        }
    }, [employeeData]);

    // 메뉴 외부 클릭 감지하여 메뉴 숨기기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuVisible && !event.target.closest('.context-menu') && !event.target.closest('.rc-tree-node-content-wrapper')) {
                setMenuVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuVisible]);

    return (
        <div>

        {/* 검색 및 필터 */}
        <div className="search-wrap search-wrap">
            <div className={`search_box ${searchKeyword ? 'has_text' : ''}`}>
                <label className="label_floating">
                    이름, 부서, 직급
                </label>
                <i className="bi bi-search"></i>
                <input
                    type="text"
                    className="box search"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{width: '200px'}}
                />

                {/* 검색어 삭제 버튼 */}
                {searchKeyword && (
                    <button
                        className="btn-del"
                        onClick={() => setSearchKeyword('')}
                    >
                        <i className="bi bi-x"></i>
                    </button>)}

            </div>
            {/* 상태 필터 버튼 */}
            <div className="org-status">
                <button onClick={statusFilter}>
                    {orgStatus === 'all' && <FaGlobe className="btn1" />}
                    {orgStatus === 'online' && <FaUserAlt className="btn2" />}
                    {orgStatus === 'offline' && <FaUserAltSlash className="btn3" />}
                </button>
            </div>
        </div>

        <div className="messenger-content" onClick={() => setContextMenu({...contextMenu, visible: false})}>

            {/* 상단 유저 프로필 */}
            <div className="messenger-user">
                <div className="erpre-logo">
                    {user?.employeeImageUrl ? (<img src={user.employeeImageUrl} alt="프로필 사진"/>) : (<FaUserCircle/>)}
                </div>
                <div className="info">
                    <div className="info-wrapper">
                        <div className="user-name">{user?.employeeName || ''}</div>
                        <div className="profile status">
                            <div className="status-select-wrapper">
                                <Select
                                    value={userIcon.find((option) => option.value === user?.employeeStatus)}
                                    onChange={handleStatusChange}
                                    options={userIcon}
                                    styles={customStyles}
                                    isSearchable={false}
                                    components={{Option, SingleValue}}
                                />
                            </div>
                        </div>
                    </div>
                    <button className="status-message" onClick={handleStatusMessage}>
                        {user?.employeeStatusMessage || '상태 메시지를 입력해주세요.'}
                    </button>
                </div>
            </div>

            {/* 직원 조직도 */}
            <Tree
                treeData={treeData}
                expandedKeys={expandedKeys} // 현재 확장된 키
                onExpand={(keys) => setExpandedKeys(keys)} // 확장/축소 이벤트 콜백 함수
                // checkable
                showIcon={false}
                showLine={true}
                onCheck={handleCheck}
                onRightClick={handleRightClick}
                virtual={false}
            />

            {/* 우클릭 메뉴 */}
            {menuVisible && (<div
                className="context-menu"
                style={{
                    top: `${menuPosition.y}px`, left: `${menuPosition.x}px`, position: 'fixed', // 'fixed'로 설정하여 스크롤과 관계없이 위치 유지
                    backgroundColor: '#fff', border: '1px solid #ccc', zIndex: 10000,
                }}
            >
                <ul style={{margin: 0, padding: 0, listStyleType: 'none'}}>
                    {/*<li*/}
                    {/*    onClick={() => handleMenuClick('viewDetail')}*/}
                    {/*    style={{padding: '4px 8px', cursor: 'pointer'}}*/}
                    {/*>*/}
                    {/*    상세정보*/}
                    {/*</li>*/}
                    <li
                        onClick={() => handleMenuClick('sendMessage')}
                        style={{padding: '4px 8px', cursor: 'pointer'}}
                    >
                        쪽지보내기
                    </li>
                    <li
                        onClick={() => handleMenuClick('startChat')}
                        style={{padding: '4px 8px', cursor: 'pointer'}}
                    >
                        채팅하기
                    </li>
                </ul>
            </div>)}

            {/* 상세정보 모달 */}
            {isModalOpen.info && (<InfoDetailModal
                employeeId={selectedEmployees[0]?.employeeId}
                closeInfoModal={() => closeModal('info')}
            />)}

            {/* 쪽지보내기 모달 */}
            {isModalOpen.note && (<NewNoteModal
                closeNewNoteModal={() => closeModal('note')}
                initialRecipients={selectedEmployees}
            />)}

            {/* 채팅방 모달 */}
            {isModalOpen.chat && selectedChatNo && (<ChatRoomModal
                chatNo={selectedChatNo}
                closeChatModal={() => closeModal('chat')}
                chatTitle={selectedEmployees[0]?.employeeName + (selectedEmployees.length > 1 ? ` 외 ${selectedEmployees.length - 1}인` : "")}
            />)}
        </div>
    </div>);
};

export default MessengerHome;