import React, {useCallback, useEffect, useState} from 'react';
import { useDebounce } from "../common/useDebounce";
import Pagination from "../common/Pagination";
import axios from "axios";
import {TiDelete} from "react-icons/ti";

const NewChatModal = ({ closeNewChatModal, refreshChatList }) => {

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

                setEmployeeSearchResults(employee);
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
            const allEmployeesOnPage = employeeSearchResults.map(employee => ({
                employeeId: employee.employeeId,
                employeeName: employee.employeeName,
                departmentName: employee.departmentName,
                jobName: employee.jobName,
            }));
            setSelectedEmployees(prevSelected => {
                const newSelected = [...prevSelected];
                allEmployeesOnPage.forEach(employee => {
                    if (!newSelected.some(selected => selected.employeeId === employee.employeeId)) {
                        newSelected.push(employee);
                    }
                });
                return newSelected;
            });
        } else {
            const allEmployeeIdsOnPage = employeeSearchResults.map(employee => employee.employeeId);
            setSelectedEmployees(prevSelected =>
                prevSelected.filter(selected => !allEmployeeIdsOnPage.includes(selected.employeeId))
            );
        }
    };

    // 🔴 전체 선택 체크박스 상태를 업데이트
    const isAllSelected = employeeSearchResults.length > 0 && employeeSearchResults.every(employee =>
        selectedEmployees.some(selected => selected.employeeId === employee.employeeId)
    );

    // 🔴 페이지 이동 시 선택된 항목 상태 유지하는 로직
    useEffect(() => {
        const allSelectCheckbox = document.getElementById("all-select_checkbox");
        if (allSelectCheckbox) {
            allSelectCheckbox.checked = isAllSelected;
        }
    }, [isAllSelected, employeeSearchResults, selectedEmployees]);

    // 🔴 직원 개별 선택/해제
    const handleSelectEmployee = (employeeId, employeeName, departmentName, jobName) => {
        setSelectedEmployees((prevSelected) => {
            const isAlreadySelected = prevSelected.some(
                (selected) => selected.employeeId === employeeId
            );
            if (isAlreadySelected) {
                return prevSelected.filter(
                    (selected) => selected.employeeId !== employeeId
                );
            } else {
                return [
                    ...prevSelected,
                    { employeeId, employeeName, departmentName, jobName },
                ];
            }
        });
    };

    // 🔴 선택된 직원 개별 삭제
    const handleRemoveSelectedEmployee = (employeeId) => {
        setSelectedEmployees(prevSelected =>
            prevSelected.filter(employee => employee.employeeId !== employeeId)
        );
    };

    // 🔴 채팅방 생성 함수
    const createChatRoom = async () => {

        try {
            const employeeIds = selectedEmployees.map(employee => employee.employeeId);

            const response = await axios.post('/api/messengers/chat/create', employeeIds);

            console.log('채팅방 생성 성공', response.data)

            refreshChatList();
            closeNewChatModal();

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
                    <div className="create-wrap">
                        <button
                            className="btn-create"
                            onClick={createChatRoom}
                        >
                            시작
                        </button>
                    </div>
                </div>
                <div className="table_wrap">
                    {/* 검색 결과가 있을 경우 목록을 출력 */}
                    <table>
                        <thead>
                        <tr>
                            <th>
                                <div className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </div>
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
                                <tr key={employee.employeeId} onClick={() => handleSelectEmployee(employee.employeeId, employee.employeeName, employee.departmentName, employee.jobName)}>
                                    {/* 체크박스 */}
                                    <td>
                                        <div className="checkbox-container">
                                        <input
                                            type="checkbox"
                                            checked={selectedEmployees.some(selected => selected.employeeId === employee.employeeId)} // 수정 부분
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => handleSelectEmployee(employee.employeeId, employee.employeeName, employee.departmentName, employee.jobName)}
                                        />
                                        </div>
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
                {/* 선택된 직원 목록 */}
                <div className="selected-employees">
                    <ul className="selected-employees-list">
                        {selectedEmployees.map((employee) => (
                            <li
                                key={employee.employeeId}
                                className="selected-employee-item"
                                onClick={() => handleRemoveSelectedEmployee(employee.employeeId)}
                            >
                                {employee.employeeName}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveSelectedEmployee(employee.employeeId);
                                    }}
                                >
                                    <TiDelete/>
                                </button>
                            </li>
                        ))}
                    </ul>
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
