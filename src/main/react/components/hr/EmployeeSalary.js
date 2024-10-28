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
    const [selectedSalaries, setSelectedSalaries] = useState([]);
    const [searchSalary, setSearchSalary] = useState('');
    const debouncedSearchSalary = useDebounce(searchSalary, 300);

    useEffect(() => {
        const mockData = [
            {
                salaryId: 1,
                employee: { employeeName: "홍길동" },
                department: { departmentName: "인사부" },
                job: { jobName: "대리", gradeIncentiveRate: 5.00 },
                baseSalary: 4000000,
                performanceIncentiveRate: 10.00,
                bonus: 300000,
                totalPayment: 4500000,
            },
            {
                salaryId: 2,
                employee: { employeeName: "김철수" },
                department: { departmentName: "영업부" },
                job: { jobName: "직원", gradeIncentiveRate: 5.00 },
                baseSalary: 4000000,
                performanceIncentiveRate: 10.00,
                bonus: 300000,
                totalPayment: 5000000,
            }
        ];

        setSalaryData(mockData);
        setFilteredData(mockData);
        setTotalPages(Math.ceil(mockData.length / ITEMS_PER_PAGE));
        setSelectedSalaries(new Array(mockData.length).fill(false));
    }, []);

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

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedSalaries(new Array(filteredData.length).fill(newSelectAll));
    };

    const handleSelect = (index) => {
        const updatedSelection = [...selectedSalaries];
        updatedSelection[index] = !updatedSelection[index];
        setSelectedSalaries(updatedSelection);

        if (updatedSelection.includes(false)) {
            setSelectAll(false);
        } else {
            setSelectAll(true);
        }
    };

    const handleDeleteSelected = () => {
        const selectedIds = salaryData
            .filter((_, index) => selectedSalaries[index])
            .map(salary => salary.salaryId);

        if (selectedIds.length === 0) {
            alert("삭제할 항목을 선택해주세요.");
            return;
        }

        const updatedData = salaryData.filter(salary => !selectedIds.includes(salary.salaryId));
        setSalaryData(updatedData);
        setSelectedSalaries(new Array(updatedData.length).fill(false));
    };

    const PageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
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
                                    <th>부서</th>
                                    <th>직급</th>
                                    <th>기본급</th>
                                    <th>실적인센티브</th>
                                    <th>직급인센티브</th>
                                    <th>보너스</th>
                                    <th>예상 총 지급액</th>
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
                                    filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((salary, index) => (
                                        <tr key={salary.salaryId}>
                                            <td>
                                                <label className="chkbox_label">
                                                    <input
                                                        type="checkbox"
                                                        className="chkbox"
                                                        checked={selectedSalaries[index] || false}
                                                        onChange={() => handleSelect(index)}
                                                    />
                                                    <i className="chkbox_icon">
                                                        <i className="bi bi-check-lg"></i>
                                                    </i>
                                                </label>
                                            </td>
                                            <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                            <td>{salary.employee.employeeName}</td>
                                            <td>{salary.department.departmentName}</td>
                                            <td>{salary.job.jobName}</td>
                                            <td>{salary.baseSalary.toLocaleString()}원</td>
                                            <td>{salary.performanceIncentiveRate.toLocaleString()}%</td>
                                            <td>{salary.job.gradeIncentiveRate.toLocaleString()}%</td>
                                            <td>{salary.bonus.toLocaleString()}원</td>
                                            <td>{salary.totalPayment.toLocaleString()}원</td>
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
