import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // 유저 정보 조회 함수
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/messengers/info', {
                    withCredentials: true, // 쿠키를 포함하여 요청
                });
                if (response.status === 200) {
                    setUser(response.data); // 서버에서 받은 유저 정보를 상태로 저장
                    console.log("서버에서 가져온 유저 정보", response.data);
                } else {
                    console.error('유저 정보를 가져오는데 실패했습니다.');
                }
            } catch (error) {
                console.error('유저 정보를 가져오는 중 오류 발생:', error);
            }
        };

        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
