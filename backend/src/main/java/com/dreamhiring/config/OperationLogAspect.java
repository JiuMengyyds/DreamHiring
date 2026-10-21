package com.dreamhiring.config;

import com.dreamhiring.common.Result;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.service.OperationLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.HandlerMapping;

import java.lang.reflect.RecordComponent;
import java.util.Map;
import java.util.Set;

/**
 * 为所有非 GET 的 API 请求记录操作人、资源、动作和结果。
 */
@Aspect
@Component
public class OperationLogAspect {

    private static final Logger log = LoggerFactory.getLogger(OperationLogAspect.class);
    private static final Set<String> WRITE_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");

    private final OperationLogService operationLogService;

    public OperationLogAspect(OperationLogService operationLogService) {
        this.operationLogService = operationLogService;
    }

    @Around("execution(public * com.dreamhiring.controller..*(..))")
    public Object logWriteOperation(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = currentRequest();
        if (request == null || !WRITE_METHODS.contains(request.getMethod())) {
            return joinPoint.proceed();
        }

        Object result = null;
        Throwable failure = null;
        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable throwable) {
            failure = throwable;
            throw throwable;
        } finally {
            writeLog(joinPoint, request, result, failure);
        }
    }

    private void writeLog(
            ProceedingJoinPoint joinPoint,
            HttpServletRequest request,
            Object result,
            Throwable failure
    ) {
        try {
            Object pattern = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
            String action = request.getMethod() + " " + (pattern == null ? request.getRequestURI() : pattern);
            String resourceType = joinPoint.getTarget().getClass().getSimpleName()
                    .replace("Controller", "");
            Long resourceId = pathResourceId(request);
            if (resourceId == null) {
                resourceId = extractId(result);
            }
            operationLogService.record(
                    currentOperatorId(),
                    resourceType,
                    resourceId,
                    action,
                    failure == null ? "SUCCESS" : "FAILED",
                    failure == null ? null : failure.getClass().getSimpleName()
            );
        } catch (RuntimeException loggingFailure) {
            log.error("Failed to persist operation log", loggingFailure);
        }
    }

    private HttpServletRequest currentRequest() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest();
        }
        return null;
    }

    private Long currentOperatorId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof SecurityPrincipal principal) {
            return principal.id();
        }
        return null;
    }

    private Long pathResourceId(HttpServletRequest request) {
        Object variables = request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (!(variables instanceof Map<?, ?> values)) {
            return null;
        }
        for (Object value : values.values()) {
            if (value instanceof String text && text.matches("\\d+")) {
                return Long.valueOf(text);
            }
        }
        return null;
    }

    private Long extractId(Object result) {
        if (!(result instanceof Result<?> response) || !(response.getData() instanceof Record record)) {
            return null;
        }
        for (RecordComponent component : record.getClass().getRecordComponents()) {
            if ("id".equals(component.getName())) {
                try {
                    Object value = component.getAccessor().invoke(record);
                    return value instanceof Number number ? number.longValue() : null;
                } catch (ReflectiveOperationException exception) {
                    return null;
                }
            }
        }
        return null;
    }
}
