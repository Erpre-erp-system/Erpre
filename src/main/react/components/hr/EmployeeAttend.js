import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/common/Main.css';
import Layout from "../../layout/Layout";
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/hr/EmployeeList.css';
import { formatDate } from '../../util/dateUtils';
import { useDebounce } from '../common/useDebounce';
import axios from 'axios';
import { format } from 'date-fns';

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
    const [currentView, setCurrentView] = useState('activeAttendances');

    // 날짜 선택 상태 관리 (초기값: 오늘 날짜)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // 날짜 변경 핸들러
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    useEffect(() => {
        fetchAttendances(page, currentView);
    }, [page, currentView, selectedDate]);

    const fetchAttendances = (page, view) => {
        // 페이지 번호를 0부터 시작하도록 조정
        const adjustedPage = page - 1;
        const url = `/api/${view}?page=${adjustedPage}&size=${ITEMS_PER_PAGE}&date=${selectedDate}`; // selectedDate를 쿼리 파라미터에 추가
        axios.get(url)
            .then(response => {
                console.log("API 응답 데이터:", response.data); // 응답 데이터 확인
                setAttendanceData(response.data.content);
                setFilteredData(response.data.content);
                setTotalPages(response.data.totalPages);
                setSelectedAttendances(new Array(response.data.content.length).fill(false));
            })
            .catch(error => console.error('근태 데이터 조회 에러:', error));
    };

    // 근무 시간 계산 함수 추가
    function calculateWorkingHours(checkInTime, checkOutTime) {
        if (!checkInTime || !checkOutTime) return 0;

        const checkIn = new Date(checkInTime);
        const checkOut = new Date(checkOutTime);

        let totalHours = (checkOut - checkIn) / (1000 * 60 * 60);

        if (checkIn.getHours() < 13) {
            totalHours -= 1; // 점심시간 1시간 제외
        }

        return Math.max(totalHours, 0).toFixed(1);
    }

    // 연장 근무 시간 계산 함수 추가
    function calculateOvertime(totalHours) {
        const overtime = totalHours - 8;
        return overtime > 0 ? overtime.toFixed(1) : 0;
    }

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

        axios.put('/api/deleteAttendances', selectedIds)
            .then(() => {
                // 삭제 후, 현재 페이지와 보기 설정에 맞게 데이터를 다시 로드합니다.
                fetchAttendances(page, currentView);
                // 선택된 항목 배열을 초기화합니다.
                setSelectedAttendances(new Array(attendanceData.length).fill(false));
            })
            .catch(error => console.error('삭제 중 에러 발생:', error));
    };

    const PageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleFilterChange = (type) => {
        setCurrentView(type);
        setPage(1);
        fetchAttendances(1, type);
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
                                    <button className="btn-del" onClick={() => setSearchAttendance('')}>
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            <div>
                                <label htmlFor="selectedDate">근태조회일</label>
                                <input
                                    type="date"
                                    id="selectedDate"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    max={new Date().toISOString().split('T')[0]}
                                />

                            </div>
                        </div>
                        <div className="radio_box">
                            <span>상태</span>
                            <input type="radio" id="all" name="filterType" value="allAttendances"
                                   checked={currentView === 'allAttendances'}
                                   onChange={() => handleFilterChange('allAttendances')} />
                            <label htmlFor="all">전체</label>
                            <input type="radio" id="active" name="filterType" value="activeAttendances"
                                   checked={currentView === 'activeAttendances'}
                                   onChange={() => handleFilterChange('activeAttendances')} />
                            <label htmlFor="active">정상</label>
                            <input type="radio" id="deleted" name="filterType" value="deletedAttendances"
                                   checked={currentView === 'deletedAttendances'}
                                   onChange={() => handleFilterChange('deletedAttendances')} />
                            <label htmlFor="deleted">삭제</label>
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
                                    <th>직원명</th>
                                    <th>근무일자</th>
                                    <th>출근 시간</th>
                                    <th>퇴근 시간</th>
                                    <th>근무 시간</th>
                                    <th>초과 근무</th>
                                    <th>근무 상태</th>
                                    <th>승인 상태</th>
                                    <th>삭제 일시</th>
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
                                    filteredData.map((attendance, index) => {
                                        // 근태조회일을 근무일자로 사용하고, 월-일 형식으로 표시
                                        const workDate = selectedDate ? format(new Date(selectedDate), 'MM-dd') : '-';
                                        // 출근시간 포맷: 시와 분만 표시
                                        const checkInTimeFormatted = attendance.checkInTime ? format(new Date(attendance.checkInTime), 'HH:mm') : '-';
                                        // 퇴근시간 포맷: 시와 분만 표시
                                        const checkOutTimeFormatted = attendance.checkOutTime ? format(new Date(attendance.checkOutTime), 'HH:mm') : '-';
                                        // 삭제일시 포맷: 년-월-일만 표시
                                        const deleteDateFormatted = attendance.attendanceDeleteDate ? format(new Date(attendance.attendanceDeleteDate), 'yyyy-MM-dd') : '-';

                                        // 근무 시간과 초과 근무 시간 계산
                                        const totalHours = calculateWorkingHours(attendance.checkInTime, attendance.checkOutTime);
                                        const overtimeHours = calculateOvertime(totalHours);

                                        return (
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
                                                <td>{attendance.employee.employeeName}</td>
                                                <td>{workDate}</td> {/* 근무일자 */}
                                                <td>{checkInTimeFormatted}</td> {/* 출근시간 */}
                                                <td>{checkOutTimeFormatted}</td> {/* 퇴근시간 */}
                                                <td>{totalHours} 시간</td> {/* 근무 시간 */}
                                                <td>{overtimeHours} 시간</td> {/* 초과 근무 */}
                                                <td>{attendance.attendanceStatus}</td>
                                                <td>{attendance.approvalStatus}</td>
                                                <td>{deleteDateFormatted}</td> {/* 삭제일시 */}
                                                <td>{attendance.reason || '-'}</td>
                                            </tr>
                                        );
                                    })
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
