import React, {useEffect, useState} from 'react';
import {FaUserCircle} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const Info = () => {
    const [info, setInfo] = useState({});
    const [phone, setPhone] = useState('');

    const handlePhoneChange = (e) => {
        let input = e.target.value.replace(/[^0-9]/g, "");
        if (input.length <= 3) {
            setPhone(input);
        } else if (input.length <= 7) {
            setPhone(input.slice(0, 3) + "-" + input.slice(3));
        } else if (input.length <= 11) {
            setPhone(input.slice(0, 3) + "-" + input.slice(3, 7) + "-" + input.slice(7));
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/messengers/info');
            setInfo(response.data);
            setPhone(response.data.employeeTel);
            console.log('유저 정보:', response.data);
        } catch (error) {
            console.error('유저 정보 가져오기 실패:', error);
        }
    };

    const showInputAlert = () => {
        Swal.fire({
            icon: 'error',
            title: '형식 오류',
            text: '핸드폰 번호는 000-0000-0000 형식으로 입력해 주세요',
            confirmButtonText: '확인',
        }).then(() => {
        });
    };

    const handleInfoUpdate = async () => {
        const phonePattern = /^\d{3}-\d{4}-\d{4}$/;
        if (!phonePattern.test(phone)) {
            showInputAlert();
            return;
        }

        const params = new URLSearchParams();
        params.append("employeeTel", phone);

        try {
            const response = await axios.put('/api/messengers/info/update?' + params.toString());
            console.log('유저 정보 업데이트 성공:', response.data);
            fetchData();
        } catch (error) {
            console.error('유저 정보 업데이트 실패:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            await handleUpload(selectedFile);
        }
    };

    const handleProfileEditClick = () => {
        document.getElementById("fileInput").click();
    };

    // 프로필 사진 업로드
    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileType", "profile");

        try {
            const response = await axios.post('/api/files/upload', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const uploadedFileName = response.data;
            await updateProfileImage(uploadedFileName);
        } catch (error) {
            console.error("프로필 사진 업로드 실패:", error);
        }
    };

    // 프로필 사진 URL 업데이트
    const updateProfileImage = async (fileName) => {
        try {
            await axios.put('/api/messengers/profile/update', { fileName });
            const updatedInfo = { ...info, employeeImageUrl: `/api/files/profile/${fileName}` };
            setInfo(updatedInfo);
            window.showToast('프로필 사진이 업데이트되었습니다');
        } catch (error) {
            console.error("프로필 사진 URL 업데이트 실패:", error);
        }
    };

    const handleProfileDelete = async () => {
        try {
            await axios.delete('/api/messengers/profile/delete');
            window.showToast("프로필 사진이 삭제되었습니다", 'error');
            fetchData();
        } catch (error) {
            console.error("프로필 사진 삭제 실패:", error);
        }
    };

    return (
        <div className="info-container">
            <div className="profile-picture">
                {/* 이미지 편집 및 삭제 */}
                <div className="image-placeholder">
                    {info.employeeImageUrl ? (
                        <img src={info.employeeImageUrl} alt="프로필 사진" className="info-icon"/>
                    ) : (
                        <FaUserCircle className="info-icon"/>
                    )}
                </div>
                <div className="image-button">
                    <button className="image-update-button" onClick={handleProfileEditClick}>프로필 편집</button>
                    <button className="image-delete-button" onClick={handleProfileDelete}>프로필 삭제</button>
                </div>
                {/* 파일 입력 요소 숨김 */}
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
            </div>

            <div className="info-fields">
                {/* 수정 불가능 필드 */}
                <div className="info-item">
                    <label>이름</label>
                    <input type="text" value={info.employeeName} readOnly/>
                </div>
                <div className="info-item">
                    <label>부서</label>
                    <input type="text" value={info.departmentName} readOnly/>
                </div>
                <div className="info-item">
                    <label>직급</label>
                    <input type="text" value={info.jobName} readOnly/>
                </div>
                <div className="info-item">
                    <label>아이디</label>
                    <input type="text" value={info.employeeId} readOnly/>
                </div>


                <div className="info-item">
                    <label>핸드폰 번호</label>
                    <input type="text" value={phone} onChange={handlePhoneChange}/>
                </div>
                <div className="info-item">
                    <label>이메일</label>
                    <input type="text" value={info.employeeEmail} readOnly/>
                </div>
                <div className="info-item">
                    <label>입사일</label>
                    <input type="text" value={formatDate(info.employeeInsertDate)} readOnly/>
                </div>
            </div>

            <button className="save-button" onClick={handleInfoUpdate}>저장하기</button>
        </div>
    );
};

export default Info;
