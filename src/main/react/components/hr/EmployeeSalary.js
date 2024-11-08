import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/common/Main.css';
import Layout from "../../layout/Layout";
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/hr/EmployeeSalary.css'; // 급여 관리 전용 CSS
import { useDebounce } from '../common/useDebounce';

const ITEMS_PER_PAGE = 20;

function EmployeeSalary() {
    const [salaryData, setSalaryData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedSalaries, setSelectedSalaries] = useState(new Set());
    const [searchSalary, setSearchSalary] = useState('');
    const [currentView, setCurrentView] = useState('active'); // 초기값을 'active'로 설정하여 정상 데이터만 표시
    const debouncedSearchSalary = useDebounce(searchSalary, 300);

    useEffect(() => {
        fetchSalaries();
    }, [currentView]);

    const fetchSalaries = () => {
        fetch(`/api/salaries?filter=${currentView}`)  // currentView에 따라 필터링된 데이터를 서버에서 가져옴
            .then(response => {
                if (!response.ok) {
                    throw new Error('데이터를 가져오는 중 오류가 발생했습니다.');
                }
                return response.json();
            })
            .then(data => {
                setSalaryData(data);
                setFilteredData(Array.isArray(data) ? data : []); // 데이터가 배열인지 확인 후 설정
                setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
                setSelectedSalaries(new Set());
            })
            .catch(error => {
                console.error('급여 데이터를 가져오는 중 오류 발생:', error);
                setFilteredData([]); // 에러 발생 시 빈 배열로 초기화
            });
    };

    useEffect(() => {
        if (debouncedSearchSalary === '') {
            setFilteredData(salaryData);
        } else {
            const filtered = salaryData.filter(salary =>
                salary.employee && salary.employee.employeeName && salary.employee.employeeName.toLowerCase().includes(debouncedSearchSalary.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }, [debouncedSearchSalary, salaryData]);

    const handleFilterChange = (view) => {
        setCurrentView(view); // currentView 업데이트하여 데이터 재로드
        setPage(1); // 페이지를 첫 번째 페이지로 초기화
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedSalaries(newSelectAll ? new Set(filteredData.map(salary => salary.salaryId)) : new Set());
    };

    const handleSelect = (salaryId) => {
        const updatedSelection = new Set(selectedSalaries); // 복사본 생성
        if (updatedSelection.has(salaryId)) {
            updatedSelection.delete(salaryId);
        } else {
            updatedSelection.add(salaryId);
        }
        setSelectedSalaries(updatedSelection);
        setSelectAll(updatedSelection.size === filteredData.length);
    };

    const PageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleDeleteSelected = () => {
        const selectedIds = Array.from(selectedSalaries);
        if (selectedIds.length === 0) {
            alert("삭제할 항목을 선택해주세요.");
            return;
        }

        if (window.confirm("선택한 항목을 삭제하시겠습니까?")) {
            fetch('/api/salaries/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedIds),
            })
                .then(response => {
                    if (response.ok) {
                        fetchSalaries();
                        setSelectedSalaries(new Set());
                    } else {
                        console.error('급여 삭제 실패');
                    }
                })
                .catch(error => {
                    console.error('급여 삭제 중 오류 발생:', error);
                });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(2, 10); // "YY-MM-DD" 형식으로 날짜 반환
    };

    // 정렬 기능 기본 오름차순
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const sortData = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sortedData = [...filteredData].sort((a, b) => {
            let valueA, valueB;

            switch (field) {
                case 'employeeName': {
                    valueA = a.employee && a.employee.employeeName ? a.employee.employeeName.toLowerCase() : '';
                    valueB = b.employee && b.employee.employeeName ? b.employee.employeeName.toLowerCase() : '';
                    break;
                }
                case 'departmentName': {
                    valueA = a.department && a.department.departmentName ? a.department.departmentName.toLowerCase() : '';
                    valueB = b.department && b.department.departmentName ? b.department.departmentName.toLowerCase() : '';
                    break;
                }
                case 'jobName': {
                    valueA = a.job && a.job.jobName ? a.job.jobName.toLowerCase() : '';
                    valueB = b.job && b.job.jobName ? b.job.jobName.toLowerCase() : '';
                    break;
                }
                case 'baseSalary': {
                    valueA = a.baseSalary || 0;
                    valueB = b.baseSalary || 0;
                    break;
                }
                case 'performanceIncentive': {
                    valueA = a.performanceIncentiveRate ? parseFloat(a.performanceIncentiveRate) : 0;
                    valueB = b.performanceIncentiveRate ? parseFloat(b.performanceIncentiveRate) : 0;
                    break;
                }
                case 'gradeIncentive': {
                    valueA = a.gradeIncentiveRate ? parseFloat(a.gradeIncentiveRate) : 0;
                    valueB = b.gradeIncentiveRate ? parseFloat(b.gradeIncentiveRate) : 0;
                    break;
                }
                case 'bonus': {
                    valueA = a.bonus || 0;
                    valueB = b.bonus || 0;
                    break;
                }
                case 'expectedTotalPayment': {
                    valueA = a.totalPayment || 0;
                    valueB = b.totalPayment || 0;
                    break;
                }
                case 'deleteDate': {
                    valueA = a.deleteDate ? new Date(a.deleteDate) : null;
                    valueB = b.deleteDate ? new Date(b.deleteDate) : null;
                    break;
                }
                default: {
                    valueA = a[field] !== undefined && a[field] !== null ? a[field] : '';
                    valueB = b[field] !== undefined && b[field] !== null ? b[field] : '';
                    break;
                }
            }

            // null 또는 빈 값 처리
            if (valueA === null || valueA === '') return order === 'asc' ? 1 : -1;
            if (valueB === null || valueB === '') return order === 'asc' ? -1 : 1;

            // 숫자 비교
            if (typeof valueA === 'number' && typeof valueB === 'number') {
                return order === 'asc' ? valueA - valueB : valueB - valueA;
            }

            // 날짜 비교
            if (valueA instanceof Date && valueB instanceof Date) {
                return order === 'asc' ? valueA - valueB : valueB - valueA;
            }

            // 문자열 비교
            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredData(sortedData);
    };

    return (
        <Layout currentMenu="employeeSalary">
            <main className="main-content menu_employee">
                <div className="menu_title">
                    <div className="sub_title">인사 관리</div>
                    <div className="main_title">급여 관리</div>
                </div>

                <div className="menu_content">
                    <div className="search_wrap">
                        <div className="left">
                            <div className={`search_box ${searchSalary ? 'has_text' : ''}`}>
                                <label className={`label_floating ${searchSalary ? 'active' : ''}`}>이름 입력</label>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="box search"
                                    value={searchSalary}
                                    onChange={(e) => setSearchSalary(e.target.value)}
                                />
                                {searchSalary && (
                                    <button className="btn-del" onClick={() => setSearchSalary('')}>
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="radio_box">
                            <span>상태</span>
                            <input type="radio" id="all" name="filterType" value="all"
                                   checked={currentView === 'all'}
                                   onChange={() => handleFilterChange('all')} />
                            <label htmlFor="all">전체</label>
                            <input type="radio" id="active" name="filterType" value="active"
                                   checked={currentView === 'active'}
                                   onChange={() => handleFilterChange('active')} />
                            <label htmlFor="active">정상</label>
                            <input type="radio" id="deleted" name="filterType" value="deleted"
                                   checked={currentView === 'deleted'}
                                   onChange={() => handleFilterChange('deleted')} />
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
                                    <th>
                                        <div className={`order_wrap ${sortField === 'employeeName' ? 'active' : ''}`}>
                                            <span>직원명</span>
                                            <button className="btn_order" onClick={() => sortData('employeeName')}>
                                                <i className={`bi ${sortField === 'employeeName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
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
                                        <div className={`order_wrap ${sortField === 'jobName' ? 'active' : ''}`}>
                                            <span>직급</span>
                                            <button className="btn_order" onClick={() => sortData('jobName')}>
                                                <i className={`bi ${sortField === 'jobName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'baseSalary' ? 'active' : ''}`}>
                                            <span>기본급</span>
                                            <button className="btn_order" onClick={() => sortData('baseSalary')}>
                                                <i className={`bi ${sortField === 'baseSalary' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'performanceIncentive' ? 'active' : ''}`}>
                                            <span>실적인센티브</span>
                                            <button className="btn_order" onClick={() => sortData('performanceIncentive')}>
                                                <i className={`bi ${sortField === 'performanceIncentive' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'gradeIncentive' ? 'active' : ''}`}>
                                            <span>직급인센티브</span>
                                            <button className="btn_order" onClick={() => sortData('gradeIncentive')}>
                                                <i className={`bi ${sortField === 'gradeIncentive' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'bonus' ? 'active' : ''}`}>
                                            <span>보너스</span>
                                            <button className="btn_order" onClick={() => sortData('bonus')}>
                                                <i className={`bi ${sortField === 'bonus' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortField === 'expectedTotalPayment' ? 'active' : ''}`}>
                                            <span>예상 총 지급액</span>
                                            <button className="btn_order" onClick={() => sortData('expectedTotalPayment')}>
                                                <i className={`bi ${sortField === 'expectedTotalPayment' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
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
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr className="tr_empty">
                                        <td colSpan="10">
                                            <div className="no_data">
                                                <i className="bi bi-exclamation-triangle"></i>
                                                조회된 결과가 없습니다.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((salary) => {
                                        // 기본급: salary.baseSalary 사용
                                        const totalBaseSalary = salary.baseSalary || 0;

                                        // 보너스: salary.bonus 사용
                                        const bonus = salary.bonus || 0;

                                        // 실적 인센티브율
                                        const performanceIncentiveRate = salary.performanceIncentiveRate ? parseFloat(salary.performanceIncentiveRate) : 0;

                                        // 직급 인센티브율
                                        const gradeIncentiveRate = salary.gradeIncentiveRate ? parseFloat(salary.gradeIncentiveRate) : 0;

                                        // 예상 총 지급액 계산
                                        const expectedTotalPayment = totalBaseSalary +
                                            (totalBaseSalary * (performanceIncentiveRate / 100)) +
                                            (totalBaseSalary * (gradeIncentiveRate / 100)) +
                                            bonus;

                                        return (
                                            <tr key={salary.salaryId}>
                                                <td>
                                                    <label className="chkbox_label">
                                                        <input
                                                            type="checkbox"
                                                            className="chkbox"
                                                            checked={selectedSalaries.has(salary.salaryId)}
                                                            onChange={() => handleSelect(salary.salaryId)}
                                                        />
                                                        <i className="chkbox_icon">
                                                            <i className="bi bi-check-lg"></i>
                                                        </i>
                                                    </label>
                                                </td>
                                                <td>{salary.employee && salary.employee.employeeName ? salary.employee.employeeName : ''}</td>
                                                <td>{salary.department && salary.department.departmentName ? salary.department.departmentName : ''}</td>
                                                <td>{salary.job && salary.job.jobName ? salary.job.jobName : ''}</td>
                                                <td>{totalBaseSalary.toLocaleString()}원</td>
                                                <td>{performanceIncentiveRate.toLocaleString()}%</td>
                                                <td>{gradeIncentiveRate.toLocaleString()}%</td>
                                                <td>{bonus.toLocaleString()}원</td>
                                                <td>{expectedTotalPayment.toLocaleString()}원</td>
                                                <td>{salary.deleteDate ? formatDate(salary.deleteDate) : ''}</td>
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
        <EmployeeSalary />
    </BrowserRouter>
);
