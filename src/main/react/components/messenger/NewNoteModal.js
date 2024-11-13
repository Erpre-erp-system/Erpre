import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import Draggable from "react-draggable";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {FaRegPlusSquare} from "react-icons/fa";
import UseEmployeeSearchModal from "./UseEmployeeSearchModal";
import UseSearch from "./UseSearch";
import { UserContext} from "../../context/UserContext";
import { CustomToolbar } from "./CustomToolbar";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client as StompClient } from '@stomp/stompjs';
import { Stomp } from '@stomp/stompjs';

const NewNoteModal = ({closeNewNoteModal, initialRecipients = [] }) => {

    const [recipients, setRecipients] = useState([]); // 선택된 직원 목록
    const [messageContent, setMessageContent] = useState(""); // 발신 메세지
    const [sendToMe, setSendToMe] = useState(false); // 나에게 보내기
    const [scheduledSend, setScheduledSend] = useState(false); // 예약 보내기
    const [scheduledDate, setScheduledDate] = useState(""); // 예약 날짜 선택
    const [employeeSearchText, setEmployeeSearchText] = useState(""); // 직원 검색 텍스트
    const [isEmployeeSearchModalOpen, setEmployeeSearchModalOpen] = useState(false); // 직원 검색 모달창
    const { user, setUser } = useContext(UserContext);
    const stompClientRef = useRef(null);


    const {data: suggestions, searchLoading} = UseSearch("/api/messengers/employeeList", employeeSearchText);

    // 초기 recipients 값 설정
    useEffect(() => {
        if (initialRecipients && initialRecipients.length > 0) {
            setRecipients(initialRecipients);
        }
    }, [initialRecipients]);

    const openEmployeeSearchModal = () => setEmployeeSearchModalOpen(true);
    const closeEmployeeSearchModal = () => setEmployeeSearchModalOpen(false);

    const onSelectedEmployees = (selectedEmployees) => {

        const newRecipients = selectedEmployees.filter(
            (newEmployee) => !recipients.some((r) => r.employeeId === newEmployee.employeeId)
        ).map((employee) => ({ ...employee }));

        setRecipients([...recipients, ...newRecipients]);

        closeEmployeeSearchModal();
    };

    // 웹소켓 연결
    useEffect(() => {
        const socket = new SockJS('http://localhost:8787/talk');

        stompClientRef.current = new StompClient({
            webSocketFactory: () => socket,
            reconnectDelay: 10000,
            onConnect: () => {
                console.log("쪽지 전송 WebSocket 연결 성공");
            },
            onDisconnect: () => console.log("쪽지 WebSocket 연결이 닫혔습니다."),
        });

        stompClientRef.current.activate();

        return () => {
            stompClientRef.current.deactivate()
                .then(() => console.log("쪽지 WebSocket 연결이 성공적으로 해제되었습니다."))
                .catch((error) => console.error("WebSocket 해제 중 오류:", error));
        };
    }, []);

    // 수신자 제거 함수
    const handleRemoveRecipient = (employeeId) => {
        setRecipients(recipients.filter((r) => r.employeeId !== employeeId));
    };

    // 파일 업로드 핸들러
    const handleFileUpload = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "*"); // 모든 파일 유형 허용
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                // 파일 업로드 로직 추가 (서버에 업로드하거나 로컬에서 처리)
                console.log("선택된 파일:", file);
                // // 예시로 파일 이름을 에디터에 삽입
                // const quill = quillRef.current.getEditor();
                // quill.insertText(quill.getSelection().index, `[파일: ${file.name}]`);
            }
        };
    };

    const quillModules = useMemo(() => {
        return {
            toolbar: {
                container: "#toolbar",
                handlers: {
                    upload: handleFileUpload,  // 파일 업로드 핸들러
                }
            },
        }
    },[]);

    // 쪽지 전송 함수
    const handleSendNote = async () => {
        try {
            const receiverIds = sendToMe ? [] : recipients.map(r => r.employeeId);

            if (!sendToMe && receiverIds.length === 0) {
                console.error('받는 사람이 선택되지 않았습니다.');
                return;
            }

            if (sendToMe && user && user.employeeId) {
                receiverIds.push(user.employeeId);
            }

            // 노트 생성 API 호출
            const newNote = {
                employeeName: user.employeeName,
                messageReceiverIds: receiverIds,
                messageContent: messageContent,
                messageSendDate: scheduledSend ? scheduledDate : null,
            };
            
            // WebSocket 연결이 설정되었는지 확인 후 send 호출
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.publish({
                    destination: "/app/note",
                    body: JSON.stringify(newNote),
                });
                console.log("전송된 쪽지:", newNote);
            } else {
                console.error("쪽지 WebSocket 연결이 설정되지 않았습니다.");
            }

            closeNewNoteModal();

        } catch (error) {
            console.error('쪽지 전송 오류:', error);
        }
    };





    return (
        <>
            <Draggable handle=".note-modal-header">
                <div className="new-note-modal">
                    <div className="note-modal-body">
                        <div className="recipient-section">
                            <label>받는사람</label>
                            <button
                                className="note-employee-search"
                                onClick={openEmployeeSearchModal}
                            >
                                <FaRegPlusSquare/>
                            </button>
                            <div className="recipient-input-container">
                                <div className="selected-recipients">
                                    {recipients.map((employee) => (
                                        <span key={employee.employeeId} className="recipient-tag">
                                                {employee.employeeName}
                                            <button onClick={() => handleRemoveRecipient(employee.employeeId)}>
                                                     &times;
                                             </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder={recipients.length === 0 ? "받는 사람의 이름을 입력하거나, + 버튼을 눌러 검색하세요" : ''}
                                        value={employeeSearchText}
                                        onChange={(e) => setEmployeeSearchText(e.target.value)}
                                        className="recipient-input"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* 자동완성 */}
                        {/*suggestions.length > 0 && (*/}
                        {/*    <ul className="autocomplete-suggestions">*/}
                        {/*        {suggestions.map((employee) => (*/}
                        {/*            <li*/}
                        {/*                key={employee.employeeId}*/}
                        {/*                onClick={() => handleSelectEmployees(employee)}*/}
                        {/*            >*/}
                        {/*                {employee.employeeName} ({employee.jobName}, {employee.departmentName})*/}
                        {/*            </li>*/}
                        {/*        ))}*/}
                        {/*    </ul>*/}
                        <div className="options">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={sendToMe}
                                    onChange={() => setSendToMe(!sendToMe)}
                                />
                                나에게 보내기
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={scheduledSend}
                                    onChange={() => setScheduledSend(!scheduledSend)}
                                />
                                예약전송
                            </label>
                            {scheduledSend && (
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                />
                            )}
                        </div>
                        {/* Custom Toolbar */}
                        <CustomToolbar />
                        {/* Quill 에디터 */}
                        <ReactQuill
                            theme="snow"
                            value={messageContent}
                            onChange={setMessageContent}
                            modules={quillModules}
                            placeholder="메시지를 입력하세요"
                            className="message-textarea"
                        />
                        { /* 이미지 및 파일 */}
                        <div className="note-footer">
                            <button className="send-button" onClick={handleSendNote}>보내기</button>
                            <button onClick={closeNewNoteModal} className="cancel-button">닫기</button>
                        </div>
                    </div>
                </div>
            </Draggable>

            {/* 직원 검색 모달 */}
            {isEmployeeSearchModalOpen && (
                <UseEmployeeSearchModal
                    closeEmployeeSearchModal={closeEmployeeSearchModal}
                    onSelectedEmployees={onSelectedEmployees}
                    createUrl=""
                />
            )}

        </>
    );
};

export default NewNoteModal;
