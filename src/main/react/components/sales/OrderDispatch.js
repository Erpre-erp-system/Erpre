import React, { useState, useEffect, useMemo} from 'react';
import ReactDOM from 'react-dom/client'; // ReactDOM을 사용하여 React 컴포넌트를 DOM에 렌더링
import '../../../resources/static/css/common/Main.css'; // 공통 CSS 파일
import Layout from "../../layout/Layout"; // 공통 레이아웃 컴포넌트를 임포트 (헤더, 푸터 등)
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/sales/OrderDispatch.css';
import axios from 'axios';

// 날짜 포맷팅 함수
const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2);
    const day = (`0${date.getDate()}`).slice(-2);
    const hours = (`0${date.getHours()}`).slice(-2);
    const minutes = (`0${date.getMinutes()}`).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 출고 상태 매핑 함수
const mapDispatchStatus = (orderStatus) => {
  switch (orderStatus) {
    case '결제완료':
      return '출고대기';
    default:
      return orderStatus;
  }
};

//출고지시 모달창
function DispatchInstructionModal ({ show, onClose, onSave, assignedWarehouse, dispatchData }) {
    const [form, setForm] = useState({
      //고객사
      customerName: '', // 고객사 이름 - customer
      customerAddr: '', // 고객사 주소(납품지주소) - customer
      //출하창고
      warehouseName: '', //창고명 - warehouse
      warehouseManagerName: '', //창고명 담당자 - warehouse
      orderDDeliveryRequestDate: '', //납품요청일 - orderD
      //상품(orderH)
      productNm: '', //품목명 - product
      orderDPrice: '', //출고단가 - orderD
      orderDQty: '', //수량(단위포함) - orderD
      orderDTotalPrice: '', //총금액 - orderD
      //qr코드
      qrCodeData: '', //qr코드 데이터 - qr_code
    });


    //모달 알림창 2번 뜨는거 방지
    const [showConfirmModal, setShowConfirmModal] = useState(false);

      useEffect(() => {
        if (show && dispatchData) {
          setForm({
            customerName: dispatchData.customerName,
            customerAddr: dispatchData.customerAddr,
            warehouseName: assignedWarehouse || '',
            warehouseManagerName: dispatchData.warehouseManagerName || '',
            orderDDeliveryRequestDate: formatDateTime(dispatchData.orderDDeliveryRequestDate),
            productNm: dispatchData.productNm,
            orderDPrice: dispatchData.orderDPrice,
            orderDQty: dispatchData.orderDQty,
            orderDTotalPrice: dispatchData.orderDTotalPrice,
            qrCodeData: dispatchData.qrCodeData,
          });
        }
      }, [show, dispatchData, assignedWarehouse]);

    //창고배정에서 선택한 창고명으로 저장
    useEffect(() => {
      if (show) {
        setForm(prevForm => ({
          ...prevForm,
          warehouseName: assignedWarehouse || '',
        }));
      }
    }, [show, assignedWarehouse]);

    // 입력 값 변경 시 폼 상태 업데이트
    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    };

    // 폼 제출 처리
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form); // 상위 컴포넌트로 저장된 데이터 전달
        onClose(); // 모달 닫기
    };

    if (!show) return null; // 모달 표시 여부 체크

    return (
        <div className="modal_overlay">
            <div className="modal_container dispatch">

                <button className="btn_close" onClick={onClose}><i className="bi bi-x-lg"></i></button> {/* 모달 닫기 버튼 */}

                <div className="form-group">
                    <label>고객사 이름</label>
                <input
                    name="customerName"
                    value={form.customerName}
                    readOnly
                />
                </div>
                <div className="form-group">
                    <label>공급자 상호</label>
                        <p>이케아</p>
                </div>
                <div className="form-group">
                    <label>공급자 주소</label>
                        <p>이케아</p>
                </div>
                <div className="form-group">
                    <label>공급자 대표성명</label>
                        <p>박인욱</p>
                </div>
                <div className="form-group">
                    <label>공급자 전화번호</label>
                        <p>02-111-5555</p>
                </div>
                <div className="form-group">
                    <label>공급자 사업자 등록번호</label>
                        <p>123-456-7890</p>
                </div>
                <div className="form-group">
                    <label>납품지 주소</label>
                <input
                    name="customerAddr"
                    value={form.customerAddr}
                    readOnly
                />
                </div>
                <div className="form-group">
                    <label>출하창고</label>
                <input
                    name="warehouseName"
                    value={form.warehouseName}
                    readOnly
                />
                </div>
                <div className="form-group">
                    <label>납품 요청일</label>
                <input
                    name="orderDDeliveryRequestDate"
                    value={form.orderDDeliveryRequestDate}
                    readOnly
                />
                </div>
                <div className="form-group">
                    <label>품목명</label>
                <input
                    name="productNm"
                    value={form.productNm}
                    readOnly
                />
                </div>
                <div className="form-group">
                    <label>출고단가</label>
                <input
                    name="orderDPrice"
                    value={form.orderDPrice}
                    readOnly
                />
                </div>
                <div className="form-group">
                    <label>수량(단위포함)</label>
                <input
                    name="orderDQty"
                    value={form.orderDQty}
                    readOnly
                />
                </div>
                <div className="form-group">
                    <label>총금액</label>
                <input
                    name="orderDTotalPrice"
                    value={form.orderDTotalPrice}
                    readOnly
                />
                </div>
                <div className="form-group">
                    <label>수량</label>
                <input
                    name="totalOrderDQty"
                    value={form.totalOrderDQty}
                    readOnly
                />
                </div>
                <div className="form-group">
                    <label>인수</label>
                        <p>인</p>
                </div>
                <div className="form-group">
                    <label>QR코드</label>
                </div>
                <div className="form-group">
                    <label>다운로드</label>
                      <button onClick={handlePdfDownload}>pdf로 다운받기</button>
                      <button onClick={handleExcelDownload}>excel로 다운받기</button>
                </div>
                <div className="form-group">
                    <button className="dispatch instruction">출고</button>
                </div>
            <div className="modal-actions">
                <button type="submit" className="box blue" onClick={handleSubmit}>등록</button>
            </div>
            {/* 출고지시 확인 모달 */}
            {showConfirmModal && (
            <ConfirmationModal
                message="출고 지시 하시겠습니까?"
                onConfirm={handleConfirmSave}
                onCancel={() => setShowConfirmModal(false)}
                />
            )}

             </div>
        </div>
    );
};

