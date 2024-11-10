import React, {useContext, useEffect, useState} from 'react';
import Select from "react-select";
import Tree from "rc-tree";
import {UserContext} from "../../context/UserContext";
import useSearch from "./UseSearch";
import axios from "axios";
import {FaUserAlt, FaUserAltSlash, FaUserCircle, FaUtensils} from "react-icons/fa";
import MySwal from "sweetalert2";
import {MdMeetingRoom, MdWork} from "react-icons/md";
import {PiOfficeChairFill} from "react-icons/pi";
import InfoDetailModal from "./InfoDetailModal";
import NewNoteModal from "./NewNoteModal";

// Option 컴포넌트
const Option = (props) => {
    return (
        <div {...props.innerProps} className="custom-option">
            {props.data.icon}
            <span style={{marginLeft: '8px'}}>{props.label}</span>
        </div>
    );
};

// SingleValue 컴포넌트
const SingleValue = (props) => {
    return (
        <div {...props.innerProps} style={{display: 'flex', alignItems: 'center'}}>
            {props.data.icon}
            <span style={{marginLeft: '5px', verticalAlign: 'middle', lineHeight: '1'}}>{props.data.label}</span>
        </div>
    );
};

// 유저 상태 아이콘 및 선택 옵션
const userIcon = [
    {value: 'online', label: '온라인', icon: <FaUserAlt color="#28a745"/>},
    {value: 'offline', label: '오프라인', icon: <FaUserAltSlash color="#6c757d"/>},
    {value: 'eating', label: '식사중', icon: <FaUtensils color="#ffc107"/>},
    {value: 'working', label: '업무중', icon: <MdWork color="#17a2b8"/>},
    {value: 'meeting', label: '회의중', icon: <MdMeetingRoom color="#007bff"/>},
    {value: 'absent', label: '부재중', icon: <PiOfficeChairFill color="#dc3545"/>}
];


