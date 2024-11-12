// 필요한 라이브러리 임포트
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/common/Main.css';
import Layout from "../../layout/Layout";
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/hr/EmployeeList.css';
import axios from 'axios';
import { format } from 'date-fns';
import { useDebounce } from '../common/useDebounce';

function EmployeeList() {
    // 로딩 상태 관리
    const [loading, setLoading] = useState(false);

    // 직원 목록 및 페이지 정보
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [currentView, setCurrentView] = useState('employeesN');

    // 검색 상태 관리
    const [searchEmployee, setSearchEmployee] = useState('');
    const debouncedSearchEmployee = useDebounce(searchEmployee, 300);

    // 선택된 직원 정보 및 모달 상태
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModifyModal, setShowModifyModal] = useState(false);
    const [showInsertModal, setShowInsertModal] = useState(false);

    // 신규 직원 정보
    const [newEmployee, setNewEmployee] = useState({
        employeeId: '',
        employeePw: '',
        employeeName: '',
        employeeEmail: '',
        employeeTel: '',
        employeeRole: ''
    });

    // 로그인한 사용자 정보를 저장할 상태 추가
    const [loggedInUser, setLoggedInUser] = useState(null);

    // 로그인한 사용자 정보를 가져오는 useEffect 추가
    useEffect(() => {
        const fetchLoggedInUser = async () => {
            try {
                const response = await axios.get('/api/employee', {
                    withCredentials: true
                });

                if (response.status === 200) {
                    setLoggedInUser(response.data);
                } else {
                    console.error('로그인한 사용자 정보를 가져오는데 실패했습니다.');
                }
            } catch (error) {
                console.error('로그인한 사용자 정보를 가져오는 중 오류 발생:', error);
            }
        };
        fetchLoggedInUser();
    }, []);

    // 초기 화면에 재직자만 표시
    useEffect(() => {
        pageEmployees(1, 'employeesN');
    }, []);

    const departmentOptions = [
        { departmentId: 1, departmentName: '본부' },
        { departmentId: 2, departmentName: 'IT부' },
        { departmentId: 3, departmentName: '영업부' },
        { departmentId: 4, departmentName: '인사부' },
        { departmentId: 5, departmentName: '재고 관리부' },
        { departmentId: 6, departmentName: '경영 지원부' },
        { departmentId: 7, departmentName: '전략 기획부' },
        { departmentId: 8, departmentName: '수출입 관리부' },
        { departmentId: 9, departmentName: '마케팅부' },
        { departmentId: 10, departmentName: 'R&D부' }
    ];

    const jobOptions = [
        { jobId: 1, jobName: '대표이사' },
        { jobId: 2, jobName: '임원' },
        { jobId: 3, jobName: '부장' },
        { jobId: 4, jobName: '팀장' },
        { jobId: 5, jobName: '대리' },
        { jobId: 6, jobName: '계장' },
        { jobId: 7, jobName: '사원' }
    ];

    // 검색어 변경 시 직원 목록 필터링
    useEffect(() => {
        if (debouncedSearchEmployee === '') {
            setFilteredEmployees(employees);
        } else {
            const filtered = employees.filter(employee =>
                employee.employeeName.includes(debouncedSearchEmployee)
            );
            setFilteredEmployees(filtered);
        }
    }, [debouncedSearchEmployee, employees]);

    // 직원 조회 함수 통합
    const pageEmployees = (page, type) => {
        setLoading(true);
        let url = '';
        if (type === 'employeesN') {
            url = `/api/employeeList?page=${page}&size=20`;
        } else if (type === 'employeesY') {
            url = `/api/employeeListY?page=${page}&size=20`;
        } else if (type === 'allEmployees') {
            url = `/api/allEmployees?page=${page}&size=20`;
        }

        axios.get(url)
            .then(response => {
                const sortedData = response.data.content.sort((a, b) => {
                    if (a.employeeId < b.employeeId) return -1;
                    if (a.employeeId > b.employeeId) return 1;
                    return 0;
                });
                setEmployees(sortedData);
                setTotalPages(response.data.totalPages);
                setSelectedEmployees(new Array(sortedData.length).fill(false));
            })
            .catch(error => {
                console.error(`${type} 목록 조회 에러:`, error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // 기존 함수명 유지하면서 새로운 함수 호출
    const pageEmployeesN = (page) => pageEmployees(page, 'employeesN');
    const pageEmployeesY = (page) => pageEmployees(page, 'employeesY');
    const pageAllEmployees = (page) => pageEmployees(page, 'allEmployees');

    // 전체 선택 체크박스 핸들러
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedEmployees(new Array(employees.length).fill(newSelectAll));
    };

    // 개별 선택 체크박스 핸들러
    const handleSelect = (index) => {
        const updatedSelection = [...selectedEmployees];
        updatedSelection[index] = !updatedSelection[index];
        setSelectedEmployees(updatedSelection);

        if (updatedSelection.includes(false)) {
            setSelectAll(false);
        } else {
            setSelectAll(true);
        }
    };

    // 페이지 변경 핸들러
    const PageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            pageEmployees(newPage, currentView);
        }
    };

    // 체크된 직원 삭제 (논리적 삭제)
    const checkedDelete = () => {
        const selectedId = employees
            .filter((_, index) => selectedEmployees[index])
            .map(employee => employee.employeeId);

        if (selectedId.length === 0) {
            window.showToast("삭제할 직원을 선택해주세요.", 'error');
            return;
        }

        window.confirmCustom('선택한 직원을 삭제하시겠습니까?').then(result => {
            if (result) {
                axios.post('/api/deleteEmployees', selectedId)
                    .then(() => {
                        window.showToast("삭제가 완료되었습니다.");
                        pageEmployees(1, currentView);
                    })
                    .catch(error => {
                        console.error('삭제 중 에러 발생:', error);
                    });
            }
        });
    };

    //정렬기능(기본 오름차순)
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const sortData = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sortedData = [...employees].sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });

        setEmployees(sortedData);
    };


    // 정보 수정 모달 열기
    const openModifyModal = (employee) => {
        setSelectedEmployee(employee);
        setShowModifyModal(true);
    };

    // 정보 수정 모달 닫기
    const closeModifyModal = () => {
        setShowModifyModal(false);
        setSelectedEmployee(null);
    };

    // 수정 모달 배경 클릭 시 닫기
    const handleModifyBackgroundClick = (e) => {
        if (e.target.className === 'modal_overlay') {
            closeModifyModal();
        }
    };

    // 수정된 직원 정보 저장 및 서버로 전송
    const handleModifySubmit = () => {

        if (!selectedEmployee.departmentId) {
            window.showToast('부서를 선택해주세요.', 'error');
            return;
        }

        if (!selectedEmployee.jobId) {
            window.showToast('직급을 선택해주세요.', 'error');
            return;
        }

        if (!validateEmployeeData(selectedEmployee)) return;

        const employeeData = {
            employeeId: selectedEmployee.employeeId,
            employeePw: selectedEmployee.employeePw,
            employeeName: selectedEmployee.employeeName,
            employeeEmail: selectedEmployee.employeeEmail,
            employeeTel: selectedEmployee.employeeTel,
            departmentId: selectedEmployee.departmentId,
            jobId: selectedEmployee.jobId
        };

        axios.put(`/api/updateEmployee/${selectedEmployee.employeeId}`, employeeData)
            .then(() => {
                window.showToast("직원 정보가 성공적으로 수정되었습니다.");
                closeModifyModal();
                pageEmployees(page, currentView);
            })
            .catch(error => {
                console.error('수정 중 에러 발생:', error);
                window.showToast('직원 정보 수정 중 에러가 발생했습니다.', 'error');
            });
    };


    // 선택된 직원의 정보 수정
    const handleEmployeeChange = (field, value) => {
        setSelectedEmployee(prevEmployee => ({
            ...prevEmployee,
            [field]: value
        }));
    };

    // 수정 모달에서 삭제 (논리적 삭제)
    const handleDelete = () => {
        window.confirmCustom("정말 삭제하시겠습니까?").then(result => {
            if (result && selectedEmployee) {
                axios.put(`/api/deleteEmployee/${selectedEmployee.employeeId}`)
                    .then(() => {
                        window.showToast('직원이 삭제되었습니다.');
                        closeModifyModal();
                        pageEmployees(1, currentView);
                    })
                    .catch(error => {
                        console.error('삭제 중 에러 발생:', error);
                        window.showToast('직원 삭제 중 에러가 발생했습니다.', 'error');
                    });
            }
        });
    };

    // 등록 모달 열기
    const openInsertModal = () => {
        setNewEmployee({
            employeeId: '',
            employeePw: '',
            employeeName: '',
            employeeEmail: '',
            employeeTel: '',
            employeeRole: '',
            departmentId: '',
            jobId: ''
        });
        setShowInsertModal(true);
    };

    // 등록 모달 닫기
    const closeInsertModal = () => {
        setShowInsertModal(false);
    };

    // 등록 모달 배경 클릭 시 닫기
    const handleInsertBackgroundClick = (e) => {
        if (e.target.className === 'modal_overlay') {
            closeInsertModal();
        }
    };

    // 직원 등록
    const InsertSubmit = () => {
        if (newEmployee.departmentId === '') {
            window.showToast('부서를 선택해주세요.', 'error');
            return;
        }

        if (newEmployee.jobId === '') {
            window.showToast('직급을 선택해주세요.', 'error');
            return;
        }

        if (!validateEmployeeData(newEmployee)) {
            return;
        }

        axios.get('/api/checkEmployeeId', { params: { employeeId: newEmployee.employeeId } })
            .then(response => {
                if (response.data) {
                    window.showToast('이미 존재하는 아이디입니다.', 'error');
                } else {
                    const employeeData = {
                        employeeId: newEmployee.employeeId,
                        employeePw: newEmployee.employeePw,
                        employeeName: newEmployee.employeeName,
                        employeeEmail: newEmployee.employeeEmail,
                        employeeTel: newEmployee.employeeTel,
                        departmentId: newEmployee.departmentId,
                        jobId: newEmployee.jobId
                    };

                    axios.post('/api/registerEmployee', employeeData)
                        .then(() => {
                            window.showToast('직원 등록이 완료되었습니다.');
                            closeInsertModal();
                            setNewEmployee({
                                employeeId: '',
                                employeePw: '',
                                employeeName: '',
                                employeeEmail: '',
                                employeeTel: '',
                                departmentId: '',
                                jobId: ''
                            });
                            pageEmployees(1, currentView);
                        })
                        .catch(error => {
                            console.error('발생한 에러 : ', error);
                            window.showToast('직원 등록 중 에러발생', 'error');
                        });
                }
            })
            .catch(error => {
                console.error('ID 중복 체크 중 에러 발생:', error);
                window.showToast('ID 중복 체크 중 에러가 발생했습니다.', 'error');
            });
    };


    // 유효성 검사
    const validateEmployeeData = (employeeData) => {
        const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!phoneRegex.test(employeeData.employeeTel)) {
            window.showToast('연락처는 000-0000-0000 형식으로 입력해주세요.', 'error');
            return false;
        }

        if (!emailRegex.test(employeeData.employeeEmail)) {
            window.showToast('유효한 이메일 형식으로 입력해주세요.', 'error');
            return false;
        }

        return true;
    };

    // 검색어 삭제 버튼 핸들러
    const handleSearchDel = (setSearch) => {
        setSearch('');
    };

    // 렌더링
    return (
        <Layout currentMenu="employee">
            <main className="main-content menu_employee">
                <div className="menu_title">
                    <div className="sub_title">인사 관리</div>
                    <div className="main_title">직원 목록</div>
                </div>
                <div className="menu_content">
                    {/* 검색 및 필터 영역 */}
                    <div className="search_wrap">
                        <div className="left">
                            <div className={`search_box ${searchEmployee ? 'has_text' : ''}`}>
                                <label className={`label_floating ${searchEmployee ? 'active' : ''}`}>이름 입력</label>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="box search"
                                    value={searchEmployee}
                                    onChange={(e) => setSearchEmployee(e.target.value)}
                                />
                                {searchEmployee && (
                                    <button
                                        className="btn-del"
                                        onClick={() => handleSearchDel(setSearchEmployee)}
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                            <div className="radio_box left">
                                <span>상태</span>
                                <input
                                    type="radio"
                                    id="all"
                                    name="filterType"
                                    value="allEmployees"
                                    checked={currentView === 'allEmployees'}
                                    onChange={() => { setCurrentView('allEmployees'); setPage(1); pageAllEmployees(1); }}
                                />
                                <label htmlFor="all">전체</label>
                                <input
                                    type="radio"
                                    id="active"
                                    name="filterType"
                                    value="employeesN"
                                    checked={currentView === 'employeesN'}
                                    onChange={() => { setCurrentView('employeesN'); setPage(1); pageEmployeesN(1); }}
                                />
                                <label htmlFor="active">정상</label>
                                <input
                                    type="radio"
                                    id="deleted"
                                    name="filterType"
                                    value="employeesY"
                                    checked={currentView === 'employeesY'}
                                    onChange={() => { setCurrentView('employeesY'); setPage(1); pageEmployeesY(1); }}
                                />
                                <label htmlFor="deleted">삭제</label>
                            </div>
                        </div>
                        <div className="right">
                            <button className="box color" onClick={openInsertModal}><i className="bi bi-plus-circle"></i> 등록하기</button>
                        </div>
                    </div>
                    {/* 테이블 영역 */}
                    <div className="table_wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>
                                        <label className="chkbox_label">
                                            <input
                                                type="checkbox"
                                                className="chkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
                                            <i className="chkbox_icon">
                                                <i className="bi bi-check-lg"></i>
                                            </i>
                                        </label>
                                    </th>
                                    {/*<th>번호</th>*/}
                                    <th>
                                        <div className={`order_wrap ${sortField === 'employeeId' ? 'active' : ''}`}>
                                            <span>아이디</span>
                                            <button className="btn_order" onClick={() => sortData('employeeId')}>
                                                <i className={`bi ${sortField === 'employeeId' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'employeeName' ? 'active' : ''}`}>
                                            <span>이름</span>
                                            <button className="btn_order" onClick={() => sortData('employeeName')}>
                                                <i className={`bi ${sortField === 'employeeName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th onClick={() => sortData('employeeTel')}>연락처</th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'jobId' ? 'active' : ''}`}>
                                            <span>직급</span>
                                            <button className="btn_order" onClick={() => sortData('jobId')}>
                                                <i className={`bi ${sortField === 'jobId' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'departmentName' ? 'active' : ''}`}>
                                            <span>부서</span>
                                            <button className="btn_order" onClick={() => sortData('departmentName')}>
                                                <i className={`bi ${sortField === 'departmentName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'employeeInsertDate' ? 'active' : ''}`}>
                                            <span>등록일시</span>
                                            <button className="btn_order" onClick={() => sortData('employeeInsertDate')}>
                                                <i className={`bi ${sortField === 'employeeInsertDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'employeeUpdateDate' ? 'active' : ''}`}>
                                            <span>수정일시</span>
                                            <button className="btn_order" onClick={() => sortData('employeeUpdateDate')}>
                                                <i className={`bi ${sortField === 'employeeUpdateDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'employeeDeleteDate' ? 'active' : ''}`}>
                                            <span>삭제일시</span>
                                            <button className="btn_order" onClick={() => sortData('employeeDeleteDate')}>
                                                <i className={`bi ${sortField === 'employeeDeleteDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    {/* 수정/삭제 버튼 */}
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr className="tr_empty">
                                        <td colSpan="10">
                                            <div className="loading">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (searchEmployee ? filteredEmployees : employees).length === 0 ? (
                                    <tr className="tr_empty">
                                        <td colSpan="10">
                                            <div className="no_data">
                                                <i className="bi bi-exclamation-triangle"></i>
                                                조회된 결과가 없습니다.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    (searchEmployee ? filteredEmployees : employees).map((employee, index) => (
                                        <tr key={employee.employeeId}
                                            className={selectedEmployees[index] ? 'selected_row' : ''}
                                        >
                                            <td>
                                                {employee.employeeDeleteYn === 'Y' && <span className="label_del">삭제</span>}
                                                {employee.employeeDeleteYn !== 'Y' && employee.employeeId === 'admin' && (
                                                    <i className="bi bi-pin-angle-fill"></i>
                                                )}
                                                {employee.employeeDeleteYn !== 'Y' && employee.employeeId !== 'admin' && (
                                                    <label className="chkbox_label">
                                                        <input
                                                            type="checkbox"
                                                            className="chkbox"
                                                            checked={selectedEmployees[index] || false}
                                                            onChange={() => handleSelect(index)}
                                                        />
                                                        <i className="chkbox_icon">
                                                            <i className="bi bi-check-lg"></i>
                                                        </i>
                                                    </label>
                                                )}
                                            </td>
                                            {/*<td>{(page - 1) * 20 + index + 1}</td>*/}
                                            <td>{employee.employeeId}</td>
                                            <td>{employee.employeeName}</td>
                                            <td>{employee.employeeTel}</td>
                                            <td>{employee.jobName}</td>
                                            <td>{employee.departmentName}</td>
                                            <td>{employee.employeeInsertDate ? format(new Date(employee.employeeInsertDate), 'yyyy-MM-dd HH:mm') : '-'}</td>
                                            <td>{employee.employeeUpdateDate ? format(new Date(employee.employeeUpdateDate), 'yyyy-MM-dd HH:mm') : '-'}</td>
                                            <td>{employee.employeeDeleteDate ? format(new Date(employee.employeeDeleteDate), 'yyyy-MM-dd HH:mm') : '-'}</td>
                                            <td>
                                                {loggedInUser && loggedInUser.jobId >= 1 && loggedInUser.jobId <= 4 ? (
                                                    employee.employeeDeleteYn !== 'Y' ? (
                                                        <div className="btn_group">
                                                            <button
                                                                className="box small"
                                                                onClick={() => openModifyModal(employee)}
                                                            >
                                                                수정하기
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="btn_group">
                                                            <button
                                                                className="box small disabled"
                                                                disabled
                                                            >
                                                                수정하기
                                                            </button>
                                                        </div>
                                                    )
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* 페이지네이션 영역 */}
                    <div className="pagination-container">
                        <div className="pagination-sub left">
                            <button className="box" onClick={checkedDelete}><i className="bi bi-trash3"></i>선택 삭제</button>
                        </div>

                        {/* 페이지네이션 */}
                        <div className="pagination">
                            {page > 1 && (
                                <>
                                    <button className="box icon first" onClick={() => PageChange(1)}>
                                        <i className="bi bi-chevron-double-left"></i>
                                    </button>
                                    <button className="box icon left" onClick={() => PageChange(page - 1)}>
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                </>
                            )}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                const startPage = Math.floor((page - 1) / 5) * 5 + 1;
                                const currentPage = startPage + index;
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
                                <>
                                    <button className="box icon right" onClick={() => PageChange(page + 1)}>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                    <button className="box icon last" onClick={() => PageChange(totalPages)}>
                                        <i className="bi bi-chevron-double-right"></i>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="pagination-sub right"></div>
                    </div>
                </div>
            </main>

            {/* 수정 모달 */}
            {showModifyModal && (
                <div className="modal_overlay" onMouseDown={handleModifyBackgroundClick}>
                    <div className='modal_container edit'>
                        <div className="header">
                            <div>직원 정보 수정</div>
                            <button className="btn_close" onClick={closeModifyModal}><i className="bi bi-x-lg"></i></button>
                        </div>
                        <div className="edit_wrap">
                            <div className='edit_form'>
                                <div className='field_wrap'>
                                    <label>아이디</label>
                                    <input
                                        type='text'
                                        className='box disabled'
                                        value={selectedEmployee.employeeId}
                                        disabled
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>비밀번호</label>
                                    <input
                                        type='password'
                                        className='box'
                                        placeholder='비밀번호를 입력해주세요'
                                        value={selectedEmployee.employeePw}
                                        onChange={(e) => handleEmployeeChange('employeePw', e.target.value)}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>이름</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='이름을 입력해주세요'
                                        value={selectedEmployee.employeeName}
                                        onChange={(e) => handleEmployeeChange('employeeName', e.target.value)}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>이메일</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='이메일을 입력해주세요'
                                        value={selectedEmployee.employeeEmail}
                                        onChange={(e) => handleEmployeeChange('employeeEmail', e.target.value)}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>연락처</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='연락처를 입력해주세요'
                                        value={selectedEmployee.employeeTel}
                                        onChange={(e) => handleEmployeeChange('employeeTel', e.target.value)}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>부서</label>
                                    <select
                                        className='box'
                                        value={selectedEmployee.departmentId || ''}
                                        onChange={(e) => handleEmployeeChange('departmentId', e.target.value)}
                                    >
                                        <option value="">부서를 선택해주세요</option>
                                        {departmentOptions.map(department => (
                                            <option key={department.departmentId} value={department.departmentId}>
                                                {department.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 직급 선택 필드 */}
                                <div className='field_wrap'>
                                    <label>직급</label>
                                    <select
                                        className='box'
                                        value={selectedEmployee.jobId || ''}
                                        onChange={(e) => handleEmployeeChange('jobId', e.target.value)}
                                    >
                                        <option value="">직급을 선택해주세요</option>
                                        {jobOptions.map(job => (
                                            <option key={job.jobId} value={job.jobId}>
                                                {job.jobName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="box blue" onClick={handleModifySubmit}>수정</button>
                                <button className="box red" onClick={handleDelete}>삭제</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 등록 모달 */}
            {showInsertModal && (
                <div className="modal_overlay" onMouseDown={handleInsertBackgroundClick}>
                    <div className='modal_container edit'>
                        <div className="header">
                            <div>직원 정보 등록</div>
                            <button className="btn_close" onClick={closeInsertModal}><i className="bi bi-x-lg"></i></button>
                        </div>
                        <div className="edit_wrap">
                            <div className='edit_form'>
                                <div className='field_wrap'>
                                    <label>아이디</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='아이디를 입력해주세요'
                                        value={newEmployee.employeeId}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>비밀번호</label>
                                    <input
                                        type='password'
                                        className='box'
                                        placeholder='비밀번호를 입력해주세요'
                                        value={newEmployee.employeePw}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeePw: e.target.value })}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>이름</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='이름을 입력해주세요'
                                        value={newEmployee.employeeName}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeName: e.target.value })}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>이메일</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='이메일을 입력해주세요'
                                        value={newEmployee.employeeEmail}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeEmail: e.target.value })}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>연락처</label>
                                    <input
                                        type='text'
                                        className='box'
                                        placeholder='연락처를 입력해주세요'
                                        value={newEmployee.employeeTel}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeTel: e.target.value })}
                                    />
                                </div>
                                <div className='field_wrap'>
                                    <label>부서</label>
                                    <select
                                        className='box'
                                        value={newEmployee.departmentId}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, departmentId: e.target.value })}
                                    >
                                        <option value="">부서를 선택해주세요</option>
                                        {departmentOptions.map(department => (
                                            <option key={department.departmentId} value={department.departmentId}>
                                                {department.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 직급 선택 필드 */}
                                <div className='field_wrap'>
                                    <label>직급</label>
                                    <select
                                        className='box'
                                        value={newEmployee.jobId}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, jobId: e.target.value })}
                                    >
                                        <option value="">직급을 선택해주세요</option>
                                        {jobOptions.map(job => (
                                            <option key={job.jobId} value={job.jobId}>
                                                {job.jobName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button className="box blue" onClick={InsertSubmit}>등록</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

// 페이지 root가 되는 JS는 root에 삽입되도록 처리
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <EmployeeList />
    </BrowserRouter>
);
