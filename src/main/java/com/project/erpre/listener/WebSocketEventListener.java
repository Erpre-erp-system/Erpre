package com.project.erpre.listener;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEventListener {

    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Authentication auth = (Authentication) headerAccessor.getUser(); // 연결된 사용자의 Principal 객체를 반환하여 형변환

        if (auth != null) {
            String employeeId = auth.getName();
            onlineUsers.add(employeeId);
        };
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Authentication auth = (Authentication) headerAccessor.getUser();

        if (auth != null) {
            String employeeId = auth.getName();
            onlineUsers.remove(employeeId);
        }
    }

    public boolean isUserOnline(String employeeId) {
        return onlineUsers.contains(employeeId);
    }

}
