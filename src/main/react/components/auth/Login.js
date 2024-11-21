import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client'; // ReactDOM을 사용하여 React 컴포넌트를 DOM에 렌더링
import '../../../resources/static/css/common/Layout.css';
import '../../../resources/static/css/common/Login.css';
import axios from "axios"; // 개별 CSS 스타일 적용

function Login() {
    const [id, setId] = useState('');
    const [pw, setPw] = useState('');
    const [error, setError] = useState('');

    const fetchEmployeeStatus = async (employeeStatus) => {

        try {
            await axios.put('/api/messengers/info/update', {
                employeeStatus: employeeStatus
            });
        } catch (error) {
            console.error('직원 상태를 업데이트 하는 데 오류 발생', error);
        }
    };

    // 로그인 요청시 병렬 요청 처리 (검증, 메신저)
    const handleLogin = async (e) => {
        e.preventDefault(); // 폼 제출 방지

        try {
            const loginData = {
                employeeId: id,  // id 변수에 올바른 값이 있는지 확인
                employeePw: pw   // pw 변수에 올바른 값이 있는지 확인
            };

            console.log('로그인 요청 데이터:', loginData);

            // 1. 로그인 요청
            const loginResponse = await axios.post('/api/login', {
                employeeId: id,
                employeePw: pw
            }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            if (loginResponse.status === 200) {
                const result = loginResponse.data;
                await fetchEmployeeStatus("online");
                console.log('로그인 성공:', result);
                console.log('사용자 권한', result.role);

                if (result.role === 'Admin') {
                    // 관리자 권한일 때 처리
                    console.log("관리자 접근");
                } else if (result.role === 'Staff') {
                    // 일반 사원 권한일 때 처리
                    console.log("일반 사원 접근");
                }

                // 2. 메신저 직원 목록 조회
                const employeeResponse = await axios.get('/api/messengers/employeeList', {
                    withCredentials: true
                });

                if (employeeResponse.status === 200) {
                    console.log(
                        '직원 조회 성공:', employeeResponse.data);

                    // 직원 목록을 localStorage에 저장
                    localStorage.setItem('employeeList', JSON.stringify(employeeResponse.data));

                    // 직원 조회 성공 시 메인 페이지로 리다이렉트
                    location.href = "/main";
                } else {
                    console.error('직원 조회 실패');
                    setError('직원 조회에 실패했습니다.');
                }

            } else {
                console.log('로그인 실패', loginResponse.data)
                setError(loginResponse.data.note || '로그인에 실패했습니다.');
            }

        } catch (err) {
            console.error('로그인 중 오류 발생:', err);
            setError('서버와의 연결에 실패했습니다.');
        }

    };

    return (
        <div className="login-container" style={{ backgroundImage: `url(/img/logo_background.jpg)` }}>
            <div className="login-box">
                <div className="login-header">
                    <img src="/img/logo3.png" alt="IKEA 로고" className="logo" />
                    <h1>ERPRE ERP 관리자 시스템</h1>
                </div>
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="id">아이디</label>
                        <input
                            type="text"
                            id="id"
                            placeholder="아이디를 입력하세요."
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="pw">비밀번호</label>
                        <input
                            type="password"
                            id="pw"
                            placeholder="비밀번호를 입력하세요."
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-note">{error}</p>}

                        <button type="submit" className="login-btn">로그인</button>
                </form>
                <div className="login-footer">
                    <a href="#">비밀번호 초기화</a> | <a href="#">2단계 인증 안내</a>
                    <p>본 시스템은 ERPRE의 자산으로 인가된 사용자만 접근 가능합니다.</p>
                    <p>COPYRIGHT © ERPRE. ALL RIGHTS RESERVED.</p>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Login />
);
