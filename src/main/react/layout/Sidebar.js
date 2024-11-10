import React, { useState, useEffect } from 'react';
import '../../resources/static/css/common/Sidebar.css';
import { useLocation } from 'react-router-dom';
import axios from "axios";

function Sidebar({ currentMenu }) {
    const [activeSubMenu, setActiveSubMenu] = useState(() => {
        const path = window.location.pathname;
        return path.split('/').pop();
    });
    const [loginTime, setLoginTime] = useState('시간 정보 없음');
    const [employee, setEmployee] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const storedLoginTime = localStorage.getItem('loginTime');
        setLoginTime(storedLoginTime || '시간 정보 없음');
    }, []);



    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axios.get('/api/employee', {
                    withCredentials: true
                });

                if (response.status === 200) {
                    const data = response.data;
                    // console.log('직원 데이터:', data);console.log('직원 데이터:', data);
                    setEmployee(data);
                } else {
                    console.error('사용자 정보를 가져오는데 실패했습니다.');
                }
            } catch (error) {
                console.error('사용자 정보를 가져오는 중 오류 발생:', error);
            }
        };
        fetchEmployee();
    }, []);

    useEffect(() => {
        if (location.pathname === '/main') {
            setActiveSubMenu(null);
        }
    }, [location.pathname]);

    const handleMenuClick = (menu) => {
        setActiveSubMenu(null);
    };

    const handleSubMenuClick = (subMenu, path) => {
        setActiveSubMenu(subMenu);
        window.location.href = path;
    };

    const handleLogout = async () => {
        try {
            const response = await axios.post('/api/logout', {}, { withCredentials: true });
            if (response.status === 200) {
                console.log('로그아웃 성공:', response.data.message);
                // 필요하면 클라이언트 상태 초기화
                localStorage.clear();
                window.location.href = '/login'; // 로그아웃 후 로그인 페이지로 이동
            } else {
                console.error('로그아웃 실패:', response.data.message);
                // 오류 메시지 표시
                alert('로그아웃에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
            // 오류 메시지 표시
            alert('로그아웃 중 오류가 발생했습니다.');
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-top">
                <div className="user-info">
                    <div className="user-name">
                        {employee ? (
                            <>
                                {employee.jobName === 'Admin' ? '관리자' : ''} {employee.employeeName} ({employee.departmentName})
                            </>
                        ) : (
                            'LOADING'
                        )}
                    </div>
                    <div className="login-time">{loginTime}</div>
                    <button onClick={handleLogout} className="box small">로그아웃</button>
                </div>
            </div>
            <ul className={`menu ${currentMenu}`}>
                <li>
                    <span className={currentMenu.startsWith('order') ? 'active' : ''}>
                        <i className="bi bi-piggy-bank"></i>영업 관리
                    </span>
                    <ul className="submenu">
                        <li className={currentMenu === 'order' ? 'active' : ''}>
                            <a href="#" onClick={() => handleSubMenuClick('order', '/order')}>주문 등록</a>
                        </li>
                        <li className={currentMenu === 'orderList' ? 'active' : ''}>
                            <a href="#"
                                onClick={() => handleSubMenuClick('orderList', '/orderList')}>
                                주문 목록
                            </a>
                        </li>
                        <li className={currentMenu === 'orderReport' ? 'active' : ''}>
                            <a href="#" onClick={() => handleSubMenuClick('orderReport', '/orderReport')}>주문 현황 보고서</a>
                        </li>
                        <li className={currentMenu === 'orderDispatch' ? 'active' : ''}>
                            <a href="#" onClick={() => handleSubMenuClick('orderDispatch', '/orderDispatch')}>주문 출고</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <span className={currentMenu.startsWith('product') ? 'active' : ''}>
                        <i className="bi bi-cart-check"></i>상품 관리
                    </span>
                    <ul className="submenu">
                        <li className={currentMenu === 'productCategory' ? 'active' : ''}>
                            <a href="#" onClick={() => handleSubMenuClick('productCategory', '/productCategory')}>상품 카테고리</a>
                        </li>
                        <li className={currentMenu === 'productList' ? 'active' : ''}>
                            <a href="#" onClick={() => handleSubMenuClick('productList', '/productList')}>전체 상품 목록</a>
                        </li>
                        <li className={currentMenu === 'productPrice' ? 'active' : ''}>
                            <a href="#" onClick={() => handleSubMenuClick('productPrice', '/productPrice')}>고객사별 상품 가격</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <ul className="submenu one">
                        <li className={currentMenu === 'customer' ? 'active' : ''}>
                            <a href="#" onClick={() => handleSubMenuClick('customerList', '/customerList')}>
                                <i className="bi bi-people-fill"></i>고객 관리
                            </a>
                        </li>
                    </ul>
                </li>
                <li>
                    <span className={currentMenu.startsWith('employee') ? 'active' : ''}>
                        <i className="bi bi-cart-check"></i>인사 관리
                    </span>
                    <ul className="submenu">
                        <li className={currentMenu === 'employeeList' ? 'active' : ''}>
                            <a href="#" onClick={() => handleSubMenuClick('employeeList', '/employeeList')}>직원 관리</a>
                        </li>
                        <li className={currentMenu === 'employeeAttend' ? 'active' : ''}>
                            <a href="#" onClick={() => handleSubMenuClick('employeeAttend', '/employeeAttend')}>근태 관리</a>
                        </li>
                        <li className={currentMenu === 'employeeSalary' ? 'active' : ''}>
                            <a href="#" onClick={() => handleSubMenuClick('employeeSalary', '/employeeSalary')}>급여 관리</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;