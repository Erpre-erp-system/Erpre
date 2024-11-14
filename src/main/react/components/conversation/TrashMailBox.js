import React, { useEffect, useState } from 'react';
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/conversation/TrashMailBox.css';
import Layout from "../../layout/Layout";
import axios from 'axios';
import Pagination from '../common/Pagination';
import EmailSendModal from '../common/EmailSendModal';

function TrashMailBox() {

  const [isLoading, setLoading] = useState(true); // 로딩 상태 관리
  const [trashData, setTrashData] = useState([]); // 휴지통 메일 데이터
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 메일들
  const employeeId = localStorage.getItem('employeeId'); // 로그인한 사용자 ID

  // 모달 상태 관리
  const [showModal, setShowModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // 전체 선택 상태 계산
  const selectAll = trashData.length > 0 && selectedItems.length === trashData.length;

  // 개별 체크박스 선택
  const handleCheckboxChange = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // 전체 선택/해제
  const handleSelectAllChange = () => {
    if (selectAll) {
      // 전체 해제
      setSelectedItems([]);
    } else {
      // 전체 선택
      const allIds = trashData.map(email => email.emailNmS);
      setSelectedItems(allIds);
    }
  };

  // 삭제 및 복구
  useEffect(() => {
    const fetchTrashEmails = async () => {
      try {
        const response = await axios.get(`/api/email/trash/${employeeId}`);
        setTrashData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('휴지통 메일을 불러오지 못했습니다.', error);
      }
    };

    if (employeeId) {
      fetchTrashEmails();
    }
  }, [employeeId]);

  // 복구 기능
  const handleRestore = async () => {
    if (selectedItems.length === 0) {
      ('복구할 메일을 선택하세요.');
      return;
    }

    const confirmRestore = window.confirm('선택한 메일을 복구하시겠습니까?');
    if (!confirmRestore) {
      return;
    }

    try {
      // 서버에 복구 요청 보내기 (PUT 메서드 사용)
      await axios.put('/api/email/trash/restore', {
        emailIds: selectedItems,
      });

      // 복구 후 로컬 상태 업데이트
      const newTrashData = trashData.filter(email => !selectedItems.includes(email.emailNmS));
      setTrashData(newTrashData);
      setSelectedItems([]);
    } catch (error) {
      console.error('메일 복구 중 오류가 발생했습니다.', error);
      window.showToast('메일 복구 중 오류가 발생했습니다.', 'error', 3000);
    }
  };

  // 메일 클릭 시 모달 열기 함수
  const openModal = (emailData) => {
    setSelectedEmail(emailData);
    setShowModal(true);
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setShowModal(false);
  };



  return (

    <Layout currentMenu="trashMailBox">
      <main className="main-content menu_mail">

        <div className="menu_title">
          <div className="sub_title">휴지통</div>
        </div>

        {/* 복구 버튼 */}
        <button onClick={handleRestore} disabled={selectedItems.length === 0}>
          <i className="bi bi-arrow-counterclockwise restore_btn"></i>
        </button>

        {/* 검색어 입력 */}
        {/* <div className="mail-search search_box">
            <label className="label_floating">메일 검색</label>
            <i className="bi bi-search"></i>
            <input type="text" className="mail-search-box box search" />
            <button className="btn-del">
              <i className="bi bi-x"></i>
            </button>
          </div> */}
        <div className="menu_content">
          <div className="search_wrap">
            <div className="left">
              <div className="checkbox_box">
                <input type="checkbox" id="currentMail" name="status" onChange={handleSelectAllChange} checked={selectAll} />
              </div>
            </div>
          </div>
          <div className="table_wrap">
            <table className='table_border'>
              <thead>
                <tr>
                  <th>
                    <label className="chkbox_label">
                      <input type="checkbox" className="chkbox" onChange={handleSelectAllChange}
                        checked={selectAll} />
                      <i className="chkbox_icon">
                        <i className="bi bi-check-lg"></i>
                      </i>
                    </label>
                  </th>
                  <th>
                    <div className="order_wrap">
                      <span>이메일</span>
                      {/* <button className="btn_order">
                <i className="bi bi-arrow-up"></i>
              </button> */}
                    </div>
                  </th>
                  <th>
                    <div className="order_wrap">
                      <span>제목</span>
                      {/* <button className="btn_order">
                <i className="bi bi-arrow-up"></i>
              </button> */}
                    </div>
                  </th>
                  <th>
                    <div className="order_wrap">
                      <span>일자</span>
                      {/* <button className="btn_order">
                <i className="bi bi-arrow-up"></i>
              </button> */}
                    </div>
                  </th>

                </tr>
              </thead>
              {/* 표 내용 */}
              <tbody>
                {isLoading ? (
                  <tr className="tr_empty">
                    <td colSpan="10">
                      <div className="loading">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trashData.length > 0 ? (
                    trashData.map((email) => (
                      <tr key={email.emailNmS} className='trash_tr'
                        onClick={() => openModal(email)}>
                        <td>
                          <input
                            type="checkbox"
                            className='checkbox_map'
                            checked={selectedItems.includes(email.emailNmS)}
                            onChange={() => handleCheckboxChange(email.emailNmS)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td>{email.emailAddrReceiveS}</td>
                        <td>{email.emailSubjectS}</td>
                        <td>{new Date(email.emailDateS).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="tr_empty">
                      <td colSpan="10">
                        <div className="no_data">
                          <i className="bi bi-exclamation-triangle"></i> 조회된 결과가 없습니다.
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지 네이션 컴포넌트 임포트 */}
          {/* <Pagination /> */}

        </div>


        {/* 모달 컴포넌트 렌더링 */}
        {showModal && (
          <EmailSendModal
            selectedEmailData={selectedEmail}
            closeModal={closeModal}
          />
        )}

      </main>
    </Layout>

  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <TrashMailBox />
  </BrowserRouter>
);