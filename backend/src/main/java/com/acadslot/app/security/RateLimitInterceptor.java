package com.acadslot.app.security;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // Stores IP Address -> Timestamp of last requests
    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String clientIp = request.getRemoteAddr();
        
        TokenBucket bucket = buckets.computeIfAbsent(clientIp, k -> new TokenBucket());

        if (!bucket.tryConsume()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("{\"success\":false, \"message\":\"Too many requests. Please slow down.\"}");
            response.setContentType("application/json");
            return false; // Blocks the request entirely
        }
        return true;
    }

    // Simple Token Bucket Algorithm (60 requests per second)
    private static class TokenBucket {
        private final int MAX_TOKENS = 60;
        private int tokens = MAX_TOKENS;
        private long lastRefillTime = System.currentTimeMillis();

        public synchronized boolean tryConsume() {
            refill();
            if (tokens > 0) {
                tokens--;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            if (now - lastRefillTime > TimeUnit.SECONDS.toMillis(1)) {
                tokens = MAX_TOKENS;
                lastRefillTime = now;
            }
        }
    }
}
