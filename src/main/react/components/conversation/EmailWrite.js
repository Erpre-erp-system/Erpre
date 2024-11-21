import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter } from "react-router-dom";
import ReactDOM from 'react-dom/client';
import '../../../resources/static/css/conversation/EmailWrite.css'
import Layout from "../../layout/Layout";
import ReactQuill from "react-quill"; // 본문 글 편집기
import 'react-quill/dist/quill.snow.css'; // 편집기 기본 스타일
import axios from 'axios';
import { data } from '@remix-run/router';



// 컴포넌트
function EmailWrite() {

  // 수신자
  const [to, setTo] = useState('');
  // 제목
  const [subject, setSubject] = useState('');
  // 본문
  const [text, setText] = useState('');
  // 파일 첨부
  const [files, setFiles] = useState([]);
  // 첨부된 파일 이름 + 용량
  const [fileInfo, setFileInfo] = useState([]);
  // 전송 중 로딩 상태 default 값 필요
  const [loading, setLoading] = useState(false);
  // reactQuill은 ref로 
  const quillRef = useRef(null);
  // 파일첨부 누적용량
  const [fileSumSize, setFileSumSize] = useState('');
  // 파일첨부 MB 용량
  const [mbSize, setMbSize] = useState('0');
  // 파일 첨부 최대 용량(10MB)
  const maxSize = 10 * 1024 * 1024
  // 에러 메시지 상태
  const [errors, setErrors] = useState({
    to: '',
    subject: '',
    text: ''
  });

  // 공백일 시 에러 메세지
  const validateForm = () => {
    const newErrors = {
      to: '',
      subject: '',
      text: ''
    };
    let isValid = true;

    if (!to) {
      newErrors.to = '받는사람 이메일을 입력해주세요';
      isValid = false;
    }
    if (!subject) {
      newErrors.subject = '제목을 입력해주세요';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  }

  // 받는사람 인풋 공백 시
  const handleToChange = (e) => {
    setTo(e.target.value);
    if (errors.to) {
      setErrors((prevErrors) => ({ //prevErrors 는 현재 모든 에러 메시지를 포함
        ...prevErrors,
        to: ''
      }));
    }
  };

  //SideBar.js에서 로컬스토리지에 저장한 직원 이메일 사용
  const [from, setFrom] = useState(localStorage.getItem("employeeEmail") || "");
  //로그인된 계정
  const [emailIdS, setEmailIdS] = useState(localStorage.getItem("employeeId") || "");


  useEffect(() => {
    console.log("로그인계정 이메일: ", from);
    console.log("로그인계정 아이디: ", emailIdS);

  }, [from, emailIdS]);


  // 제목 인풋 공백 시
  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    if (errors.subject) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        subject: ''
      }));
    }
  };

  //첨부 버튼을 input으로 연결
  const connectFileUpload = () => {
    document.getElementById('file-upload').click();
  };


  //파일 리스트 업데이트 함수 e 사용 / 파일 첨부 state 사용
  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files); // 새로 선택한 파일들
    const maxFiles = 5; // 최대 첨부파일 갯수
    const maxSize = 10 * 1024 * 1024;// 10MB 제한

    //파일 첨부 갯수 제한
    if (files.length + newFiles.length > maxFiles) {
      window.showToast("파일첨부는 최대 5개까지 가능합니다.", 'error', 3000);
      return;
    }

    //파일 첨부 용량 제한
    const totalSize = [...files, ...newFiles].reduce((sum, file) => sum + file.size, 0);  // sum은 누적값이고 0으로 초기화를 해주어 0부터 누적값이 더해지게 // reduce는 배열의 모든 요소를 하나로 합쳐줌
    if (totalSize > maxSize) {
      window.showToast("첨부된 파일이 10MB 제한을 초과했습니다.", 'error', 3000);
      return;
    }


    setFiles((prevFiles) => [...prevFiles, ...newFiles]); // files에 이전 선택 파일 + 새로 선택 파일 저장
    setFileSumSize(totalSize);  // 총 용량 업데이트

    //파일의 용량을 파일 박스에 출력하기 위함 남은 파일 용량에 따라 다르게 출력되게
    setMbSize(
      totalSize < 1024
        ? totalSize.toFixed(3) + ' B'
        : totalSize < 1024 * 1024
          ? (totalSize / 1024).toFixed(3) + ' KB'
          : (totalSize / 1024 / 1024).toFixed(3) + ' MB'
    );

    setFileInfo((prevFilesInfo) => [
      ...prevFilesInfo,
      ...newFiles.map((file) => ({ name: file.name, size: (file.size / 1024).toFixed(3) + ' KB' })) //파일 크기를 KB로 변환하고 소수점 두자리까지
    ]);

    e.target.value = null; //파일 중복 추가를 위한 input 값 초기화
  };




  // 첨부된 용량 // 그냥 출력 시 두번 째 첨부 때부터 용량 출력 / 즉시출력 위함
  useEffect(() => {
    if (fileSumSize === 0) {
      setMbSize('0');
    } else if (fileSumSize < 1024 * 1024) {
      setMbSize((fileSumSize / 1024).toFixed(3) + ' KB'); //용량이 1MB 미만일 경우 KB 단위로 표시
    } else {
      setMbSize((fileSumSize / 1024 / 1024).toFixed(3) + ' MB'); // 용량이 1MB 이상일 경우 MB 단위로 표시
    }
    console.log("첨부누적용량: " + mbSize);
  }, [fileSumSize]); // fileSumSize 의 값이 변경 될 때마다

  //첨부파일 삭제
  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      const updatedSize = updatedFiles.reduce((sum, file) => sum + file.size, 0);  //삭제 후 파일 용량 다시 계산

      setFileSumSize(updatedSize);

      //파일삭제에 따른 남은 용량 단위 표시
      setMbSize(
        updatedSize === 0
          ? ''
          : updatedSize < 1024
            ? updatedSize.toFixed(3) + ' B'
            : updatedSize < 1024 * 1024
              ? (updatedSize / 1024).toFixed(3) + ' KB'
              : (updatedSize / 1024 / 1024).toFixed(3) + ' MB'
      );

      setFileInfo((prevFileInfo) => prevFileInfo.filter((_, i) => i !== index));
      return updatedFiles;
    });
  };



  //보내기 함수 어싱크 사용 /
  // 로딩 상태 활성화 / 
  //이메일 데이터를 multipart 형식으로 서버에 전송하기 위해 사용 폼데이타를 새로은 변수 선언
  // 폼데이타에 수신자 이메일 주소 추가 / 
  // 폼데이타에 이메일 제목 추가 / 
  // 폼데이타에 이메일 본문 추가 / 
  const handleSendEmail = async () => {

    if (!validateForm()) {    //이메일 공백 유효성 검사
      return;
    }
    setLoading(true);
    const formData = new FormData(); // formData는 파일 업로드 폼데이터 저장하기 위한 객체
    formData.append('to', to); // append : 폼데이터에 ('to'라는 키 추가, to라는 현재의 상태값)
    formData.append('subject', subject);
    formData.append('text', text);
    formData.append('from', from);
    formData.append('emailIds', emailIdS)

    //파일 첨부 처리 반복문으로 폼데이타에 저장 / 첨부파일은 여러개
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    // try 구문 안에
    // 어웨이트를 포스트 방식으로 전송('/엔드포인트 url', 데이터 , 폼데이터를 보냄{
    // 헤더 안에 컨텐츠 타입을 설정함 : 첨부파일의 방식 / 폼데이터
    // 성공처리 알람
    // 오류 처리 알람
    // 로딩상태 아래꺼 가져오기

    try {
      const response = await axios.post('/api/email/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // multipart 여러 텍스트, 파일 전송 가능한 타입
        }
      });
      window.showToast("메일 전송이 완료되었습니다.");

      setTo('');
      setSubject('');
      setText('');
      setFiles([]);
      setFileInfo([]);

    } catch (error) {
      console.log("메일 전송 실패", error);

      if (error.response) {
        const errorMsg = error.response.data;

        if (error.response.status === 400 && errorMsg.includes("Invalid Addresses")) {
          // 이메일 주소 형식 오류
          window.showToast('이메일 형식이 잘못되었습니다.', 'error', 3000);
        } else if (error.response.status === 500) {
          // 서버 오류 (이메일 주소)
          window.showToast('이메일 형식이 잘못되었습니다.', 'error', 3000);
        } else {
          // 기타 오류
          window.showToast("메일 전송에 실패했습니다.", 'error', 3000);
        }
      } else {
        // 네트워크 오류 또는 기타 예외
        window.showToast("네트워크 오류가 발생했습니다.", 'error', 3000);
      }
    } finally {
      setLoading(false);   // 이메일 전송 후 로딩 상태값 변경
    }
  };

  return (
    <Layout currentMenu="emailWrite">

      <div className="email-compose-container">
        <div className="email-compose-container">
          {/* 상단 메뉴 */}

          {/* 받는 사람*/}
          <div className="email-field">
            <label htmlFor="to">받는사람</label>
            {/*<button><i className="bi bi-person-plus"></i></button>*/}
            <input
              type="text"
              id="to"
              value={to}
              onChange={(e) => handleToChange(e)}
              placeholder='수신자'
            // className={errors.to ? 'field_error' : 'field_ok'}
            />
            {/* 공백 유효성 검사 */}
            {errors.to && (
              <p className='field_error_msg'>
                <i className="bi bi-exclamation-circle-fill"></i>
                {errors.to}
              </p>
            )}
          </div>

          {/* 제목 */}
          <div className="email-field">
            <label htmlFor="subject">제목</label>
            <input
              className='subject-input'
              type="text"
              id="subject"
              placeholder="제목"
              value={subject}
              onChange={(e) => handleSubjectChange(e)}
            // className={errors.subject ? 'field_error' : 'field_ok'}
            />
            {/* 공백 유효성 검사 */}
            {errors.subject && (
              <p className='field_error_msg'>
                <i className="bi bi-exclamation-circle-fill"></i>
                {errors.subject}
              </p>
            )}
          </div>

          {/* 파일첨부 */}
          <div className="email-field">
            <label htmlFor="file-upload" className="file-label">파일첨부</label> {/*htmlFor: file-upload라는 id의 input과 연결됨*/}
            <button
              className='subject-input file-btn'
              type="text"
              id="file"
              onClick={connectFileUpload}
            >
              내 PC
            </button>

            <input
              type="file"
              id="file-upload"
              accept='image/png, image/jpeg, application/pdf'
              className='file-upload-input'
              multiple //여러파일 선택
              onChange={handleFileAdd}
            />
            <p>
              <span className='file-total-size'>
                첨부용량: {mbSize || "0 KB"}/10MB
              </span>

            </p>

          </div>

          {/* 파일 첨부 box*/}
          <label >
            <div className="file-attachment">
              {fileInfo.length > 0 && (
                <table>
                  <thead>
                    <tr className='fileBox-title'>
                      <th className='fileBox-delete-icon'></th>
                      <th>파일명</th>
                      <th>용량</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileInfo.map((files, index) => (
                      <tr key={index} className='file-map'>
                        <td className='fileBox-delete-icon'>
                          <span onClick={() => handleRemoveFile(index)}>
                            <i className="bi bi-trash3 file-delete-icon"></i>
                          </span>
                        </td>
                        <td className='file-name'>{files.name}</td>
                        <td className='file-size'>{files.size}</td>
                      </tr>
                    ))}

                  </tbody>
                </table>

              )}
              {fileInfo.length === 0 && (
                <div className='no-files-note'>
                  선택한 파일이 이곳에 표시됩니다
                </div>
              )}

            </div>
          </label>

          {/* 이메일 본문 + 편집기  */}
          <div className='email-text'>
            <ReactQuill
              ref={quillRef} //ReactQuill에 ref 추가
              className='email-textBody'
              value={text}
              onChange={(value) => setText(value)} // reactQuill 같은 서드파티 편집기는 html 구조를 반환함 바로 value로 받음
            />
          </div>

          <div className="email-footer">
            <div>
              {/* 1. 버튼 안에 로딩창 */}
              <button
                onClick={handleSendEmail}
                disabled={loading}
              >
                <i className="bi bi-send icon-margin"></i>
                {loading ? '메일 전송중 ..' : '보내기'}
              </button>
              {/* <a href="#">임시저장</a> */}
            </div>
          </div>

        </div>

      </div>

      {/* 로딩 오버레이 */}
      {loading && (
        <div className="loading_overlay">
          <div className="spinner"></div>
          <div className="loading_text">메일 전송 중...</div>
        </div>
      )}

    </Layout>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')); // 루트 DOM 요소에 리액트 컴포넌트를 랜더링
root.render(
  <BrowserRouter> {/*리액트 라우터를 사용하여 클라이언트 사이드 라우팅 지원*/}
    <EmailWrite /> {/*컴포넌트 랜더링*/}
  </BrowserRouter>
)