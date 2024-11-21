// src/main/react/components/common/EmailReceiveModal.js
import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import DOMPurify from 'dompurify';
import '../../../resources/static/css/conversation/EmailViewerModal.css';
import Layout from "../../layout/Layout";
import axios from 'axios';


function EmailReceiveModal({ selectedEmailData, closeModal }) {

  console.log('모달오류확인 위한 선택된 이메일데이터:', selectedEmailData);

  const [emailData, setEmailData] = useState(null);  // 선택한 이메일 데이터 저장
  const [viewFileInfo, setViewFileInfo] = useState([]);  // 이메일 뷰어 첨부파일 내역
  const [fileInfo, setFileInfo] = useState([]); // 첨부된 파일 이름 + 용량
  const [isLoading, setLoading] = useState(true); // 로딩 상태 관리
  const uid = selectedEmailData?.uid;
  const attachments = emailData?.receivedEmailFiles || []; //첨부파일리스트
  console.log('UID값:', uid);

  //로그인한 계정의 이메일 / 이름을 가져와서 보낸사람에 넣기위함
  const senderEmail = localStorage.getItem('employeeEmail');
  const senderName = localStorage.getItem('employeeName');

  // 모달 요소에 대한 ref 생성
  const modalRef = useRef(null);

  // 🟢 모달 배경 클릭 시 창 닫기
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // 모달 열릴 때 fade-in 클래스 추가
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.classList.add('fade-in');
    }
  }, []);

  // 모달 닫기 함수
  const handleClose = () => {
    if (modalRef.current) {
      modalRef.current.classList.remove('fade-in');
      modalRef.current.classList.add('fade-out');
      setTimeout(() => {
        closeModal(); // 페이드아웃 애니메이션이 끝난 후 모달 닫기
      }, 300); // CSS 애니메이션 시간과 동일하게 설정
    }
  };



  //선택한 메일을 불러옴
  useEffect(() => {
    const fetchEmailDetail = async () => {
      try {
        if (!uid) {
          console.error('UID가 없습니다.');
          return;
        }
        setLoading(true);
        const response = await axios.get(`/api/email/receive/read/${uid}`, {
          params: {
            username: 'hojinkim001155@gmail.com',
            password: 'icsw xsat ynhm aeqp',
            employeeEmail: senderEmail
          }
        });

        setEmailData(response.data);
      } catch (error) {
        console.error('메일을 읽어오지 못하였습니다.', error);
      } finally {
        setLoading(false);
      }
    };
    if (selectedEmailData && uid) {
      fetchEmailDetail();
    }
  }, [selectedEmailData, uid]);





  // 조건부 렌더링: emailData가 null이 아닐 때만 렌더링 // 이메일 데이터를 불러오기 전에 페이지가 로드되면 오류가 `발생하기 때문에
  // if (!emailData) {
  //   return <div>이메일 데이터를 불러오는 중입니다...</div>;
  // }


  //보낸첨부파일 내역 불러옴
  useEffect(() => {
    const fetchEmailFileDetail = async () => {
      try {
        const response = await axios.get(`/api/email/receive/files/list/${selectedEmailData.emailNmR}`);
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
  const sanitizeHTML = (html) => DOMPurify.sanitize(html);



  return (
    <div ref={modalRef} className='modal_overlay' onMouseDown={handleBackgroundClick}>
      <div className="email-viewer-container email_modal">
        {isLoading ? (
          // 로딩 중일 때 표시할 내용
          <div className="table_wrap">
            <div className="tr_empty">
              <div colSpan="10"> {/* 로딩 애니메이션 중앙 배치 */}
                <div className="loading">
                  <span></span> {/* 첫 번째 원 */}
                  <span></span> {/* 두 번째 원 */}
                  <span></span> {/* 세 번째 원 */}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 데이터 로드 후 표시할 내용
          <>
            <div className="email-actions">
              {/* <a href="#" className="action-link">답장</a>
              <a href="#" className="action-link">전달</a> */}
              {/* <a href="#" className="action-link delete">삭제</a> */}

              <button className="btn_close" onClick={handleClose}><i className="bi bi-x-lg"></i></button> {/* 모달 닫기 버튼 closeModal */}
            </div>

            <h1 className="email-subject">{emailData?.emailSubjectR || '제목 없음'}</h1>

            <div className="email-meta">
              <span>{emailData ? new Date(emailData.emailDateR).toLocaleString() : '날짜 없음'}</span>
              날짜
            </div>

            <div className="email-info">
              <p>보낸 사람: <span className="email-address"><a href="#">{emailData?.emailAddrSendR || '이메일주소 없음'}</a></span></p>
              <p>받는 사람: {senderName} <span className="email-address"><a href="#">{senderEmail}</a></span> </p>
            </div>

            <div className="email-text"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(emailData?.emailTextR || '내용 없음') }}
            ></div>

            <div className="file-section">
              {attachments.length > 0 ? (
                <table>
                  <thead>
                    <tr className='fileBox-title'>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments.map((file, index) => (
                      <tr key={index} className='file-map'>
                        <td className='file-name'>{file.emailFileNameR}</td>
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
          </>
        )}
      </div>
    </div>
  );
}

export default EmailReceiveModal;