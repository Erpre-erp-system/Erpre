import React, { useState, useEffect, useMemo} from 'react';
import ReactDOM from 'react-dom/client'; // ReactDOM을 사용하여 React 컴포넌트를 DOM에 렌더링
import '../../../resources/static/css/common/Main.css'; // 공통 CSS 파일
import Layout from "../../layout/Layout"; // 공통 레이아웃 컴포넌트를 임포트 (헤더, 푸터 등)
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/sales/OrderDispatch.css';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; // QR 코드 라이브러리 임포트
import useSWR from 'swr'; //사용자가 탭을 변경하거나 페이지에 다시 돌아올 때 자동으로 최신 데이터가 로드


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
}

// 출고 상태 매핑 함수
const mapDispatchStatus = (orderHStatus, dispatchStatus) => {
    // 상태별 한글 매핑
    const statusMap = {
      'pending': '출고대기',
      'inProgress': '출고요청',
      'complete': '출고완료'
    };

    // orderHStatus가 'approved'인 경우 처음에는 '출고대기'로 표시하고, 이후에는 dispatchStatus에 따라 매핑
    if (orderHStatus === 'approved' && dispatchStatus === 'pending') {
      return statusMap['pending'];
    }

    // dispatchStatus에 따른 한글 매핑 반환
    return statusMap[dispatchStatus] || dispatchStatus;
  }

//창고배정 모달창
function WarehouseAssignmentModal({ show, onClose, onSave, onDelete, dispatchStatus }) {

    const [isEditMode, setIsEditMode] = useState(false); // 편집 모드 여부
    const [editableWarehouse, setEditableWarehouse] = useState({}); // 편집 가능한 창고 데이터
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false); // 저장 확인 모달 표시 여부
    const [warehouseManagers, setWarehouseManagers] = useState([]); // 창고명->창고담당자
    const [warehouses, setWarehouses] = useState([]); // 창고목록
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
          fetchWarehouses(); // 창고 목록 가져오기
          setErrors({
            warehouseName: '',
            warehouseManagerName: '',
          });
        }
      }, [show]);

      const fetchWarehouses = async () => {
          try {
              const response = await axios.get('/api/warehouse/list');
              setWarehouses(response.data);
          } catch (error) {
              console.error('Error fetching warehouse list:', error);
          }
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
                        <button className="btn_close" onClick={onClose}>
                            <i className="bi bi-x-lg"></i>
                        </button> {/* 모달 닫기 버튼 */}
                    </div>

                    <div className="modal-content">
                        <div className="detail-form">
                            <div className="form-group">
                                <label>창고명<span className='span_red'>*</span></label>
                                <select
                                    name="warehouseName"
                                    value={editableWarehouse.warehouseName || ''}
                                    onChange={handleWarehouseNameChange}
                                    className={errors.warehouseName ? 'invalid' : ''}
                                >
                                    <option value="">선택</option>
                                    {warehouses.map((warehouse) => (
                                        <option key={warehouse.warehouseNo} value={warehouse.warehouseName}>
                                            {warehouse.warehouseName}
                                        </option>
                                    ))}
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
                </div>
            </div>
        );
}

