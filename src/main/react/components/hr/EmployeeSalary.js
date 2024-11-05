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
                salary.employee.employeeName.toLowerCase().includes(debouncedSearchSalary.toLowerCase())
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
                                    <th>직원명</th>
                                    <th>부서</th>
                                    <th>직급</th>
                                    <th>기본급</th>
                                    <th>실적인센티브</th>
                                    <th>직급인센티브</th>
                                    <th>보너스</th>
                                    <th>예상 총 지급액</th>
                                    <th>삭제 일시</th>
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
                                    filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((salary) => (
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
                                            <td>{salary.employee.employeeName}</td>
                                            <td>{salary.department.departmentName}</td>
                                            <td>{salary.job.jobName}</td>
                                            <td>{salary.baseSalary.toLocaleString()}원</td>
                                            <td>{salary.performanceIncentiveRate.toLocaleString()}%</td>
                                            <td>{salary.gradeIncentiveRate.toLocaleString()}%</td>
                                            <td>{salary.bonus.toLocaleString()}원</td>
                                            <td>
                                                {(
                                                    salary.baseSalary +
                                                    salary.baseSalary * (salary.performanceIncentiveRate / 100) +
                                                    salary.baseSalary * (salary.gradeIncentiveRate / 100) +
                                                    salary.bonus
                                                ).toLocaleString()}원
                                            </td>
                                            <td>{salary.deleteDate ? formatDate(salary.deleteDate) : ''}</td>
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
        <EmployeeSalary />
    </BrowserRouter>
);
