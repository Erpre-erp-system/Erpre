package com.project.erpre.config;

import lombok.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/talk")
                .setAllowedOriginPatterns("*")
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(@NonNull ServerHttpRequest request, @NonNull WebSocketHandler wsHandler, @NonNull  Map<String, Object> attributes) {
                        Principal user = request.getPrincipal();
                        if (user == null) {
                            logger.error("인증 정보를 찾을 수 없습니다.");
                        }
                        return user;
                    }
                })
                .addInterceptors(new HttpSessionHandshakeInterceptor()) // 추가된 인터셉터
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // 전송(발신) - 클라이언트가 메시지를 전송할 때 "/app"으로 시작하도록 설정
        registry.setApplicationDestinationPrefixes("/app");

        // 구독(수신) - 클라이언트가 특정 주제를 구독하면 서버가 그 주제와 관련된 메시지를 클라이언트에게 푸시해주는 기능
        registry.enableSimpleBroker("/topic", "/queue");

    }

// 1. /topic/note:  1:多 쪽지 전송. 이 경로를 구독하고 있는 모든 사용자에게 쪽지가 전달
// 1. /topic/chat: 그룹 채팅. 이 경로를 구독하고 있는 모든 사용자(즉, 해당 채팅방에 참여하고 있는 사용자들)에게 메시지가 전달
    // 이것에 대한 의문 -> 그럼 해당 그룹채팅방에 참여하고 있는 나는 구독도 하고 전송도 하는 것인가? 그럼 두 번 오는건가?

// 2. /user/queue/note: 1:1 쪽지. 특정 사용자에게만 쪽지를 전송, convertAndSendToUser 메서드를 사용하여 전송하면 "/user/queue/note"를 구독하고 있는 특정 사용자에게만 메시지가 전달
// 2. /user/queue/chat:  1:1 채팅. 특정 사용자에게만 채팅 메시지를 전송할 때 사용

    // /app의 역할? 클라이언트가 메시지를 서버로 보낼 때 사용하는 경로의 프리픽스, 실제로는 서버 내부에서만 사용됨. 프론트로 나가지 않음
    // 클라이언트가 /app/sendNote로 메세지를 보내면 서버는 @MessageMapping("/sendNote")메서드를 실행

}