//출고지시 모달창
function DispatchInstructionModal ({ show, onClose, assignedWarehouse, dispatchData, onStatusChange }) {
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

    });


    //모달 알림창 2번 뜨는거 방지
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (show && dispatchData) {
          setForm({
              customerName: dispatchData.customerName,
              customerAddr: dispatchData.customerAddr,
              warehouseName: dispatchData.warehouseName || '',
              warehouseManagerName: dispatchData.warehouseManagerName || '',
              orderDDeliveryRequestDate: formatDateTime(dispatchData.orderDDeliveryRequestDate),
              productNm: dispatchData.productNm,
              orderDPrice: dispatchData.orderDPrice,
              orderDQty: dispatchData.orderDQty,
              orderDTotalPrice: dispatchData.orderDTotalPrice,

          });
        }
      }, [show, dispatchData]);


   // 창고 배정 모달 열림 상태 관리
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);

    // 창고 배정 모달 열기 함수
    const handleWarehouseModalOpen = () => {
    setShowWarehouseModal(true);
    };

    // 창고 배정 모달 닫기 함수
    const handleWarehouseModalClose = () => {
    setShowWarehouseModal(false);
    };

    // 창고 배정 모달에서 저장할 때 호출되는 함수
    const handleWarehouseAssignmentSave = (warehouseData) => {
    setForm(prevForm => ({
        ...prevForm,
        warehouseName: warehouseData.warehouseName, // 선택한 창고명 업데이트
        warehouseManagerName: warehouseData.warehouseManagerName, // 선택한 창고 담당자명 업데이트
    }));
    setShowWarehouseModal(false); // 모달 닫기
    };

    //출고 확인 함수
    const handleDispatchConfirm = () => {
        axios.post('/api/orderDispatch/updateStatus', {
            dispatchNo: dispatchData.dispatchNo,
            newStatus: 'inProgress'
        })
        .then(response => {
            window.showToast("출고 지시가 완료되었습니다.");
            setShowConfirmModal(false); // 확인 모달 닫기
            onClose(); // 출고지시 모달 닫기

            // 상태 변경 알림
            if (onStatusChange) {
                onStatusChange(dispatchData.dispatchNo, 'inProgress');
            }
        })
        .catch(error => {
            window.showToast("출고 지시 중 에러가 발생했습니다.", 'error');
        });
    };

    // 출고 버튼 클릭 시 확인 모달 표시
    const handleDispatchClick = () => {
        setShowConfirmModal(true);
    };

    // 다운로드 옵션 표시 여부 상태 (pdf,excel)
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    // 다운로드 버튼 클릭 핸들러 (pdf,excel)
    const handleDownloadClick = () => {
        setShowDownloadOptions(prev => !prev);
    };

   // PDF 다운로드 핸들러
    const handlePdfDownload = () => {
        axios({
            url: `/api/orderDispatch/export/pdf/${dispatchData.dispatchNo}`,
            method: 'GET',
            responseType: 'blob',
        })
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `dispatch_${dispatchData.dispatchNo}.pdf`);
            document.body.appendChild(link);
            link.click();
        })
        .catch((error) => {
            console.error('Error downloading PDF:', error);
        });

        setShowDownloadOptions(false); // 옵션 선택 후 닫기
    };

    // Excel 다운로드 핸들러
    const handleExcelDownload = () => {
        axios({
            url: `/api/orderDispatch/export/excel/${dispatchData.dispatchNo}`,
            method: 'GET',
            responseType: 'blob',
        })
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `dispatch_${dispatchData.dispatchNo}.xlsx`);
            document.body.appendChild(link);
            link.click();
        })
        .catch((error) => {
            console.error('Error downloading Excel:', error);
        });

        setShowDownloadOptions(false); // 옵션 선택 후 닫기
    };

    // QR 코드에 표시할 데이터 생성
    const qrCodeValue = `품목명: ${dispatchData ? dispatchData.productNm : ''}, 수량: ${dispatchData ? dispatchData.orderDQty : ''}`;
    // QR url 연결
    const qrCodeUrl = `http://localhost:8787/dispatch/${dispatchData ? dispatchData.dispatchNo : ''}`;


    // QR코드 모달 표시 상태
    const [showQrModal, setShowQrModal] = useState(false);

    // QR 코드 생성 핸들러
    const handleQrCode = () => {
        const qrData = `dispatchNo:${dispatchData.dispatchNo}`;
        setForm(prevForm => ({
            ...prevForm,
            qrCodeData: qrData
        }));
        setShowQrModal(true); // QR코드 모달 표시
    };

    // QR코드 모달 닫기 핸들러
    const handleCloseQrModal = () => {
        setShowQrModal(false);
    };


    if (!show) return null; // 모달 표시 여부 체크

    return (
        <div className="modal_overlay">
            <div className="modal_container dispatch">

                <button className="btn_close" onClick={onClose}><i className="bi bi-x-lg"></i></button>

                <div className="dispatch-wrap">
                {/* 출고증 제목 */}
                    <div className="dispatch-note">
                        <h2>출고증</h2>
                    </div>

                    <div className="customer-supplier">

                        {/* 고객사 정보 */}
                        <div className="customer-info">
                            <table>
                                <tbody>
                                <tr>
                                    <th>고객사 이름</th>
                                    <td>{form.customerName}</td>
                                </tr>
                                <tr>
                                    <td colSpan="2" className="qr-modal-content">
                                        <QRCodeCanvas value={qrCodeValue} />
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 공급자 정보 */}
                        <div className="supplier-info">
                            <table>
                                <tbody>
                                    <tr>
                                        <th>공급자 상호</th>
                                        <td>이케아</td>
                                    </tr>
                                    <tr>
                                        <th>공급자 주소</th>
                                        <td>이케아</td>
                                    </tr>
                                    <tr>
                                        <th>공급자 대표성명</th>
                                        <td>박인욱</td>
                                    </tr>
                                    <tr>
                                        <th>공급자 전화번호</th>
                                        <td>02-111-5555</td>
                                    </tr>
                                    <tr>
                                        <th>공급자 사업자 등록번호</th>
                                        <td>123-456-7890</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                        {/* 출하관련 정보 */}
                        <div className="dispatch-info">
                            <table>
                                <tbody>
                                    <tr>
                                        <th>납품지 주소</th>
                                        <td>{form.customerAddr}</td>
                                    </tr>
                                    <tr>
                                        <th>납품 요청일</th>
                                        <td>{form.orderDDeliveryRequestDate}</td>
                                    </tr>
                                    <tr>
                                        <th>출하창고</th>
                                        <td>{form.warehouseName}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 상품관련 정보 */}
                        <div className="product-info">
                            <table>
                                <thead>
                                    <tr>
                                        <th>품목명</th>
                                        <th>수량</th>
                                        <th>출고단가</th>
                                        <th>총금액</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{form.productNm}</td>
                                        <td>{form.orderDQty}EA</td>
                                        <td>{Number(form.orderDPrice).toLocaleString()}</td>
                                        <td>{Number(form.orderDTotalPrice).toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* 인수 */}
                        <div className="acceptance">
                            <table>
                                <tbody>
                                    <tr>
                                        <th>인수</th>
                                        <td>인</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                </div>

                <div className="download-actions">
                    {/* 다운로드 버튼 */}
                    <div className={`download-section ${showDownloadOptions ? 'show' : ''}`} >
                        <button className="dropbtn" onClick={handleDownloadClick}>다운로드</button>
                        {showDownloadOptions && (
                            <div className="dropdown-content">
                                <button className="pdfDownload" onClick={handlePdfDownload}>PDF</button>
                                <button className="excelDownload" onClick={handleExcelDownload}>Excel</button>
                            </div>
                        )}
                    </div>

                    {/* 출고 버튼 */}
                    <div className="modal-actions">
                        <button className="box blue" type="button"
                        onClick={handleDispatchClick}>출고</button>
                    </div>
                </div>

                   {/* 출고 확인 모달 */}
                    {showConfirmModal && (
                        <ConfirmationModal
                            message="출고 지시 하시겠습니까?"
                            onConfirm={handleDispatchConfirm}
                            onCancel={() => setShowConfirmModal(false)}
                        />
                    )}

                    {showWarehouseModal && (
                        <WarehouseAssignmentModal
                            show={showWarehouseModal}
                            onClose={handleWarehouseModalClose}
                            onSave={handleWarehouseAssignmentSave}
                        />
                    )}

             </div>
        </div>
    );
}

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
}

