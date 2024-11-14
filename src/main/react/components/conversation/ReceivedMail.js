import React, { useEffect, useState } from 'react';
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/conversation/ReceivedMail.css'
import Layout from "../../layout/Layout";
import Pagination from '../common/Pagination';
import axios from 'axios';
import EmailReceiveModal from '../common/EmailReceiveModal';



function ReceivedMail() {

  const [isLoading, setLoading] = useState(true); // 로딩 상태 관리
  const [showModal, setShowModal] = useState(false);// 모달 띄움
  const [receiveData, setReceiveData] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('')
  const employeeEmail = localStorage.getItem('employeeEmail');

  // 보낸 메일 저장
  useEffect(() => {
    const fetchReceiveEmail = async () => {
      try {
        console.log("employeeEmail:", employeeEmail);  // employeeId 값 출력
        const response = await axios.get(`/api/email/receive/${employeeEmail}`, {
          params: {
            username: 'hojinkim001155@gmail.com',
            password: 'icsw xsat ynhm aeqp'
          }
        });

        // const sortedData = response.data.sort((a, b) => new Date(b.emailDateR) - new Date(a.emailDateR));  //가장 최근 날짜가 위로 오도록 정렬

        setReceiveData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('받은메일을 불러오지 못하였습니다.', error);
      }
    };
    if (employeeEmail) {
      fetchReceiveEmail();
    }
  }, [employeeEmail]);
  console.log(receiveData); // 보낸 메일 내역


  //모달 관련 hooks
  // 🟡 모달 열기
  const openModal = (emailData) => {
    setSelectedEmail(emailData);
    console.log("받은메일함에서 선택된 이메일 데이터:", emailData); // 선택된 이메일 데이터 확인
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };

  return (

    <Layout currentMenu="receivedMail">

      <main className="main-content menu_mail">

        <div className="menu_title">
          <div className="sub_title">받은 메일함</div>
        </div>

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
                <input type="checkbox" id="currentMail" name="status" />
              </div>
            </div>
          </div>
          <div className="table_wrap">
            <table className='table_border'>
              <thead>
                <tr>
                 <th>
                    <label className="chkbox_label">
                      <input type="checkbox" className="chkbox" />
                      {/* <i className="chkbox_icon">
                        <i className="bi bi-check-lg"></i>
                      </i> */}
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
                  receiveData.length > 0 ? (
                    receiveData.map((email, index) => (
                      <tr key={index} onClick={() => openModal(email)} className='receive_tr'>
                        <td><input type="checkbox" /></td>
                        <td>{email.emailAddrSendR}</td>
                        <td>{email.emailSubjectR}</td>
                        <td>{new Date(email.emailDateR).toLocaleString()}</td>
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
          <EmailReceiveModal
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
    <ReceivedMail />
  </BrowserRouter>
)