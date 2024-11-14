import React, { useEffect, useState } from 'react';
import axios from "axios";

const InfoDetailModal = ({ employeeId, closeInfoModal }) => {
    const [employeeInfo, setEmployeeInfo] = useState({});

    useEffect(() => {
        const fetchEmployeeInfo = async () => {
            try {
                const response = await axios.get(`/api/messengers/info/${employeeId}`);
                setEmployeeInfo(response.data);
            } catch (error) {
                console.error("직원 정보 조회 오류:", error);
            }
        };

        if (employeeId) {
            fetchEmployeeInfo();
        }
    }, [employeeId]);

    return (
        <div>
            <div className='modal_container edit'>
                <div className="header">
                    <div>직원 정보</div>
                    <button className="btn_close" onClick={closeInfoModal}><i className="bi bi-x-lg"></i></button>
                </div>
                <div className="edit_wrap">
                    <div className='edit_form'>
                        <div className='field_wrap'>
                            <label>아이디</label>
                            <input
                                type='text'
                                className='box'
                                value={employeeInfo.employeeId || ''}
                                readOnly
                            />
                        </div>
                        <div className='field_wrap'>
                            <label>이름</label>
                            <input
                                type='text'
                                className='box'
                                value={employeeInfo.employeeName || ''}
                                readOnly
                            />
                        </div>
                        <div className='field_wrap'>
                            <label>이메일</label>
                            <input
                                type='text'
                                className='box'
                                value={employeeInfo.employeeEmail || ''}
                                readOnly
                            />
                        </div>
                        <div className='field_wrap'>
                            <label>연락처</label>
                            <input
                                type='text'
                                className='box'
                                value={employeeInfo.employeeTel || ''}
                                readOnly
                            />
                        </div>
                        <div className='field_wrap'>
                            <label>부서</label>
                            <input
                                type='text'
                                className='box'
                                value={employeeInfo.departmentId || ''}
                                readOnly
                            />
                        </div>
                        <div className='field_wrap'>
                            <label>직급</label>
                            <input
                                type='text'
                                className='box'
                                value={employeeInfo.jobId || ''}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="box blue" onClick={closeInfoModal}>닫기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoDetailModal;
