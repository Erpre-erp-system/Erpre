import React, { useState, useEffect, useMemo} from 'react';
import ReactDOM from 'react-dom/client'; // ReactDOM을 사용하여 React 컴포넌트를 DOM에 렌더링
import '../../../resources/static/css/common/Main.css'; // 공통 CSS 파일
import Layout from "../../layout/Layout"; // 공통 레이아웃 컴포넌트를 임포트 (헤더, 푸터 등)
import { BrowserRouter } from "react-router-dom";
import '../../../resources/static/css/sales/OrderDispatch.css';

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

//출고지시 모달창
const DispatchInstructionModal = ({ show, onClose, onSave, warehouseData,assignedWarehouse }) => {
    const [form, setForm] = useState({
      //고객사
      customerName: customer.customerName, // 고객사 이름 - customer
      customerAddr: customer.customerAddr, // 고객사 주소(납품지주소) - customer 
      //출하창고
      warehouseName: '', //창고명 - warehouse
      warehouseManagerName: '', //창고명 담당자 - warehouse
      orderDDeliveryRequestDate: orderDetail.orderDDeliveryRequestDate, //납품요청일 - orderD
      //상품(orderH)
      productNm: product.productNm, //품목명 - product
      orderDPrice: orderDetail.orderDPrice, //출고단가 - orderD
      orderDQty: orderDetail.orderDQty, //수량(단위포함) - orderD
      orderDTotalPrice: orderDetail.orderDTotalPrice, //총금액 - orderD
      //qr코드
      qrCodeData: qr_code.qrCodeData //qr코드 데이터 - qr_code
    });


    //모달 알림창 2번 뜨는거 방지
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    //모달이 열릴 때마다 폼 초기화
    useEffect(() => {
        if (show) {
            if (warehouseData) {
                setForm(warehouseData); // 기존 고객 데이터를 폼에 반영
            } else {
                //새로운 출고지시 하면 폼 초기화
                setForm({
                    //고객사
                    customerName: customer.customerName, // 고객사 이름 - customer
                    customerAddr: customer.customerAddr, // 고객사 주소(납품지주소) - customer 
                    //출하창고
                    warehouseName: '', //창고명 - warehouse
                    warehouseManagerName: '', //창고명 담당자 - warehouse
                    orderDDeliveryRequestDate: orderDetail.orderDDeliveryRequestDate, //납품요청일 - orderD
                    //상품(orderH)
                    productNm: product.productNm, //품목명 - product
                    orderDPrice: orderDetail.orderDPrice, //출고단가 - orderD
                    orderDQty: orderDetail.orderDQty, //수량(단위포함) - orderD
                    orderDTotalPrice: orderDetail.orderDTotalPrice, //총금액 - orderD
                    //qr코드
                    qrCodeData: qr_code.qrCodeData //qr코드 데이터 - qr_code


                });
            }
        }
    }, [show, customerData]);

    //창고배정에서 선택한 창고명으로 저장
    useEffect(() => {
        if (show) {
          setForm({
            warehouseName: assignedWarehouse || '',
          });
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
                <Input
                    name="customerName"
                    value={form.customerName}
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
                <Input
                    name="customerAddr"
                    value={form.customerAddr}
                />
                </div>
                <div className="form-group">
                    <label>출하창고</label>
                <Input
                    name="warehouseName"
                    value={form.warehouseName}
                />
                </div>
                <div className="form-group">
                    <label>납품 요청일</label>
                <Input
                    name="orderDDeliveryRequestDate"
                    value={form.orderDDeliveryRequestDate}
                />
                </div>
                <div className="form-group">
                    <label>품목명</label>
                <Input
                    name="productNm"
                    value={form.productNm}
                />
                </div>
                <div className="form-group">
                    <label>출고단가</label>
                <Input
                    name="orderDPrice"
                    value={form.orderDPrice}
                />
                </div>
                <div className="form-group">
                    <label>수량(단위포함)</label>
                <Input
                    name="orderDQty"
                    value={form.orderDQty}
                />
                </div>
                <div className="form-group">
                    <label>총금액</label>
                <Input
                    name="orderDTotalPrice"
                    value={form.orderDTotalPrice}
                />
                </div>
                <div className="form-group">
                    <label>수량</label>
                <Input
                    name="totalOrderDQty"
                    value={form.totalOrderDQty}
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
                        <option>pdf로 다운받기</option>
                        <option>excel로 다운받기</option>
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
function WarehouseAssignmentModal({ show, onClose, warehouse, onSave, onDelete }) {

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

    // 모달이 열릴 때마다 편집 모드 초기화 및 창고 데이터 설정
    useEffect(() => {
        if (show) {
            setIsEditMode(false); // 편집 모드 초기화
            setEditableWarehouse(warehouse || {}); // 기존 창고 데이터 설정
            setErrors({
                warehouseName: '',
                warehouseManagerName: '',
            }); // 에러 메시지 초기화
        }
    }, [show, warehouse]);

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

    const handleWarehouseNameChange = async (e) => {
        const selectedWarehouseName = e.target.value;
        setEditableWarehouse({ ...editableWarehouse, warehouseName: selectedWarehouseName });
        
        // 선택된 창고 정보 가져오기
        const response = await axios.get(`/api/warehouse/info?warehouseName=${selectedWarehouseName}`);
        setWarehouseInfo(response.data);
      
        // 창고 담당자 목록도 업데이트
        // ...
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

        if (!editableWarehouse.warsehouseName.trim()) {
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

    if (!show || !warehouse) return null; // 모달 표시 여부 체크

    return (
        <div className="modal_overlay">
            <div className="modal_container dispatch">
                <div className="header">
                    <div>{isEditMode ? '창고 정보 수정' : '창고 배정'}</div>
                    <button className="btn_close" onClick={onClose}><i className="bi bi-x-lg"></i></button> {/* 모달 닫기 버튼 */}
            </div>
            <div className="detail-form">
                    <div className="form-group">
                        <label>창고명{isEditMode && (<span className='span_red'>*</span>)}</label>
                        <select 
                            name="warehouseName" 
                            value={editableWarehouse.warehouseName || ''} 
                            onChange={handleWarehouseNameChange}
                            disabled={!isEditMode}
                            className={errors.warehouseName ? 'invalid' : ''}>
                            {errors.warehouseName && (
                                <p className="field_error_msg">
                                <i className="bi bi-exclamation-circle-fill"></i>
                            {errors.warehouseName}</p>)}
                                <option value="">선택</option>
                                <option value="01">01. 본사창고</option>
                                <option value="02">02. 천안창고</option>
                                <option value="03">03. 인천창고</option>
                                <option value="04">04. 대전창고</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>창고 담당자명{isEditMode && (<span className='span_red'>*</span>)}</label>
                        <select 
                            name="warehouseManagerName" 
                            value={editableWarehouse.warehouseManagerName || ''} 
                            onChange={handleChange}
                            disabled={!isEditMode}
                            className={errors.warehouseManagerName ? 'invalid' : ''}>
                            {errors.warehouseManagerName && (
                                <p className="field_error_msg">
                                <i className="bi bi-exclamation-circle-fill"></i>
                            {errors.warehouseName}</p>)}
                            {/* warehouseManagers 상태를 기반으로 옵션 렌더링 */}
                            {warehouseManagers.map(manager => (
                                <option key={manager.id} value={manager.name}>{manager.name}</option>
                            ))}   
                        </select>
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
                    {isEditMode ? (
                        <button className="box blue" type="button" onClick={handleSave}>저장</button>
                    ) : (
                        <>
                            {/* 삭제된 상태에 따라 조건부 렌더링 */}
                            {editableWarehouse.warehouseDeleteYn !== 'Y' ? (
                                <>
                                    <button className="box blue" type="button" onClick={toggleEditMode}>수정</button>
                                    <button className="box red" type="button" onClick={onDelete}>삭제</button>
                                </>
                            ) : (<></>)}
                        </>
                    )}
                </div>
                {/* 수정 확인 모달 */}
                {showEditConfirmModal && (
                    <ConfirmationModal
                        message="수정하시겠습니까?"
                        onConfirm={handleConfirmEdit}
                        onCancel={() => setShowEditConfirmModal(false)}
                    />
                )}

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
    //로딩 상태 추가
    const [loading, setLoading] = useState(false);

    //정보 저장
    const [dispatches, setDispatches] = useState([]); // 전체 출고 리스트
    const [selectedDispatches, setSelectedDispatches] = useState(null); // 선택된 출고 정보 전체
    const [selectedDispatch, setSelectedDispatch] = useState([]); // 선택된 출고 번호 리스트(삭제처리를 위한)

    //페이지
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    
    //검색어 필터
    const [currentView, setCurrentView] = useState('dispatchesN');
    const [search, setSearch] = useState();
    const [SearchedDispatch, setSearchedDispatch] = useState([]); //검색한 사항을 배열로 저장
    
    //창고배정 모달창
    const [warehouseAssignmentModal, setWarehouseAssignmentModal] = useState(false);

    // 출고 상태(출고 대기, 출고 요청, 출고 완료) 구분
    const [filterType, setFilterType] = useState('pending'); 

    //정렬 기능
    const [sortColumn, setSortColumn] = useState('orderDDeliveryRequestDate'); // 기본적으로 정렬 열 orderDDeliveryRequestDate 설정
    const [sortOrder, setSortOrder] = useState('asc'); // 기본 정렬은 오름차순

    //순서보장 : 창고배정->출고지시
    const [isWarehouseAssigned, setIsWarehouseAssigned] = useState(false);

    //창고배정->출고증 창고명 통일
    //*부모 컴포넌트(OrderDispatch)에서 창고배정 모달에서 저장된 창고명을 상태로 관리하고, 이를 출고지시 모달에 prop으로 전달
    //*창고배정 모달에서 저장된 데이터를 부모 컴포넌트로 전달하고, 출고지시 모달에서 해당 데이터를 표시
    const [assignedWarehouse, setAssignedWarehouse] = useState(null);

    // 창고배정 모달에서 저장된 데이터 받기
    const handleWarehouseAssignmentSave = (warehouseData) => {
        setAssignedWarehouse(warehouseData.warehouseName);
        setIsWarehouseAssigned(true); //순서보장 : 창고배정->출고지시
    };

    // 출고지시 버튼 클릭 시
    const handleDispatchInstruction = () => {
        if (!isWarehouseAssigned) {
        window.showToast("창고배정이 필요합니다.", 'error');
        return;
        }
        setDispatchInstructionModal(true);
    };

    // 출고 데이터 가져오기 - 초기화면은 pending만
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true); // 로딩 시작
        axios.get('/api/orderdispatch/getList')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setWarehouses(response.data);
                    setLoading(false); // 로딩 종료
                } else {
                    console.error("Error: Expected an array but got ", typeof response.data);
                }
            })
            .catch(error => {
                console.error("Error fetching warehouse data:", error);
                setLoading(false); // 로딩 종료
            });
    };

    //상태
    //출고 대기
    const pending = (page) => { // 
        setFilterType('pending');
        setLoading(true); //로딩시작
        axios.get(`/api/pending?page=${page}&size=20`)
        .then(response => {
            console.log('응답 데이터:', response.data);
            setDispatches(response.data.content);
            setTotalPages(response.data.totalPages);
            setSelectedDispatches(new Array(response.data.content.length).fill(false));
            setLoading(false); // 로딩 종료
        })
    };
    //출고 요청
    const inProgress = (page) => {
        setFilterType('inProgress')
        setLoading(true); //로딩시작
        axios.get(`/api/inProgress?page=${page}&size=20`)
        .then(response => {
            console.log('응답 데이터:', response.data);
            setDispatches(response.data.content);
            setTotalPages(response.data.totalPages);
            setSelectedDispatches(new Array(response.data.content.length).fill(false));
            setLoading(false); // 로딩 종료
        })
    };
    //출고 완료
    const complete = (page) => {
        setFilterType('complete')
        setLoading(true); //로딩시작
        axios.get(`/api/complete?page=${page}&size=20`)
        .then(response => {
            console.log('응답 데이터:', response.data);
            setDispatches(response.data.content);
            setTotalPages(response.data.totalPages);
            setSelectedDispatches(new Array(response.data.content.length).fill(false));
            setLoading(false); // 로딩 종료
        })
    };

    //출고 상태 변경(pending->in progress)
    const handleDispatchInstructionSave = (formData) => {
        axios.post('/api/orderdispatch/dispatch', {
        dispatchNo: selectedDispatchNo,
        ...formData
        })
        .then(response => {
        window.showToast("출고 지시가 완료되었습니다.");
        fetchData();
        })
        .catch(error => {
        console.error('출고 지시 중 에러 발생:', error);
        });
    };

    //전체 체크박스
    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedEmployees(new Array(Dispatches.length).fill(newSelectAll));
    };

    //개별 체크박스
    const handleSelect = (index) => {
    const updatedSelection = [...selectedDispatches];
    updatedSelection[index] = !updatedSelection[index];
    setSelectedDispatches(updatedSelection);

        if (updatedSelection.includes(false)) {
            setSelectAll(false);
        } else {
            setSelectAll(true);
        }
    };

    // 선택된 출고 번호 가져오기
    const selectedDispatchNo = dispatches
    .filter((_, index) => selectedDispatches[index])
    .map(dispatch => dispatch.dispatchNo);

    
    //페이지바뀔때 상태 바뀜
    const PageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            if (currentView === 'pending') {
                pagepending(newPage);  // 출고 대기만 보기
            } else if (currentView === 'inProgress') {
                pageinProgress(newPage);  // 출고 요청만 보기
            } else if (currentView === 'complete') {
                pagecomplete(newPage);  // 출고 완료만 보기
            }
        }
    };

    // 체크된 것만 삭제
    const delect = () => {
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
                axios.post('/api/delete', selectedNo)
                    .then(response => {
                        window.showToast("삭제가 완료 되었습니다.");
                        pageDispatches(1);  // 삭제 후 페이지 갱신
                    })
                    .catch(error => {
                        console.error('삭제 중 발생된 에러 : ', error);
                    });

                console.log('삭제한 출고정보 No : ', selectedNo);  // 선택된 출고정보 번호 로그 출력
            }
        });

        // 출고지시 모달에 prop으로 전달
        <DispatchInstructionModal
        assignedWarehouse={assignedWarehouse} //창고배정 창고명=출고지시창고명
        onSave={handleDispatchInstructionSave} //출고지시 상태변경(pending->in progress)
    />
    };


    return (
        <Layout currentMenu="orderDispatch">
            <main className="main-content menu_orderDispatch">
                 <div className="menu_title">
                    <div className="sub_title">영업 관리</div>
                    <div className="main_title">주문 출고</div>
                 </div>
                <div className="menu_content">
                    <div className="left">
                        {/* 검색어 입력 */}
                            <div className={`search_box ${filter ? 'has_text' : ''}`}>
                                <label className={`label_floating ${filter ? 'active' : ''}`}>고객사, 상품명, 출고창고명 입력</label>
                                <i className="bi bi-search"></i>
                                <input
                                    type="text"
                                    className="box search"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
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
                            <div className="radio_box">
                                    <span>상태</span>
                                    <input
                                        type="radio"
                                        id="pending"
                                        name="filterType"
                                        value="pending"
                                        checked={filterType === 'pending'}
                                        
                                    />
                                    <label htmlFor="pending">출고대기</label>
                                    <input
                                        type="radio"
                                        id="in progress"
                                        name="filterType"
                                        value="in progress"
                                        checked={filterType === 'in progress'}
                                        
                                    />
                                    <label htmlFor="in progress">출고요청</label>
                                    <input
                                        type="radio"
                                        id="complete"
                                        name="filterType"
                                        value="complete"
                                        checked={filterType === 'complete'}
                                        
                                    />
                                    <label htmlFor="complete">출고완료</label>
                                </div>
                            </div>
                            <div className="right">
                                <button className="box color"  onClick={handleDispatchInstruction}>
                                  <i className="bi bi-plus-circle"></i> 출고지시
                                </button>
                            </div>
                            <div className="table_wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                <label className="chkbox_label">
                                                    <input
                                                        type="checkbox"
                                                        className="chkbox"
                                                        onChange={{}}
                                                    />
                                                    <i className="chkbox_icon">
                                                        <i className="bi bi-check-lg"></i>
                                                    </i>
                                                </label>
                                            </th>
                                            <th>출고번호</th>
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
                                    <tbody>
                                    
                                    <td>
                                        <div className="btn_group">
                                            <button className="box small">배정</button>
                                        </div>
                                    </td>

                                    </tbody>
                                </table>
                             </div>
                        </div>
                        
    
                  
            </main>
        </Layout>
    );
};

//최종 렌더링
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <OrderDispatch />
    </BrowserRouter>
);