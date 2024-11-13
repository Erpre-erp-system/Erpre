import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/common/Main.css';
import Layout from "../../layout/Layout";
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/hr/EmployeeAttend.css';
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
        const adjustedPage = page - 1;
        const url = `/api/attendance/${view}?page=${adjustedPage}&size=${ITEMS_PER_PAGE}&date=${selectedDate}`;
        axios.get(url)
            .then(response => {
                console.log("API 응답 데이터:", response.data);
                setAttendanceData(response.data.content);
                setFilteredData(response.data.content);
                setTotalPages(response.data.totalPages);
                setSelectedAttendances(new Array(response.data.content.length).fill(false));
            })
            .catch(error => console.error('근태 데이터 조회 에러:', error));
    };

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

        axios.put('/api/attendance/deleteAttendances', selectedIds)
            .then(() => {
                fetchAttendances(page, currentView);
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

    //정렬 기능 기본 오름차순
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');


const sortData = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);

    const sortedData = [...filteredData].sort((a, b) => {
        let valueA, valueB;

        switch (field) {
            case 'employeeName':
                valueA = a.employee ? a.employee.employeeName.toLowerCase() : '';
                valueB = b.employee ? b.employee.employeeName.toLowerCase() : '';
                break;
            case 'workDate':
                valueA = a.attendanceDate ? new Date(a.attendanceDate) : null;
                valueB = b.attendanceDate ? new Date(b.attendanceDate) : null;
                break;
            case 'startTime':
                valueA = a.checkInTime ? new Date(a.checkInTime) : null;
                valueB = b.checkInTime ? new Date(b.checkInTime) : null;
                break;
            case 'endTime':
                valueA = a.checkOutTime ? new Date(a.checkOutTime) : null;
                valueB = b.checkOutTime ? new Date(b.checkOutTime) : null;
                break;
            case 'workHours':
                valueA = parseFloat(calculateWorkingHours(a.checkInTime, a.checkOutTime));
                valueB = parseFloat(calculateWorkingHours(b.checkInTime, b.checkOutTime));
                break;
            case 'overtimeHours':
                valueA = parseFloat(calculateOvertime(calculateWorkingHours(a.checkInTime, a.checkOutTime)));
                valueB = parseFloat(calculateOvertime(calculateWorkingHours(b.checkInTime, b.checkOutTime)));
                break;
            case 'workStatus':
                valueA = a.attendanceStatus || '';
                valueB = b.attendanceStatus || '';
                break;
            case 'approvalStatus':
                valueA = a.approvalStatus || '';
                valueB = b.approvalStatus || '';
                break;
            case 'deleteDate':
                valueA = a.attendanceDeleteDate ? new Date(a.attendanceDeleteDate) : null;
                valueB = b.attendanceDeleteDate ? new Date(b.attendanceDeleteDate) : null;
                break;
            default:
                valueA = a[field] !== undefined && a[field] !== null ? a[field] : '';
                valueB = b[field] !== undefined && b[field] !== null ? b[field] : '';
        }

        // null 또는 빈 값 처리
        if (valueA === null || valueA === '') return order === 'asc' ? 1 : -1;
        if (valueB === null || valueB === '') return order === 'asc' ? -1 : 1;

        // 비교 로직
        if (valueA < valueB) return order === 'asc' ? -1 : 1;
        if (valueA > valueB) return order === 'asc' ? 1 : -1;
        return 0;
    });

    setFilteredData(sortedData);
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
                            {/* 검색 입력 영역 */}
                            <div className={`search_box ${searchAttendance ? 'has_text' : ''}`}>
                                {/* 이름 입력 라벨과 검색창 */}
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
                            {/* 라디오 박스를 검색창과 동일한 'left' 안에 위치 */}
                            <div className="radio_box left">
                                <span>상태</span>
                                <input
                                    type="radio"
                                    id="all"
                                    name="filterType"
                                    value="allAttendances"
                                    checked={currentView === 'allAttendances'}
                                    onChange={() => handleFilterChange('allAttendances')}
                                />
                                <label htmlFor="all">전체</label>
                                <input
                                    type="radio"
                                    id="active"
                                    name="filterType"
                                    value="activeAttendances"
                                    checked={currentView === 'activeAttendances'}
                                    onChange={() => handleFilterChange('activeAttendances')}
                                />
                                <label htmlFor="active">정상</label>
                                <input
                                    type="radio"
                                    id="deleted"
                                    name="filterType"
                                    value="deletedAttendances"
                                    checked={currentView === 'deletedAttendances'}
                                    onChange={() => handleFilterChange('deletedAttendances')}
                                />
                                <label htmlFor="deleted">삭제</label>
                            </div>
                        </div>
                        <div className="attendance right form-group">
                            <label className="att">근태조회일</label>
                            <input
                                type="date"
                                id="selectedDate"
                                className="date_input date box"
                                value={selectedDate}
                                onChange={handleDateChange}
                                max={new Date().toISOString().split('T')[0]}
                            />
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
                                    <th>
                                        <div className={`order_wrap ${sortField === 'employeeName' ? 'active' : ''}`}>
                                            <span>직원명</span>
                                            <button className="btn_order" onClick={() => sortData('employeeName')}>
                                                <i className={`bi ${sortField === 'employeeName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'workDate' ? 'active' : ''}`}>
                                            <span>근무일자</span>
                                            <button className="btn_order" onClick={() => sortData('workDate')}>
                                                <i className={`bi ${sortField === 'workDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'startTime' ? 'active' : ''}`}>
                                            <span>출근 시간</span>
                                            <button className="btn_order" onClick={() => sortData('startTime')}>
                                                <i className={`bi ${sortField === 'startTime' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'endTime' ? 'active' : ''}`}>
                                            <span>퇴근 시간</span>
                                            <button className="btn_order" onClick={() => sortData('endTime')}>
                                                <i className={`bi ${sortField === 'endTime' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'workHours' ? 'active' : ''}`}>
                                            <span>근무 시간</span>
                                            <button className="btn_order" onClick={() => sortData('workHours')}>
                                                <i className={`bi ${sortField === 'workHours' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'overtimeHours' ? 'active' : ''}`}>
                                            <span>초과 근무</span>
                                            <button className="btn_order" onClick={() => sortData('overtimeHours')}>
                                                <i className={`bi ${sortField === 'overtimeHours' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'workStatus' ? 'active' : ''}`}>
                                            <span>근무 상태</span>
                                            <button className="btn_order" onClick={() => sortData('workStatus')}>
                                                <i className={`bi ${sortField === 'workStatus' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'approvalStatus' ? 'active' : ''}`}>
                                            <span>승인 상태</span>
                                            <button className="btn_order" onClick={() => sortData('approvalStatus')}>
                                                <i className={`bi ${sortField === 'approvalStatus' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'deleteDate' ? 'active' : ''}`}>
                                            <span>삭제 일시</span>
                                            <button className="btn_order" onClick={() => sortData('deleteDate')}>
                                                <i className={`bi ${sortField === 'deleteDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>비고</th> {/* 정렬 필요 없음 */}
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
                                        const workDate = selectedDate ? format(new Date(selectedDate), 'MM-dd') : '-';
                                        const checkInTimeFormatted = attendance.checkInTime ? format(new Date(attendance.checkInTime), 'HH:mm') : '-';
                                        const checkOutTimeFormatted = attendance.checkOutTime ? format(new Date(attendance.checkOutTime), 'HH:mm') : '-';
                                        const deleteDateFormatted = attendance.attendanceDeleteDate ? format(new Date(attendance.attendanceDeleteDate), 'yyyy-MM-dd') : '-';

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
                                                <td>{workDate}</td>
                                                <td>{checkInTimeFormatted}</td>
                                                <td>{checkOutTimeFormatted}</td>
                                                <td>{totalHours} 시간</td>
                                                <td>{overtimeHours} 시간</td>
                                                <td>{attendance.attendanceStatus}</td>
                                                <td>{attendance.approvalStatus}</td>
                                                <td>{deleteDateFormatted}</td>
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
