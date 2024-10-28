import React, {useCallback, useEffect, useState} from 'react';
import { useDebounce } from "../common/useDebounce";
import Pagination from "../common/Pagination";
import axios from "axios";
import {MdCheckCircle} from "react-icons/md";
import {IoMdCheckmarkCircleOutline} from "react-icons/io";

const NewChatModal = ({ closeNewChatModal }) => {

    // 🔴 로딩 state
    const [isLoading, setLoading] = useState(false);

    // 🔴 직원 state
    const [selectedEmployees, setSelectedEmployees] = useState([]); // 선택된 직원
    const [employeeSearchResults, setEmployeeSearchResults] = useState([]); // 직원 검색 결과

    // 🔴 직원 검색 state
    const [employeeSearchText, setEmployeeSearchText] = useState(''); // 직원 검색 텍스트
    const debouncedEmployeeSearchText = useDebounce(employeeSearchText, 300); // 딜레이 적용

    // 🔴 페이지네이션 state
    const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [itemsPerPage, setItemsPerPage] = useState(10); // 페이지 당 직원 수
    const [totalItems, setTotalItems] = useState(0); // 총 직원 수


    // 🔴 직원 목록 조회
    const fetchData = useCallback(() => {
        setLoading(true);
        axios
            .get('/api/messengers/employeeList', {
                params: {
                    page: currentPage || null,
                    size: itemsPerPage || null,
                    searchKeyword: employeeSearchText || null,
                },
            })
            .then((response) => {
                const employee = (response.data.content || []).map(employee => ({
                    ...employee,
                    employeeName: employee.employeeName || '-',
                    employeeId: employee.employeeId || '-',
                    departmentName: employee.departmentName || '-',
                    jobName: employee.jobName || '-',
                }));

                console.log("받아온 직원 데이터:", employee)

                setEmployeeSearchResults(response.data.content);
                setTotalItems(response.data.totalElements || 0);
                setTotalPages(response.data.totalPages || 0);
            })
            .catch((error) => {
                console.error("직원 데이터를 가져오는 중 오류 발생:", error);
                setEmployeeSearchResults([]);
                setTotalItems(0);
                setTotalPages(0);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [currentPage, itemsPerPage, debouncedEmployeeSearchText]);

    // 🔴 검색어 또는 페이지가 변경될 때 데이터 호출
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 🔴 페이지 변경 처리 함수
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 🔴 페이지당 항목 수 변경 처리 함수
    const handleItemsPerPageChange = (items) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    };

    // 🔴 검색어 삭제 버튼 클릭 공통 함수
    const handleSearchDel = () => {
        setEmployeeSearchText('');
    };

    // 🔴 검색어 변경(직원)
    const handleEmployeeSearchTextChange = (event) => {
        setEmployeeSearchText(event.target.value);
    };

    // 🔴 모달 배경 클릭 시 창 닫기
    const handleBackgroundClick = (e) => {
        if (e.target.className === 'modal_overlay') {
            closeNewChatModal();
        }
    };

    // 🔴 직원 전체 선택/해제
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allEmployeeId = employeeSearchResults.map(employee => employee.employeeId);
            setSelectedEmployees(allEmployeeId);

            console.log(selectedEmployees);
        } else {
            setSelectedEmployees([]);
        }
    }

    // 🔴 페이지 이동시 전체 체크박스 해체
    useEffect(() => {
        setSelectedEmployees([]);

        const allSelectCheckbox = document.getElementById('all-select_checkbox');
        if (allSelectCheckbox) {
            allSelectCheckbox.checked = false;
        }
    }, [currentPage]);

    // 🔴 직원 개별 선택/해제
    const handleSelectEmployee = (employeeId) => {
        setSelectedEmployees(prevSelected => {
            if (prevSelected.includes(employeeId)) {
                return prevSelected.filter(cd => cd !== employeeId);
            } else {
                return [...prevSelected, employeeId];
            }
        });
        console.log(selectedEmployees);

    };

    // 🔴 채팅방 생성 함수
    const createChatRoom = async () => {
        try {
            const response = await axios.post('/api/chatRooms', { participantIds: selectedEmployees });
            const chatRoomId = response.data.chatRoomId;
            // 채팅방 생성 후 해당 방으로 이동
            navigateToChatRoom(chatRoomId);
        } catch (error) {
            console.error("채팅방 생성 중 오류 발생:", error);
        }
    };

    return (
        <div className="modal_overlay" onMouseDown={handleBackgroundClick}>
            <div className="modal_container search search_employee">
                <div className="header">
                    <div>직원 검색</div>
                    <button className="btn_close" onClick={closeNewChatModal}><i className="bi bi-x-lg"></i></button>
                </div>
                <div className="search_wrap">
                    <div className={`search_box ${employeeSearchText ? 'has_text' : ''}`}>
                        <label className="label_floating">이름, 부서, 직급</label>
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            className="box search"
                            value={employeeSearchText}
                            onChange={handleEmployeeSearchTextChange}
                            style={{ width: '250px' }}
                        />
                        {/* 검색어 삭제 버튼 */}
                        {employeeSearchText && (
                            <button
                                className="btn-del"
                                onClick={() => handleSearchDel(setEmployeeSearchText)}
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>
                    <div>
                        <button
                            className="btn-create"
                            onClick={createChatRoom}
                        >
                            <IoMdCheckmarkCircleOutline />
                        </button>
                    </div>
                </div>
                <div className="table_wrap">
                    {/* 검색 결과가 있을 경우 목록을 출력 */}
                    <table>
                        <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedEmployees.length ===  employeeSearchResults.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>이름</th>
                            <th>부서</th>
                            <th>직급</th>
                        </tr>
                        </thead>
                        <tbody>
                        {isLoading ? (
                            <tr className="tr_empty">
                                <td colSpan="4">
                                    <div className="loading">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </td>
                            </tr>
                        ) : employeeSearchResults.length > 0 ? (
                            /* 검색된 직원 목록을 출력 */
                            employeeSearchResults.map((employee) => (
                                <tr key={employee.employeeId} onClick={() => handleSelectEmployee(employee.employeeId)}>
                                    {/* 체크박스 */}
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.includes(employee.employeeId)}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => handleSelectEmployee(employee.employeeId)}
                                        />
                                    </td>
                                    {/* 직원 이름 */}
                                    <td>{employee.employeeName || '-'}</td>
                                    {/* 직원 부서 */}
                                    <td>{employee.departmentName || '-'}</td>
                                    {/* 직원 직급 */}
                                    <td>{employee.jobName || '-'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr className="tr_empty">
                                <td colSpan="4">
                                    <div className="no_data">조회된 결과가 없습니다.</div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    isLoading={isLoading}
                    handlePage={handlePageChange}
                    handleItemsPerPageChange={handleItemsPerPageChange}
                    showFilters={false}
                />
            </div>
        </div>
    );
}

export default NewChatModal;
