import React, {useCallback, useContext, useEffect, useState} from "react";
import { UserContext } from '../../context/UserContext';
import {FaUserAlt, FaUserAltSlash, FaUtensils} from "react-icons/fa";
import {MdMeetingRoom, MdWork} from "react-icons/md";
import {PiOfficeChairFill} from "react-icons/pi";
import axios from "axios";
import { useDebounce } from "../common/useDebounce";
import useSearch from "./useSearch";

export const useMessengerHooks = () => {

    /////////////////////////////////////////////////////////////////////////
    // ⭐ 동적 뷰
    // 🔵 유저
    // 🟠 쪽지
    // 🔴 채팅
    // 🟢 공통
    /////////////////////////////////////////////////////////////////////////

    // ⭐ 활성화된 뷰 관리
    const [activeView, setActiveView] = useState(() => localStorage.getItem('activeView') || 'home');

    // ⭐ 동적 뷰 변경시 local Storage에 저장
    useEffect(() => {
        localStorage.setItem('activeView', activeView);
    }, [activeView]);

    // ⭐ 로딩 관리 state
    const [isLoading, setIsLoading] = useState(true);

    // 🔵 유저 관리 state (online, offline, eating, meeting, working, absent)
    const [status, setStatus] = useState('offline')

    // 🔵 유저 상태 변경 함수
    const handleStatusChange = (selectedOption) => {
        if (selectedOption) {
            setStatus(selectedOption.value);
            console.log(selectedOption);
        }
    };

    // 🔵 유저 상태 아이콘
    const userIcon = [
        {value: 'online', label: '온라인', icon: <FaUserAlt/>},
        {value: 'offline', label: '오프라인', icon: <FaUserAltSlash/>},
        {value: 'eating', label: '식사중', icon: <FaUtensils/>},
        {value: 'working', label: '업무중', icon: <MdWork/>},
        {value: 'meeting', label: '회의중', icon: <MdMeetingRoom/>},
        {value: 'absent', label: '부재중', icon: <PiOfficeChairFill/>}
    ];

    // 🔵 유저 상태 React-Select 커스텀
    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '30px',
            height: '30px',
            fontSize: '16px',
            display: 'flex',
            width: '140px',
            border: 'none',
            boxShadow: 'none',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '28px',
            display: 'flex',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '30px',
            display: 'flex',
            alignItems: 'center',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            transition: 'none',
        }),
        option: (provided, state) => ({
            ...provided,
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
            height: '40px',
        }),
        singleValue: (provided, state) => ({
            ...provided,
            alignItems: 'center',
            fontSize: '16px',
        }),
        menu: (provided) => ({
            ...provided,
            position: 'absolute',
            top: '100%',
            marginTop: '0',
            width: 'calc(100% - 20px)',
            left: '18px',
        }),
    };

    // 🔵 유저 상태메세지 state
    const [statusMessage, setStatusMessage] = useState('');

    // 🔵 유저 상태메세지 변경 함수
    const handleStatusMessageChange = (event) => {
        setStatusMessage(event.target.value);
    }

    // 🔵 유저 정보 조회 Context
    const { user } = useContext(UserContext);

    // 🔵 유저 상태 & 로딩 useEffect
    useEffect(() => {
        if (user) {
            setStatus('online');
            console.log('로그인 유저', user);

            setIsLoading(false);
        }
    }, [user]);

    // 🟠 쪽지 목록 state
    const [noteList, setNoteList] = useState([]);

    // 🟠 쪽지 분류 state
    const [noteStatus, setNoteStatus] = useState('received');
    const options = [
        { label: '받은 쪽지', value: 'received' },
        { label: '새로운 쪽지', value: 'new' },
        { label: '보낸 쪽지', value: 'sent' },
        { label: '보관함', value: 'bookmarked' }
    ];
    const [isNoteDropdownOpen, setIsNoteDropdownOpen] = useState(false);
    const handleNoteStatus = (option) => {
        setNoteStatus(option.value);
        setIsNoteDropdownOpen(false);
    };
    // 🔴 채팅 목록 state
    const [chatList, setChatList] = useState([]);

    // 🔴 개별 채팅 모달
    const [selectedChat, setSelectedChat] = useState(() => localStorage.getItem('selectedChat') || null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(() => localStorage.getItem('isChatModalOpen') === 'true');

    const openChatModal = (chatNo) => {
        setSelectedChat(chatNo);
        setIsChatModalOpen(true);
        localStorage.setItem('selectedChat', chatNo);
        localStorage.setItem('isChatModalOpen', true);
    };

    const closeChatModal = () => {
        setSelectedChat(null);
        setIsChatModalOpen(false);
        localStorage.removeItem('selectedChat');
        localStorage.setItem('isChatModalOpen', false);
    };


    // 🔴 목록 조회 fetch data
    const fetchChatList = useCallback(async (keyword) => {
        setIsLoading(true);
        const params = keyword ? { searchKeyword: keyword } : {};

        try {
            const response = await axios.get('/api/messengers/chat/list', { params });
            const newChatList = response.data;

            console.log("불러온 채팅 데이터", response.data);
            console.log("불러온 채팅 데이터", newChatList);

            // 채팅 목록이 이전과 다를 때만 업데이트
            if (JSON.stringify(chatList) !== JSON.stringify(newChatList)) {
                setChatList(newChatList);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('채팅 목록 조회 실패:', error);
            if (error.response) {
                console.error('서버 응답 에러:', error.response.data); // 서버 응답 상세 확인
            }
            setIsLoading(false);
        }
    }, [activeView, chatList]);


    // // 🔴 검색어에 따른 채팅 목록 API 호출 useEffect
    // const searchChatList = useCallback((keyword) => {
    //     setIsLoading(true);
    //     const params = keyword ? { searchKeyword: keyword } : {}; // 검색어가 없으면 전체 조회
    //
    //     axios.get('/api/messengers/chat/list', { params })
    //         .then((response) => {
    //             setChatList(response.data);
    //             setIsLoading(false);
    //         })
    //         .catch((error) => {
    //             console.error('채팅 목록 검색 실패:', error);
    //             setIsLoading(false);
    //         });
    // }, []);

    // 🟢  검색 state
    const [messengerSearchText, setMessengerSearchText] = useState('');
    const debouncedSearchText = useDebounce(messengerSearchText, 300);

    // 🟢 검색어 변경 함수
    const handleMessengerSearchTextChange = (event) => {
        setMessengerSearchText(event.target.value);
    }
    const handleSearchDel = () => {
        setMessengerSearchText('')
    }

    // ⭐ 동적 뷰에 따른 endpoint 설정
    const getEndpoint = (activeView) => {
        switch(activeView) {
            case 'home':
                return '';
            case 'note':
                return '/api/messengers/note/list';
            case 'chat':
                return '/api/messengers/chat/list';
            default:
                return '';
        }
    }
    const endpoint = getEndpoint(activeView);

    // ⭐ 동적 뷰에 따른 status 설정
    const [listStatus, setListStatus] = useState('');
    useEffect(() => {
        if (activeView === 'home') {
            // 직급, 부서별로 정렬, 상태 전달
        } else if (activeView === 'note') {
            setListStatus(noteStatus);
        }
    }, [activeView, noteStatus]);

    // 🟢 useSearch 훅 사용하여 데이터 가져오기
    const { data = [], searchLoading  } = useSearch(endpoint, debouncedSearchText, listStatus, {});

    // ⭐ 동적 뷰에 따라 상태 업데이트
    useEffect(() => {
        if (activeView === 'home') {
            // 조직도 데이터 저장
        }
        if (activeView === 'note') {
            setNoteList(data);
        }
        if (activeView === 'chat') {
            setChatList(data);
        }
    }, [data, activeView]);

    // 🟠 쪽지 데이터를 불러오는 함수
    const fetchNoteList = async () => {
        try {
            const response = await axios.get('/api/messengers/note/list', {
                params: {
                    searchKeyword: messengerSearchText || '',
                    status: noteStatus
                }
            });
            setNoteList(response.data);
        } catch (error) {
            console.error("쪽지 데이터를 불러오는 중 오류 발생:", error);
        }
    };

    // 🟢 날짜 변환 함수
    const formatDate = (dateString) => {
        const date = new Date(dateString);

        // 날짜가 유효하지 않으면 기본값 반환
        if (isNaN(date.getTime())) {
            return "유효하지 않은 날짜";
        }

        // 원하는 형식: 일-월-년 시:분
        const year = String(date.getFullYear()).slice(2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    // // 🔴 동적 뷰에 따른 채팅 목록 API 호출 useEffect
    // useEffect(() => {
    //     if (activeView === 'chat') {
    //         if (debouncedSearchText) {
    //             searchChatList(debouncedSearchText);
    //         } else {
    //             fetchChatList();
    //         }
    //     }
    // }, [activeView, debouncedSearchText, fetchChatList, searchChatList]);


    // // 🔴 검색어 변경에 따른 채팅 목록 검색 useEffect
    // useEffect(() => {R
    //     if (activeView === 'chat') {
    //         searchChatList(debouncedSearchText);
    //     }
    // }, [activeView, debouncedSearchText, searchChatList]);


    /////////////////////////////////////////////////////////////////////////
    return {

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
        noteList,
        isNoteDropdownOpen,
        setIsNoteDropdownOpen,
        noteStatus,
        setNoteStatus,
        options,
        handleNoteStatus,


        // 🔴 채팅
        chatList,
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


    };
};