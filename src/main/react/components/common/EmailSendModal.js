// src/main/react/components/common/EmailSendModal.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import DOMPurify from 'dompurify';
import '../../../resources/static/css/conversation/EmailViewerModal.css';
import Layout from "../../layout/Layout";
import axios from 'axios';


function EmailSendModal({ selectedEmailData, closeModal }) {

  const [emailData, setEmailData] = useState(null);  // 선택한 이메일 데이터 저장

  // 🟢 모달 배경 클릭 시 창 닫기
  const handleBackgroundClick = (e) => {
    if (e.target.id === 'modalOverlay') {
      handleClose();
    }
  };

  useEffect(() => {
    const modal = document.getElementById('modalOverlay');
    modal.classList.add('fade-in'); // 모달 열릴 때 fade-in 클래스 추가
  }, []);

  const handleClose = () => {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out'); // 모달 닫을 때 fade-out 클래스 추가

    setTimeout(() => {
      closeModal(); // 페이드아웃 애니메이션이 끝난 후 모달 닫기
    }, 300); // CSS 애니메이션과 같은 0.3초로 설정
  };

  // 첨부된 파일 이름 + 용량
  const [fileInfo, setFileInfo] = useState([]);

  //선택한 메일을 불러옴
  useEffect(() => {
    const fetchEmailDetail = async () => {
      try {
        const response = await axios.get(`/api/email/read/${selectedEmailData.emailNmS}`);
        setEmailData(response.data);
      } catch (error) {
        console.error('메일을 읽어오지 못하였습니다.', error);
      }
    };
    if (selectedEmailData && selectedEmailData.emailNmS) {
      fetchEmailDetail();
    }
  }, [selectedEmailData]);

  //로그인한 계정의 이메일 / 이름을 가져와서 보낸사람에 넣기위함
  const senderEmail = localStorage.getItem('employeeEmail');
  const senderName = localStorage.getItem('employeeName');

  // 조건부 렌더링: emailData가 null이 아닐 때만 렌더링 // 이메일 데이터를 불러오기 전에 페이지가 로드되면 오류가 발생하기 때문에
  // if (!emailData) {
  //   return <div>이메일 데이터를 불러오는 중입니다...</div>;
  // }


  // 이메일 뷰어 첨부파일 내역
  const [viewFileInfo, setViewFileInfo] = useState([]);

  //보낸첨부파일 내역 불러옴
  useEffect(() => {
    const fetchEmailFileDetail = async () => {
      try {
        const response = await axios.get(`/api/email/files/list/${selectedEmailData.emailNmS}`);
        setViewFileInfo(response.data);
      } catch (error) {
        console.error('첨부파일을 읽어오지 못하였습니다.', error);
      }
    };
    if (selectedEmailData) {
      fetchEmailFileDetail();
    }
  }, [selectedEmailData]);

  // 이메일 내용부분 xxs공격 방지위해 Dompurify 정화
  const sanitizeHTML = (html) => {
    return DOMPurify.sanitize(html);
  };

  return (
    <div id="modalOverlay" className='modal_overlay' onMouseDown={handleBackgroundClick}>
      <div className="email-viewer-container email_modal">

        <div className="email-actions">
          {/* <a href="#" className="action-link">답장</a>
          <a href="#" className="action-link">전달</a> */}
          {/* <a href="#" className="action-link delete">삭제</a> */}

          <button className="btn_close" onClick={handleClose}><i className="bi bi-x-lg"></i></button> {/* 모달 닫기 버튼 */}
        </div>

        <h1 className="email-subject">{emailData?.emailSubjectS || '제목 없음'}</h1>

        <div className="email-meta">
          <span>{emailData ? new Date(emailData.emailDateS).toLocaleString() : '날짜 없음'}</span>
          날짜
        </div>

        <div className="email-info">
          <p>보낸 사람: {senderName} <span className="email-address"><a href="#">{senderEmail}</a></span> </p>
          <p>받는 사람: <span className="email-address"><a href="#">{emailData?.emailAddrReceiveS || '이메일주소 없음'}</a></span></p>


        </div>

        <div className="email-text"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(emailData?.emailTextS || '내용 없음') }}
        ></div>


        <label >
          <div className="file-section">
            {viewFileInfo.length > 0 ? (
              <table>
                <thead>
                  <tr className='fileBox-title'>
                  </tr>
                </thead>
                <tbody>
                  {viewFileInfo.map((file, index) => (
                    <tr key={index} className='file-map'>
                      <td className='fileBox-delete-icon'>
                      </td>
                      <td className='file-name'>{file.emailFileNameS}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className='no-files-note'>
                첨부파일 없음
              </div>
            )}

          </div>
        </label>
      </div>
    </div>

  );
}

export default EmailSendModal;