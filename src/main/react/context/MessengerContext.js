// MessengerContext.js 수정
import React, { createContext, useContext, useState, useEffect } from 'react';

export const MessengerContext = createContext();

export const useMessenger = () => useContext(MessengerContext);

export const MessengerProvider = ({ children }) => {
    const [isMessengerOpen, setMessengerOpen] = useState(
        () => JSON.parse(localStorage.getItem('isMessengerOpen')) || false
    );
    
    // 상태가 변경될 때마다 로컬 스토리지에 저장
    useEffect(() => {
        localStorage.setItem('isMessengerOpen', JSON.stringify(isMessengerOpen));
    }, [isMessengerOpen]);

    return (
        <MessengerContext.Provider value={{ isMessengerOpen, setMessengerOpen }}>
            {children}
        </MessengerContext.Provider>
    );
};