//창고배정 모달창
function WarehouseAssignmentModal({ show, onClose, onSave, onDelete, dispatchStatus }) {

    const [isEditMode, setIsEditMode] = useState(false); // 편집 모드 여부
    const [editableWarehouse, setEditableWarehouse] = useState(warehouse || {}); // 편집 가능한 창고 데이터
    const [showEditConfirmModal, setShowEditConfirmModal] = useState(false); // 수정 확인 모달 표시 여부
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false); // 저장 확인 모달 표시 여부
    const [warehouseManagers, setWarehouseManagers] = useState([]); //창고명->창고담당자
    const [warehouseInfo, setWarehouseInfo] = useState({});
    const [errors, setErrors] = useState({ // 필수값 검증 에러 메시지
        warehouseName: '',
        warehouseManagerName: '',
    });

      // 모달이 열릴 때마다 초기화
      useEffect(() => {
        if (show) {
          setIsEditMode(true); // 창고 배정이므로 편집 모드로 시작
          setEditableWarehouse({});
          setErrors({
            warehouseName: '',
            warehouseManagerName: '',
          });
        }
      }, [show]);

    // 편집 모드 토글 함수
    const toggleEditMode = () => {
        if (dispatchStatus !== 'pending') {
            window.showToast("출고 대기 상태에서만 수정 가능합니다.", 'error');
            return;
          }
          setShowEditConfirmModal(true);
        };

    // 수정 확인 모달에서 확인을 누르면 편집 모드 활성화
    const handleConfirmEdit = () => {
        setIsEditMode(true); // 편집 모드 활성화
        setShowEditConfirmModal(false); // 수정 확인 모달 닫기
    };

  // 창고명 변경 핸들러
    const handleWarehouseNameChange = async (e) => {
    const selectedWarehouseName = e.target.value;
    setEditableWarehouse({ ...editableWarehouse, warehouseName: selectedWarehouseName });

    // 선택된 창고 정보 가져오기
    try {
      const response = await axios.get(`/api/warehouse/info?warehouseName=${selectedWarehouseName}`);
      setWarehouseInfo(response.data);

      // 창고 담당자 목록 가져오기
      const managersResponse = await axios.get(`/api/warehouse/managers?warehouseName=${selectedWarehouseName}`);
      setWarehouseManagers(managersResponse.data);
    } catch (error) {
      console.error('Error fetching warehouse data:', error);
    }
  };

    // 입력 값 변경 시 상태 업데이트 함수
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableWarehouse((prev) => ({ ...prev, [name]: value }));
      };

    // 저장 처리 함수 : 저장 확인 모달 표시
    const handleSave = () => {
        if (dispatchStatus !== 'pending') {
          window.showToast("출고 대기 상태에서만 저장 가능합니다.", 'error');
          return;
        }
        setShowSaveConfirmModal(true);
      };
    

    // 저장 확인 모달에서 확인을 누르면 실제 저장 동작 수행
    const handleConfirmSave = () => {

    // 필수 필드 값 검증
    let valid = true;
    let newErrors = {
        warehouseName: '',
        warehouseManagerName: '',
    };

    if (!editableWarehouse.warehouseName.trim()) {
        newErrors.warehouseName = '창고명은 필수 선택 항목입니다.';
        valid = false;
    }
    if (!editableWarehouse.warehouseManagerName.trim()) {
        newErrors.warehouseManagerName = '창고 담당자는 필수 선택 항목입니다.';
        valid = false;
    }

    // 에러 상태 업데이트
    setErrors(newErrors);

    // 필수 필드 검증 실패 시 저장 중단
    if (!valid) {
        setShowSaveConfirmModal(false); // 저장 확인 모달 닫기
        return;
    }

    // 저장 동작 수행
    onSave(editableWarehouse); // 상위 컴포넌트로 저장된 데이터 전달
    onClose(); // 상세 모달 닫기
    setShowSaveConfirmModal(false); // 저장 확인 모달 닫기
};

    if (!show ) return null; // 모달 표시 여부 체크

    return (
        <div className="modal_overlay">
            <div className="modal_container dispatch">
                <div className="header">
                    <div>창고 배정</div>
                    <button className="btn_close" onClick={onClose}><i className="bi bi-x-lg"></i></button> {/* 모달 닫기 버튼 */}
            </div>
            <div className="detail-form">
                    <div className="form-group">
                        <label>창고명{isEditMode && (<span className='span_red'>*</span>)}</label>
                         <select
                              name="warehouseName"
                              value={editableWarehouse.warehouseName || ''}
                              onChange={handleWarehouseNameChange}
                              className={errors.warehouseName ? 'invalid' : ''}
                            >
                              <option value="">선택</option>
                              <option value="01">01. 본사창고</option>
                              <option value="02">02. 천안창고</option>
                              <option value="03">03. 인천창고</option>
                              <option value="04">04. 대전창고</option>
                        </select>
                       {errors.warehouseName && (
                          <p className="field_error_msg">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            {errors.warehouseName}
                          </p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>창고 담당자명{isEditMode && (<span className='span_red'>*</span>)}</label>
                         <select
                              name="warehouseManagerName"
                              value={editableWarehouse.warehouseManagerName || ''}
                              onChange={handleChange}
                              className={errors.warehouseManagerName ? 'invalid' : ''}
                            >
                              <option value="">선택</option>
                              {warehouseManagers.map((managerName, index) => (
                                <option key={index} value={managerName}>{managerName}</option>
                              ))}
                        </select>
                        {errors.warehouseManagerName && (
                          <p className="field_error_msg">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            {errors.warehouseManagerName}
                          </p>
                        )}
                    </div>
                    <div className="form-group">
                        <label>창고 전화번호</label>
                        <p>{warehouseInfo.warehouseTel || '-'}</p>
                    </div>
                    <div className="form-group">
                        <label>창고 주소</label>
                        <p>{warehouseInfo.warehouseAddr || '-'}</p>
                    </div>
                </div>
                <div className="modal-actions">
                  <button className="box blue" type="button" onClick={() => setShowSaveConfirmModal(true)}>저장</button>
                </div>
                {/* 저장 확인 모달 */}
                {showSaveConfirmModal && (
                    <ConfirmationModal
                        message="저장하시겠습니까?"
                        onConfirm={handleConfirmSave}
                        onCancel={() => setShowSaveConfirmModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

//모달창 확인 컴포넌트
function ConfirmationModal({ message, onConfirm, onCancel }) {
    return (
        <div className="modal_overlay">
            <div className="modal_confirm">
                {/* 아이콘을 포함한 메시지 출력 영역 */}
                <div className="icon_wrap"><i className="bi bi-exclamation-circle"></i></div>
                <p className='msg'>{message}</p>
                {/* 확인 및 취소 버튼 */}
                <div className="modal-actions">
                    <button className="box red" onClick={onConfirm}>확인</button>
                    <button className="box gray" onClick={onCancel}>취소</button>
                </div>
            </div>
        </div>
    );
};

//주문 출고
function OrderDispatch() { //주문번호1-상품번호1-상품 한 행1-출고1

    // 로딩 상태
    const [loading, setLoading] = useState(false);

    // 출고 데이터
    const [dispatches, setDispatches] = useState([]);

    // 선택된 출고 정보 체크 상태
    const [selectedDispatches, setSelectedDispatches] = useState([]);

    // 전체 선택 체크박스 상태
    const [selectAll, setSelectAll] = useState(false);

    // 페이지
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호

    // 검색어 필터
    const [filter, setFilter] = useState('');

    // 출고 상태 필터 (pending, inProgress, complete)
    const [filterType, setFilterType] = useState('pending');

    // 정렬
    const [sortColumn, setSortColumn] = useState('orderDDeliveryRequestDate');
    const [sortOrder, setSortOrder] = useState('asc');

    // 창고배정 모달창 표시 여부
    const [warehouseAssignmentModal, setWarehouseAssignmentModal] = useState(false);

    // 출고지시 모달창 표시 여부
    const [dispatchInstructionModal, setDispatchInstructionModal] = useState(false);

    // 창고배정 여부
    const [isWarehouseAssigned, setIsWarehouseAssigned] = useState(false);

    // 창고배정된 창고명
    const [assignedWarehouse, setAssignedWarehouse] = useState('');

    // 선택된 출고 데이터 (출고지시 모달에 전달)
    const [selectedDispatchData, setSelectedDispatchData] = useState(null);

    // 출고 데이터 가져오기
    useEffect(() => {
        fetchData();
    }, [filterType, page]);

    const fetchData = () => {
        setLoading(true);
        let url = '';
        if (filterType === 'pending') {
          url = `/api/orderDispatch/pending?page=${page}&size=10`;
        } else if (filterType === 'inProgress') {
          url = `/api/orderDispatch/inProgress?page=${page}&size=10`;
        } else if (filterType === 'complete') {
          url = `/api/orderDispatch/complete?page=${page}&size=10`;
        }
        axios.get(url)
            .then(response => {
                setDispatches(response.data.content);
                setTotalPages(response.data.totalPages);
                setSelectedDispatches(new Array(response.data.content.length).fill(false));
                setSelectAll(false);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching dispatch data:", error);
                setLoading(false);
            });
    };

    // 필터 타입 변경 핸들러
    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
        setPage(1);
    };

    // 검색어 변경 핸들러
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    // 전체 선택 체크박스 핸들러
    const handleSelectAll = () => {
      const newSelectAll = !selectAll;
      setSelectAll(newSelectAll);
      setSelectedDispatches(new Array(dispatches.length).fill(newSelectAll));
    };

    // 개별 선택 체크박스 핸들러
    const handleSelect = (index) => {
        const updatedSelection = [...selectedDispatches];
        updatedSelection[index] = !updatedSelection[index];
        setSelectedDispatches(updatedSelection);
        setSelectAll(updatedSelection.every(Boolean));
    };

    // 출고지시 버튼 클릭 핸들러
    const handleDispatchInstructionClick = () => {
        const selectedDispatchIndices = dispatches
            .map((_, index) => selectedDispatches[index] ? index : -1)
            .filter(index => index !== -1);

        if (selectedDispatchIndices.length === 0) {
            window.showToast("출고 지시할 항목을 선택해주세요.", 'error');
            return;
        }

        if (!isWarehouseAssigned) {
            window.showToast("창고배정이 필요합니다.", 'error');
            return;
        }

        // 출고지시 모달에 전달할 데이터 설정 (첫 번째 선택된 항목)
        setSelectedDispatchData(dispatches[selectedDispatchIndices[0]]);

        setDispatchInstructionModal(true);
    };

    // 창고배정 버튼 클릭 핸들러
    const handleWarehouseAssignmentClick = () => {
        const selectedIndices = dispatches
          .map((_, index) => selectedDispatches[index] ? index : -1)
          .filter(index => index !== -1);

        if (selectedIndices.length === 0) {
          window.showToast("창고 배정할 항목을 선택해주세요.", 'error');
          return;
        }

        setWarehouseAssignmentModal(true);
    };

    // 창고배정 모달에서 저장된 데이터 받기
    const handleWarehouseAssignmentSave = (warehouseData) => {
    setAssignedWarehouse(warehouseData.warehouseName);
    setWarehouseAssignmentModal(false);
    };

    // 출고지시 모달에서 저장된 데이터 받기
    const handleDispatchInstructionSave = (formData) => {
    const selectedDispatchNos = dispatches
        .filter((_, index) => selectedDispatches[index])
        .map(dispatch => dispatch.dispatchNo);

    axios.post('/api/orderDispatch/release', {
        dispatchNos: selectedDispatchNos,
        ...formData
    })
        .then(response => {
        window.showToast("출고 지시가 완료되었습니다.");
        setDispatchInstructionModal(false);
        fetchData();
        })
        .catch(error => {
        console.error('출고 지시 중 에러 발생:', error);
        });
    };

    // Pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    // 체크된 것만 삭제
    const deleteDispatches = () => {
        const selectedNo = dispatches
            .filter((_, index) => selectedDispatch[index])  // 선택된 출보정보만 필터링
            .map(dispatch => dispatch.dispatchNo);  // 선택된 출고정보의 번호를 추출

        if (selectedNo.length === 0) {
            // 체크된 항목이 없을 때는 바로 경고 메시지 표시
            window.showToast("삭제할 출고 항목을 선택해주세요.", 'error');
            return;  // 더 이상 진행하지 않음
        }

        // 선택된 항목이 있을 때만 삭제 확인을 물음
        window.confirmDispatch('선택한 출고 사항을 삭제하시겠습니까?').then(result => {
            if (result) {
                // 서버로 삭제 요청 보내기
                    axios.post('/api/orderDispatch/delete', { dispatchNos: selectedDispatchNos })
                    .then(response => {
                        window.showToast("삭제가 완료 되었습니다.");
                        fetchData();  // 삭제 후 데이터 갱신
                        pageDispatches(1);  // 삭제 후 페이지 갱신
                    })
                    .catch(error => {
                        console.error('삭제 중 발생된 에러 : ', error);
                    });

                console.log('삭제한 출고정보 No : ', selectedNo);  // 선택된 출고정보 번호 로그 출력
            }
        });


    };

    return (
        <Layout currentMenu="orderDispatch">
            <main className="main-content menu_orderDispatch">
                 {/* 제목 영역 */}
                 <div className="menu_title">
                    <div className="sub_title">영업 관리</div>
                    <div className="main_title">주문 출고</div>
                 </div>
                <div className="menu_content">
                    <div className="left"> {/* 검색, 상태필터 */}
                        {/* 검색 영역 */}
                        <div className={`search_box ${filter ? 'has_text' : ''}`}>
                            <label className={`label_floating ${filter ? 'active' : ''}`}>고객사, 상품명, 출고창고명 입력</label>
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                className="box search"
                                value={filter}
                                onChange={handleFilterChange}
                            />
                            {/* 검색어 삭제 버튼 */}
                            {filter && (
                                <button
                                    className="btn-del"
                                    onClick={() => setFilter('')}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>

                        {/* 상태 필터 영역 */}
                        <div className="radio_box">
                            <span>상태</span>
                            <input
                                type="radio"
                                id="pending"
                                name="filterType"
                                value="pending"
                                checked={filterType === 'pending'}
                                onChange={handleFilterTypeChange}
                            />
                            <label htmlFor="pending">출고대기</label>
                            <input
                                type="radio"
                                id="inProgress"
                                name="filterType"
                                value="inProgress"
                                checked={filterType === 'inProgress'}
                                onChange={handleFilterTypeChange}
                            />
                            <label htmlFor="inProgress">출고요청</label>
                            <input
                                type="radio"
                                id="complete"
                                name="filterType"
                                value="complete"
                                checked={filterType === 'complete'}
                                onChange={handleFilterTypeChange}
                            />
                            <label htmlFor="complete">출고완료</label>
                        </div>
                    </div>
                    <div className="right"> {/* 출고지시 */}
                        <button className="box color" onClick={handleDispatchInstructionClick}>
                        출고지시
                        </button>
                    </div>
                    {/* 테이블 영역 */}
                    <div className="table_wrap">
                        <table>
                            {/* 테이블 헤더 */}
                            <thead>
                                <tr>
                                    <th>
                                        <label className="chkbox_label">
                                            <input
                                                type="checkbox"
                                                className="chkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
//                                            <i className="chkbox_icon">
//                                                <i className="bi bi-check-lg"></i>
//                                            </i>
                                        </label>
                                    </th>
                                    <th>번호</th>
                                    <th>
                                        <div className={`order_wrap ${sortColumn === 'customerName' ? 'pending' : ''}`}>
                                            <span>고객사</span>
                                            <button className="btn_order" onClick={() => sortCustomer('customerName')}>
                                                <i className={`bi ${sortColumn === 'customerName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortColumn === 'productName' ? 'pending' : ''}`}>
                                            <span>상품명</span>
                                            <button className="btn_order" onClick={() => sortProduct('productName')}>
                                                <i className={`bi ${sortColumn === 'productName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortColumn === 'deliveryRequestDate' ? 'pending' : ''}`}>
                                            <span>납품 요청일</span>
                                            <button className="btn_order" onClick={() => sortDeliveryRequestDate('deliveryRequestDate')}>
                                                <i className={`bi ${sortColumn === 'deliveryRequestDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortColumn === 'dispatchStatus' ? 'pending' : ''}`}>
                                            <span>출고상태</span>
                                            <button className="btn_order" onClick={() => sortDispatchStatus('dispatchStatus')}>
                                                <i className={`bi ${sortColumn === 'dispatchStatus' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortColumn === 'dispatchStartDate' ? 'pending' : ''}`}>
                                            <span>출고 시작일시</span>
                                            <button className="btn_order" onClick={() => sortDispatchStartDate('dispatchStartDate')}>
                                                <i className={`bi ${sortColumn === 'dispatchStartDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortColumn === 'dispatchEndDate' ? 'pending' : ''}`}>
                                            <span>출고 완료일시</span>
                                            <button className="btn_order" onClick={() => sortDispatchEndDate('dispatchEndDate')}>
                                                <i className={`bi ${sortColumn === 'dispatchEndDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`order_wrap ${sortColumn === 'warehouseName' ? 'pending' : ''}`}>
                                            <span>출고 창고명</span>
                                            <button className="btn_order" onClick={() => sortWarehouseName('warehouseName')}>
                                                <i className={`bi ${sortColumn === 'warehouseName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>

                                </tr>
                            </thead>
                            {/* 테이블 본문 */}
                            <tbody>
                            {/* 데이터 매핑 */}
                            {dispatches.map((dispatch, index) => (
                                <tr key={dispatch.dispatchNo}>
                                <td>
                                    <label className="chkbox_label">
                                    <input
                                        type="checkbox"
                                        className="chkbox"
                                        checked={selectedDispatches[index] || false}
                                        onChange={() => handleSelect(index)}
                                    />
                                    <i className="chkbox_icon">
                                        <i className="bi bi-check-lg"></i>
                                    </i>
                                    </label>
                                </td>
                                    <td>{dispatch.dispatchNo}</td>
                                    <td>{dispatch.customerName || '-'}</td>
                                    <td>{dispatch.productNm || '-'}</td>
                                    <td>{formatDateTime(dispatch.orderDDeliveryRequestDate)}</td>
                                    <td>{dispatch.dispatchStatus === '결제완료' ? '출고대기' : dispatch.dispatchStatus}</td>
                                    <td>{formatDateTime(dispatch.dispatchStartDate)}</td>
                                    <td>{dispatch.dispatchEndDate ? formatDateTime(dispatch.dispatchEndDate) : '-'}</td>
                                    <td>{dispatch.warehouseName || '-'}</td>
                                    <td><button className="box color" onClick={handleWarehouseAssignmentClick}>창고배정</button></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {/* 페이지네이션 */}
                     <div className="pagination-container">
                        <div className="pagination-sub left">
                            {/* 선택 삭제 버튼 */}
                            <button className="box" onClick={deleteDispatches}>
                            <i className="bi bi-trash"></i> 선택 삭제</button>
                        </div>
                        {/* 가운데: 페이지네이션 */}
                        <div className="pagination">
                            {/* '처음' 버튼 */}
                            {currentPage > 1 && (
                                <button className="box icon first" onClick={() => setCurrentPage(1)}>
                                    <i className="bi bi-chevron-double-left"></i>
                                </button>
                            )}

                            {/* '이전' 버튼 */}
                            {currentPage > 1 && (
                                <button className="box icon left" onClick={() => setCurrentPage(currentPage - 1)}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                            )}

                            {/* 페이지 번호 블록 */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
                                const page = startPage + index;
                                return (
                                    page <= totalPages && (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={currentPage === page ? 'box active' : 'box'}
                                        >
                                            {page}
                                        </button>
                                    )
                                );
                            })}

                            {/* '다음' 버튼 */}
                            {currentPage < totalPages && (
                                <button className="box icon right" onClick={() => setCurrentPage(currentPage + 1)}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            )}

                            {/* '끝' 버튼 */}
                            {currentPage < totalPages && (
                                <button className="box icon last" onClick={() => setCurrentPage(totalPages)}>
                                    <i className="bi bi-chevron-double-right"></i>
                                </button>
                            )}
                        </div>
                        <div className="pagination-sub right"></div>
                    </div>
                </div>
            </main>

              {/* 모달 컴포넌트들 */}
              {warehouseAssignmentModal && (
                      <WarehouseAssignmentModal
                          show={warehouseAssignmentModal}
                          onClose={() => setWarehouseAssignmentModal(false)}
                          onSave={handleWarehouseAssignmentSave}
                          dispatchStatus={filterType}
                      />
              )}
              {dispatchInstructionModal && (
                  <DispatchInstructionModal
                      show={dispatchInstructionModal}
                      onClose={() => setDispatchInstructionModal(false)}
                      onSave={handleDispatchInstructionSave}
                      assignedWarehouse={assignedWarehouse}
                      dispatchData={selectedDispatchData}
                  />
              )}

        </Layout>
    );
};

// 최종 렌더링
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <OrderDispatch />
    </BrowserRouter>
);