//주문 출고
function OrderDispatch() { //주문번호1-출고1

    // 출고 데이터
    const [dispatches, setDispatches] = useState([]);

    // 검색어 필터
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('customer'); // 검색 필드 추가

    // 출고 상태 필터 (pending, inProgress, complete)
    const [filterType, setFilterType] = useState('pending');

    // 정렬
    const [sortColumn, setSortColumn] = useState('orderDDeliveryRequestDate');
    const [sortOrder, setSortOrder] = useState('asc');

    // 페이지
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10; // 페이지당 아이템 수

    // 선택된 출고 정보 체크 상태
    const [selectedDispatches, setSelectedDispatches] = useState([]);

    // 전체 선택 체크박스 상태
    const [selectAll, setSelectAll] = useState(false);

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


    // SWR의 fetcher 함수
    const fetcher = url => axios.get(url).then(res => res.data);

    // SWR 사용하여 데이터 fetching
      const { data, error, isValidating, mutate } = useSWR(
        () => {
          let url = '';
          if (filterType === 'pending') {
            url = `/api/orderDispatch/pending?page=${page}&size=${itemsPerPage}`;
          } else if (filterType === 'inProgress') {
            url = `/api/orderDispatch/inProgress?page=${page}&size=${itemsPerPage}`;
          } else if (filterType === 'complete') {
            url = `/api/orderDispatch/complete?page=${page}&size=${itemsPerPage}`;
          }
          return url;
        },
        fetcher,
        {
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
        }
      );

   // 데이터 로딩 상태 설정
    const loading = !data && !error;

      // 데이터 설정
      useEffect(() => {
        if (data) {
          // deleteYN이 'N'인 항목만 화면에 반영
          const filteredData = data.content.filter(dispatch => dispatch.dispatchDeleteYn === 'N');
          setDispatches(filteredData);
          setTotalPages(data.totalPages);
          setSelectedDispatches(new Array(filteredData.length).fill(false));
          setSelectAll(false);
        }
      }, [data]);

    // 에러 처리
    useEffect(() => {
      if (error) {
        console.error("Error fetching dispatch data:", error);
      }
    }, [error]);


    // 필터링된 dispatches 생성
    const filteredDispatches = useMemo(() => {
       let filtered = dispatches.filter(dispatch => {
           const isIncludedByFilterType =
               dispatch.dispatchStatus === filterType && dispatch.dispatchDeleteYn === 'N';

        // 검색어 필터 적용
        const searchText = searchTerm.toLowerCase();
        const isIncludedBySearch =
            (dispatch.customerName ? dispatch.customerName.toLowerCase() : '').includes(searchText) ||
            (dispatch.productNm ? dispatch.productNm.toLowerCase() : '').includes(searchText);

    // 모든 조건이 만족하는 경우에만 포함
    return isIncludedByFilterType && isIncludedBySearch;
    });

    // 정렬 로직 적용
    filtered.sort((a, b) => {
        let aValue = a[sortColumn] ? a[sortColumn].toString() : '';
        let bValue = b[sortColumn] ? b[sortColumn].toString() : '';

        // 숫자 컬럼 처리
        if (sortColumn === 'dispatchNo') {
            aValue = Number(aValue);
            bValue = Number(bValue);
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
            return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
    });

    return filtered;
    }, [dispatches, filterType, searchTerm, sortColumn, sortOrder]);

    // 출고 정렬 함수
    const sortDispatches = (column) => {
        const order = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortOrder(order);
    };


    // 필터 타입 변경 핸들러 (출고 상태 필터)
    const handleFilterTypeChange = (e) => {
        setFilterType(e.target.value);
        setPage(1);
    };

    // 검색 필드 변경 핸들러
    const handleSearchFieldChange = (e) => {
        setSearchField(e.target.value);
    };

    // 검색어 변경 핸들러
    const handleSearchTermChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // 전체 선택 체크박스 핸들러
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedDispatches(new Array(filteredDispatches.length).fill(newSelectAll));
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
        const selectedDispatchIndices = filteredDispatches
            .map((_, index) => selectedDispatches[index] ? index : -1)
            .filter(index => index !== -1);

        if (selectedDispatchIndices.length === 0) {
            window.showToast("출고 지시할 항목을 선택해주세요.", 'error');
            return;
        }

        // 선택된 출고 건들에 창고 배정이 되어 있는지 확인
       const selectedDispatchesHaveWarehouse = selectedDispatchIndices.every(index => {
            const dispatch = filteredDispatches[index];
            return dispatch.warehouseName && dispatch.warehouseName.trim() !== '';
        });

        if (!selectedDispatchesHaveWarehouse) {
            window.showToast("창고 배정이 필요합니다.", 'error');
            return;
        }

        setSelectedDispatchData(filteredDispatches[selectedDispatchIndices[0]]); //모달이 열릴 때, 선택된 출고 데이터가 출고지시 모달에 표시
        setDispatchInstructionModal(true); //출고지시 모달 on
    };

    // 창고배정 버튼 클릭 핸들러
    const handleWarehouseAssignmentClick = () => {
        setWarehouseAssignmentModal(true);
    };

    // 창고 배정 후 dispatches 상태 업데이트
    const handleWarehouseAssignmentSave = (warehouseData) => {
        const selectedDispatchNos = filteredDispatches
            .map((dispatch, index) => selectedDispatches[index] ? dispatch.dispatchNo : null)
            .filter(no => no !== null);

        if (selectedDispatchNos.length === 0) {
            window.showToast("창고 배정할 출고 항목을 선택해주세요.", 'error');
            return;
        }

        // 백엔드로 창고 배정 정보 전송
        axios.post('/api/orderDispatch/assignWarehouse', {
            dispatchNos: selectedDispatchNos,
            warehouseName: warehouseData.warehouseName,
            warehouseManagerName: warehouseData.warehouseManagerName,
        })
        .then(response => {
            window.showToast("창고 배정이 완료되었습니다.");

              // 데이터 갱신
              mutate();
              setWarehouseAssignmentModal(false);
            })
            .catch(error => {
              console.error('창고 배정 중 에러 발생:', error);
            });
    };


      // 출고지시 모달에서 저장된 데이터 받기
      const handleDispatchInstructionSave = (formData) => {
        const selectedDispatchNos = filteredDispatches
          .filter((_, index) => selectedDispatches[index])
          .map(dispatch => dispatch.dispatchNo);

        axios.post('/api/orderDispatch/release', {
          dispatchNos: selectedDispatchNos,
          ...formData
        })
        .then(response => {
          setDispatchInstructionModal(false);

          // 데이터 갱신
          mutate();
        })
        .catch(error => {
          console.error('출고 지시 중 에러 발생:', error);
        });
      };


      // 상태 변경 콜백 함수
      const handleStatusChange = (dispatchNo, newStatus) => {
        // 상태 변경 후 데이터 갱신
        mutate();
        // 필터 타입을 'inProgress'로 변경하여 출고요청 탭으로 이동
        setFilterType('inProgress');
      };


    // Pagination
    const PageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

     // 체크된 것만 삭제
     const deleteDispatches = () => {
       const selectedDispatchNos = filteredDispatches
         .filter((_, index) => selectedDispatches[index]) // 체크된 항목의 dispatchNo만 가져옴
         .map(dispatch => dispatch.dispatchNo);

       if (selectedDispatchNos.length === 0) {
         window.showToast("삭제할 출고 항목을 선택해주세요.", 'error');
         return;
       }

       window.confirmCustom('선택한 출고 사항을 삭제하시겠습니까?').then(result => {
         if (result) {
           axios.post('/api/orderDispatch/delete', selectedDispatchNos)
             .then(response => {
               window.showToast("삭제가 완료 되었습니다.");

               // 데이터 갱신: deleteYn이 Y로 바뀐 항목을 화면에서 제외하기 위해 갱신
               mutate();
               setPage(1); // 첫 페이지로 이동하여 갱신된 목록 표시
             })
             .catch(error => {
               console.error('삭제 중 발생된 에러 : ', error);
             });
         }
       });
     };


    return (
        <Layout currentMenu="orderDispatch">
             <main className={`main-content menu_orderDispatch `}>
                 {/* 제목 영역 */}
                 <div className="menu_title">
                    <div className="sub_title">영업 관리</div>
                    <div className="main_title">주문 출고</div>
                 </div>
                <div className="menu_content">
                    <div className="search_wrap">
                        <div className="left"> {/* 검색, 상태필터 */}
                        {/* 검색 영역 */}
                        <select className="box" onChange={handleSearchFieldChange} value={searchField}>
                            value={filterType}
                            <option value="customer">고객사</option>
                            <option value="productNm">상품명</option>
                            <option value="warehouse">출고창고명</option>

                        </select>

                        <div className="search_box">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                className="box search"
                                placeholder="검색어 입력"
                                value={searchTerm}
                                onChange={handleSearchTermChange}
                            />
                        </div>

                        <br />
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
                </div>

                    {/* 테이블 영역 */}
                    <div className="table_wrap">
                        <table>
                            {/* 테이블 헤더 */}
                            <thead>
                                <tr>
                                    <th className="checkbox-input">
                                        <label className="chkbox_label">
                                            <input
                                                type="checkbox"
                                                className="chkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
                                            <i className="chkbox_icon">
                                                <i className="bi bi-check-lg"></i>
                                            </i>
                                        </label>
                                    </th>
                                    <th>
                                        <div className={`dispatch_wrap ${sortColumn === 'customerName' ? 'pending' : ''}`}>
                                            <span>고객사</span>
                                            <button className="btn_order" onClick={() => sortDispatches('customerName')}>
                                                <i className={`bi ${sortColumn === 'customerName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>

                                        </div>
                                    </th>
                                    <th>
                                        <div className={`dispatch_wrap ${sortColumn === 'productNm' ? 'pending' : ''}`}>
                                            <span>상품명</span>
                                            <button className="btn_order" onClick={() => sortDispatches('productNm')}>
                                                <i className={`bi ${sortColumn === 'productNm' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`dispatch_wrap ${sortColumn === 'deliveryRequestDate' ? 'pending' : ''}`}>
                                            <span>납품 요청일</span>
                                            <button className="btn_order" onClick={() => sortDispatches('deliveryRequestDate')}>
                                                <i className={`bi ${sortColumn === 'deliveryRequestDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <span>출고상태</span>
                                    </th>
                                    <th>
                                        <div className={`dispatch_wrap ${sortColumn === 'dispatchStartDate' ? 'pending' : ''}`}>
                                            <span>출고 시작일시</span>
                                            <button className="btn_order" onClick={() => sortDispatches('dispatchStartDate')}>
                                                <i className={`bi ${sortColumn === 'dispatchStartDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`dispatch_wrap ${sortColumn === 'dispatchEndDate' ? 'pending' : ''}`}>
                                            <span>출고 완료일시</span>
                                            <button className="btn_order" onClick={() => sortDispatches('dispatchEndDate')}>
                                                <i className={`bi ${sortColumn === 'dispatchEndDate' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th>
                                        <div className={`dispatch_wrap ${sortColumn === 'warehouseName' ? 'pending' : ''}`}>
                                            <span>출고 창고명</span>
                                            <button className="btn_order" onClick={() => sortDispatches('warehouseName')}>
                                                <i className={`bi ${sortColumn === 'warehouseName' ? (sortOrder === 'desc' ? 'bi-arrow-down' : 'bi-arrow-up') : 'bi-arrow-up'}`}></i>
                                            </button>
                                        </div>
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>

                            {/* 테이블 본문 */}
                            <tbody>
                                {loading ? (
                                    <tr className="tr_empty">
                                        <td colSpan={10}>
                                            <div className="loading">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (filteredDispatches.length === 0) ? (
                                    <tr className="tr_empty">
                                        <td colSpan={10}>
                                            <div className="no_data">
                                                <i className="bi bi-exclamation-triangle"></i>조회된 결과가 없습니다.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDispatches.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((dispatch, index) => (
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
                                            <td>{dispatch.customerName || '-'}</td>
                                            <td>{dispatch.productNm || '-'}</td>
                                            <td>{formatDateTime(dispatch.orderDDeliveryRequestDate)}</td>
                                            <td>{mapDispatchStatus(dispatch.orderHStatus, dispatch.dispatchStatus)}</td>
                                            <td>{dispatch.dispatchStartDate ? formatDateTime(dispatch.dispatchStartDate) : '-'}</td>
                                            <td>{dispatch.dispatchEndDate ? formatDateTime(dispatch.dispatchEndDate) : '-'}</td>
                                            <td>{dispatch.warehouseName && dispatch.warehouseName.trim() !== '' ? dispatch.warehouseName : '-'}</td>
                                            <td>
                                                <button className="box color" onClick={handleWarehouseAssignmentClick}>
                                                    창고배정
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 페이지네이션 영역*/}
                     <div className="pagination-container">
                         <div className="pagination-sub left">
                             {/* 선택 삭제 버튼 */}
                             <button className="box" onClick={deleteDispatches}>
                                 <i className="bi bi-trash"></i> 선택 삭제
                             </button>
                         </div>

                         {/* 페이지네이션 */}
                         <div className="pagination">
                            {page > 1 && (
                                <>
                                    <button className="box icon first" onClick={() => PageChange(1)}>
                                        <i className="bi bi-chevron-double-left"></i>
                                    </button>
                                    <button className="box icon left" onClick={() => PageChange(page - 1)}>
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                </>
                            )}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                                const startPage = Math.floor((page - 1) / 5) * 5 + 1;
                                const currentPage = startPage + index;
                                return (
                                    currentPage <= totalPages && (
                                        <button
                                            key={currentPage}
                                            onClick={() => PageChange(currentPage)}
                                            className={currentPage === page ? 'box active' : 'box'}
                                        >
                                            {currentPage}
                                        </button>
                                    )
                                );
                            })}
                            {page < totalPages && (
                                <>
                                    <button className="box icon right" onClick={() => PageChange(page + 1)}>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                    <button className="box icon last" onClick={() => PageChange(totalPages)}>
                                        <i className="bi bi-chevron-double-right"></i>
                                    </button>
                                </>
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
                      onStatusChange={handleStatusChange} // 상태 변경 콜백 전달
                  />
              )}

        </Layout>
    );
}

// 최종 렌더링
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <OrderDispatch />
    </BrowserRouter>
);