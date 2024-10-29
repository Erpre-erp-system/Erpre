import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/common/Main.css';
import Layout from "../../layout/Layout";
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/hr/EmployeeList.css';
import { formatDate } from '../../util/dateUtils';
import { useDebounce } from '../common/useDebounce';

const ITEMS_PER_PAGE = 20;

function EmployeeAttend() {
    const [attendanceData, setAttendanceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedAttendances, setSelectedAttendances] = useState([]);
    const [searchAttendance, setSearchAttendance] = useState('');
    const debouncedSearchAttendance = useDebounce(searchAttendance, 300);

    // 날짜 선택 상태 관리 (초기값: 오늘 날짜)
    const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);

    // 날짜 변경 핸들러
    const handleDateChange = (e) => {
        setDeliveryDate(e.target.value); // 선택된 날짜를 YYYY-MM-DD 형식으로 설정
    };

    useEffect(() => {
        // 모의 데이터 생성
        const mockData = [
            {
                attendanceId: 1,
                employee: { employeeName: "홍길동" },
                attendanceDate: new Date(),
                checkInTime: new Date(),
                checkOutTime: null,
                totalHoursWorked: 8.0,
                overtimeHours: 2.0,
                attendanceStatus: "출근",
                approvalStatus: "대기",
                reason: null,
            },
            {
                attendanceId: 2,
                employee: { employeeName: "김영희" },
                attendanceDate: new Date(),
                checkInTime: new Date(),
                checkOutTime: new Date(),
                totalHoursWorked: 8.0,
                overtimeHours: 0.0,
                attendanceStatus: "퇴근",
                approvalStatus: "승인",
                reason: "출장",
            }
        ];

        setAttendanceData(mockData);
        setFilteredData(mockData);
        setTotalPages(Math.ceil(mockData.length / ITEMS_PER_PAGE));
        setSelectedAttendances(new Array(mockData.length).fill(false));
    }, []);

    useEffect(() => {
        if (debouncedSearchAttendance === '') {
            setFilteredData(attendanceData);
        } else {
            const filtered = attendanceData.filter(attendance =>
                attendance.employee.employeeName.toLowerCase().includes(debouncedSearchAttendance.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }, [debouncedSearchAttendance, attendanceData]);

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedAttendances(new Array(filteredData.length).fill(newSelectAll));
    };

    const handleSelect = (index) => {
        const updatedSelection = [...selectedAttendances];
        updatedSelection[index] = !updatedSelection[index];
        setSelectedAttendances(updatedSelection);

        if (updatedSelection.includes(false)) {
            setSelectAll(false);
        } else {
            setSelectAll(true);
        }
    };

    const handleDeleteSelected = () => {
        const selectedIds = attendanceData
            .filter((_, index) => selectedAttendances[index])
            .map(attendance => attendance.attendanceId);

        if (selectedIds.length === 0) {
            alert("삭제할 항목을 선택해주세요.");
            return;
        }

        const updatedData = attendanceData.filter(attendance => !selectedIds.includes(attendance.attendanceId));
        setAttendanceData(updatedData);
        setSelectedAttendances(new Array(updatedData.length).fill(false));
    };

    const PageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <Layout currentMenu="employeeAttend">
            <main className="main-content menu_employee">
                <div className="menu_title">
                    <div className="sub_title">인사 관리</div>
                    <div className="main_title">근태 관리</div>
                </div>

                <div className="menu_content">
                    <div className="search_wrap">
                        <div className="left">
                            <div className={`search_box ${searchAttendance ? 'has_text' : ''}`}>
                                <label className={`label_floating ${searchAttendance ? 'active' : ''}`}>이름 입력</label>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="box search"
                                    value={searchAttendance}
                                    onChange={(e) => setSearchAttendance(e.target.value)}
                                />
                                {searchAttendance && (
                                    <button
                                        className="btn-del"
                                        onClick={() => setSearchAttendance('')}
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            <div>
                                <label htmlFor="deliveryDate">근태조회일</label>
                                <input
                                    type="date"
                                    id="deliveryDate"
                                    value={deliveryDate}
                                    onChange={handleDateChange}
                                    max={new Date().toISOString().split('T')[0]} // 오늘 포함 이전 날짜 선택 가능
                                />
                                <p>선택된 날짜: {deliveryDate || '날짜를 선택하세요'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="table_wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <label className="chkbox_label">
                                            <input
                                                type="checkbox" className="chkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
                                            <i className="chkbox_icon">
                                                <i className="bi bi-check-lg"></i>
                                            </i>
                                        </label>
                                    </th>
                                    <th>번호</th>
                                    <th>직원명</th>
                                    <th>근무일자</th>
                                    <th>출근 시간</th>
                                    <th>퇴근 시간</th>
                                    <th>근무 시간</th>
                                    <th>연장 근무</th>
                                    <th>근무 상태</th>
                                    <th>승인 상태</th>
                                    <th>비고</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr className="tr_empty">
                                        <td colSpan="11">
                                            <div className="no_data">
                                                <i className="bi bi-exclamation-triangle"></i>
                                                조회된 결과가 없습니다.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((attendance, index) => (
                                        <tr key={attendance.attendanceId}>
                                            <td>
                                                <label className="chkbox_label">
                                                    <input
                                                        type="checkbox"
                                                        className="chkbox"
                                                        checked={selectedAttendances[index] || false}
                                                        onChange={() => handleSelect(index)}
                                                    />
                                                    <i className="chkbox_icon">
                                                        <i className="bi bi-check-lg"></i>
                                                    </i>
                                                </label>
                                            </td>
                                            <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                            <td>{attendance.employee.employeeName}</td>
                                            <td>{formatDate(attendance.attendanceDate)}</td>
                                            <td>{attendance.checkInTime ? formatDate(attendance.checkInTime, 'HH:mm') : '-'}</td>
                                            <td>{attendance.checkOutTime ? formatDate(attendance.checkOutTime, 'HH:mm') : '-'}</td>
                                            <td>{attendance.totalHoursWorked} 시간</td>
                                            <td>{attendance.overtimeHours} 시간</td>
                                            <td>{attendance.attendanceStatus}</td>
                                            <td>{attendance.approvalStatus}</td>
                                            <td>{attendance.reason || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination-container">
                        <div className="pagination-sub left">
                            <button className="box" onClick={handleDeleteSelected}>
                                <i className="bi bi-trash3"></i> 선택 삭제
                            </button>
                        </div>

                        <div className="pagination">
                            {page > 1 && (
                                <button className="box icon first" onClick={() => PageChange(1)}>
                                    <i className="bi bi-chevron-double-left"></i>
                                </button>
                            )}
                            {page > 1 && (
                                <button className="box icon left" onClick={() => PageChange(page - 1)}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                            )}

                            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                const currentPage = Math.floor((page - 1) / 5) * 5 + 1 + index;
                                return (
                                    currentPage <= totalPages && (
                                        <button
                                            key={currentPage}
                                            onClick={() => PageChange(currentPage)}
                                            className={currentPage === page ? 'box active' : 'box'}
                                        >
                                            {currentPage}
                                        </button>
                                    )
                                );
                            })}

                            {page < totalPages && (
                                <button className="box icon right" onClick={() => PageChange(page + 1)}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            )}

                            {page < totalPages && (
                                <button className="box icon last" onClick={() => PageChange(totalPages)}>
                                    <i className="bi bi-chevron-double-right"></i>
                                </button>
                            )}
                        </div>
                        <div className="pagination-sub right"></div>
                    </div>
                </div>
            </main>
        </Layout>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <EmployeeAttend />
    </BrowserRouter>
);