const MessengerHome = ({ homeSearchKeyword }) => {

    const [isNewNoteModalOpen, setNewNoteModalOpen] = useState(false);
    const {user, setUser} = useContext(UserContext);
    const [searchKeyword, setSearchKeyword] = useState(homeSearchKeyword);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [treeData, setTreeData] = useState([]);``
    const [contextMenu, setContextMenu] = useState({ visible: false,  x: 0,  y: 0,  node: null });
    const [selectedEmployees, setSelectedEmployees] = useState([]); // 선택된 직원 정보 저장

    const openNewNoteModal = () => {
        setNewNoteModalOpen(true);
    };

    const closeNewNoteModal = () => {
        setNewNoteModalOpen(false);
    };

    // 메뉴 관련 state
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    // 우클릭 핸들러
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

        setMenuPosition({ x: adjustedX, y: adjustedY });
        setMenuVisible(true);

        // 우클릭한 직원의 정보만 selectedEmployees에 담기
        setSelectedEmployees([{
            employeeId: info.node.key,
            employeeName: info.node.title.props.children[1].props.children[0]
        }]);
    };

    // 메뉴 클릭 핸들러
    const handleMenuClick = (action) => {
        setMenuVisible(false);

        if (action === 'viewDetail') {
            // 상세 정보 보기 로직 추가

        } else if (action === 'sendMessage') {
            openNewNoteModal();
        } else if (action === 'startChat') {
            // 채팅 시작 로직 추가

        }
    };

    // 트리 노드 체크 핸들러
    const handleCheck = (checkedKeys, info) => {
        // 체크된 직원의 ID와 이름 추출
        const employees = info.checkedNodes
            .filter(node => node.isLeaf)
            .map(node => ({
                employeeId: node.key,
                employeeName: node.title.props.children[1].props.children[0]
            }));
        setSelectedEmployees(employees);
    };


    const { data: employeeData } = useSearch('/api/messengers/organization', searchKeyword);

    // 상태별 아이콘 가져오기 함수
    const getStatusIcon = (status) => {
        const iconObj = userIcon.find((icon) => icon.value === status);
        return iconObj ? (
            <span style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {iconObj.icon}
    </span>
        ) : null;
    };

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
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '28px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0',
            marginLeft: '0px',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 4px',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            transition: 'none',
            padding: '0',
            marginRight: '2px'
        }),
        option: (provided, state) => ({
            ...provided,
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            height: '40px',
        }),
        singleValue: (provided, state) => ({
            ...provided,
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            marginLeft: '0',
            justifyContent: 'flex-end',
            lineHeight: '1',
        }),
        menu: (provided) => ({
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
            ...prevUser,
            employeeStatus: newStatus
        }));

        try {
            await axios.put('/api/messengers/info/update', { employeeStatus: newStatus });
            window.showToast("상태가 변경되었습니다");

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
                maxlength: 50,
                'aria-label': '50자 이하',
                autocomplete: 'off'
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
                    ...prevUser,
                    employeeStatusMessage: newStatusMessage
                }));
            })
            .catch((error) => {
                window.showToast("상태 메시지 변경 중 오류가 발생했습니다", 'error');
            });
    };

    // 조직도 트리 구조 생성
    const buildTreeData = (data) => {
        const departmentMap = {};
        const tree = [
            {
                key: "0",
                title: (
                    <div style={{fontWeight: "bold", display: "flex", alignItems: "center"}}>
                        Erpre
                    </div>
                ),
                children: []
            }
        ];

        data.forEach((employee) => {
            const departmentName = employee.departmentName;
            const employeeNode = {
                key: employee.employeeId,
                title: (
                    <div style={{display: "flex", alignItems: "center"}}>
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
                            ({employee.employeeStatusMessage || ''})
                        </span>
                    </span>
                    </div>
                ),
                isLeaf: true,
            };

            if (!departmentMap[departmentName]) {
                const departmentNode = {
                    key: departmentName,
                    title: <span style={{fontWeight: "bold"}}>{departmentName}</span>,
                    children: []
                };
                departmentMap[departmentName] = departmentNode;
                tree[0].children.push(departmentNode);
            }

            departmentMap[departmentName].children.push(employeeNode);
        });

        return tree;
    };

    // 전체 노드 확장용 키 추출
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
            const structuredData = buildTreeData(employeeData);
            setTreeData(structuredData);
            setExpandedKeys(extractKeys(structuredData));
        } else {
            setTreeData([]);
            setExpandedKeys([]);
        }
    }, [employeeData]);

    useEffect(() => {
        setSearchKeyword(homeSearchKeyword);
    }, [homeSearchKeyword]);

    // 메뉴 외부 클릭 감지하여 메뉴 숨기기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuVisible &&
                !event.target.closest('.context-menu') &&
                !event.target.closest('.rc-tree-node-content-wrapper')
            ) {
                setMenuVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuVisible]);

    return (
        <div className="messenger-content" onClick={() => setContextMenu({...contextMenu, visible: false})}>
            {/* 상단 유저 프로필 */}
            <div className="messenger-user">
                <div className="erpre-logo">
                    {user?.employeeImageUrl ? (
                        <img src={user.employeeImageUrl} alt="프로필 사진"/>
                    ) : (
                        <FaUserCircle/>
                    )}
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
                expandedKeys={expandedKeys}
                onExpand={(keys) => setExpandedKeys(keys)}
                checkable
                showIcon={false}
                showLine={true}
                onCheck={handleCheck}
                onRightClick={handleRightClick}
            />

            {/* 우클릭 메뉴 */}
            {menuVisible && (
                <div
                    className="context-menu"
                    style={{
                        top: `${menuPosition.y}px`,
                        left: `${menuPosition.x}px`,
                        position: 'fixed', // 'fixed'로 설정하여 스크롤과 관계없이 위치 유지
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        zIndex: 10000,
                    }}
                >
                    <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
                        <li
                            onClick={() => handleMenuClick('viewDetail')}
                            style={{ padding: '4px 8px', cursor: 'pointer' }}
                        >
                            상세정보
                        </li>
                        <li
                            onClick={() => handleMenuClick('sendMessage')}
                            style={{ padding: '4px 8px', cursor: 'pointer' }}
                        >
                            쪽지보내기
                        </li>
                        <li
                            onClick={() => handleMenuClick('startChat')}
                            style={{ padding: '4px 8px', cursor: 'pointer' }}
                        >
                            채팅하기
                        </li>
                    </ul>
                </div>
            )}

            {/* 쪽지보내기 모달 */}
            {isNewNoteModalOpen && (
                <NewNoteModal
                    closeNewNoteModal={closeNewNoteModal}
                    initialRecipients={selectedEmployees}
                />
            )}

        </div>
    );
};

export default MessengerHome;