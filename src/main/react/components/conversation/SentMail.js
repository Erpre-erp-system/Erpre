import React, { useEffect, useState } from 'react';
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/conversation/SentMail.css'
import Layout from "../../layout/Layout";
import Pagination from '../common/Pagination';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; // useNavigate import
import EmailSendModal from '../common/EmailSendModal'; //모달 뷰어 임포트


function SentMail() {

  const [isLoading, setLoading] = useState(true); // 로딩 상태 관리
  const [showModal, setShowModal] = useState(false);// 모달 띄움
  const [sendData, setSendData] = useState([]); // 보낸메일 내역 불러와서 저장  
  const employeeId = localStorage.getItem('employeeId');
  const navigate = useNavigate(); // useNavigate 훅 초기화
  const [selectedEmail, setSelectedEmail] = useState('')

  // 체크박스 상태 관리
  const [selectedItems, setSelectedItems] = useState([]);
  // 전체 선택 상태 계산
  const selectAll = sendData.length > 0 && selectedItems.length === sendData.length;

  // 🟢 개별 체크박스 선택
  const handleCheckboxChange = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // 🟢 전체 선택/해제
  const handleSelectAllChange = () => {
    if (selectAll) {
      // 전체 해제
      setSelectedItems([]);
    } else {
      // 전체 선택
      const allIds = sendData.map(email => email.emailNmS);
      setSelectedItems(allIds);
    }
  };

  // 삭제 기능 구현
  const handleDelete = async () => {
    if (selectedItems.length === 0) {
       window.showToast('삭제할 메일을 선택하세요.', 'error', 3000);
      return;
    }

    const confirmDelete = window.confirm('선택한 메일을 삭제하시겠습니까?');
    if (!confirmDelete) {
      return;
    }

    try {
      // 서버에 삭제 요청 보내기
      await axios.put('/api/email/sent/delete', {
        emailIds: selectedItems,
      });

      // 삭제 후 로컬 상태 업데이트
      const newSendData = sendData.filter(email => !selectedItems.includes(email.emailNmS));
      setSendData(newSendData);
      setSelectedItems([]);
    } catch (error) {
      console.error('메일 삭제 중 오류가 발생했습니다.', error);
      alert('메일 삭제 중 오류가 발생했습니다.');
    }
  };

  // 보낸 메일 조회
  useEffect(() => {
    const fetchSentEmail = async () => {
      try {
        const response = await axios.get(`/api/email/sent/${employeeId}`);

        const sortedData = response.data.sort((a, b) => new Date(b.emailDateS) - new Date(a.emailDateS));

        setSendData(sortedData);
        setLoading(false); // 로딩 완료 후 false로 설정
      } catch (error) {
        console.error('보낸메일을 불러오지 못하였습니다.', error);
      }
    };

    if (employeeId) {
      fetchSentEmail();
    }
  }, [employeeId]);
  console.log(sendData); // 보낸 메일 내역

  //메일 항목 클릭 시 해당 메일의 상세 페이지로 이동 
  // const handleEmailClick = (emailData) => {
  //   navigate(`/emailViewer/${emailData.emailNmS}`);
  // };

  //모달 관련 hooks
  // 🟡 모달 열기
  const openModal = (emailData) => {
    setSelectedEmail(emailData);
    console.log("보낸메일함에서 선택된 이메일 데이터:", emailData); // 선택된 이메일 데이터 확인
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <Layout currentMenu="sentMail">
      <main className="main-content menu_mail">

        <div className="menu_title">
          <div className="sub_title">보낸 메일함</div>
        </div>

        {/* 삭제 버튼 */}
        <button onClick={handleDelete} disabled={selectedItems.length === 0}>
          <i className="bi bi-trash trash_btn"></i>
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
                      <input type="checkbox" className="chkbox" onChange={handleSelectAllChange} checked={selectAll} />
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
              <tbody>
                {isLoading ? (
                  <tr className="tr_empty">
                    <td colSpan="10"> {/* 로딩 애니메이션 중앙 배치 */}
                      <div className="loading">
                        <span></span> {/* 첫 번째 원 */}
                        <span></span> {/* 두 번째 원 */}
                        <span></span> {/* 세 번째 원 */}
                      </div>
                    </td>
                  </tr>
                ) : (
                  sendData.length > 0 ? (
                    sendData.map((email, index) => (
                      <tr key={index} onClick={() => openModal(email)} className='send_tr'>
                        <td>
                          <input type="checkbox"
                            className='checkbox_map'
                            checked={selectedItems.includes(email.emailNmS)}
                            onChange={() => handleCheckboxChange(email.emailNmS)}
                            onClick={(e) => e.stopPropagation()} />
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
      </main>
      {
        showModal && (
          <EmailSendModal
            selectedEmailData={selectedEmail} //선택된 이메일 데이터를 모달에 전달
            closeModal={closeModal} // 모달 닫기 함수 전달
          />
        )
      }



    </Layout>

  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <SentMail />
  </BrowserRouter>
);