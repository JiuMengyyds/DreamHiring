package com.dreamhiring.common;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ExceptionTestController.class)
@Import(GlobalExceptionHandler.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldConvertBusinessExceptionToHttpStatusAndResult() throws Exception {
        mockMvc.perform(get("/test/business"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(ResultCode.CONFLICT.getCode()))
                .andExpect(jsonPath("$.msg").value("已经投递过该职位"))
                .andExpect(jsonPath("$.data").value(nullValue()));
    }

    @Test
    void shouldConvertValidationExceptionToBadRequest() throws Exception {
        mockMvc.perform(post("/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(ResultCode.BAD_REQUEST.getCode()))
                .andExpect(jsonPath("$.msg").value("name：名称不能为空"));
    }

    @Test
    void shouldHideUnexpectedExceptionDetails() throws Exception {
        mockMvc.perform(get("/test/unexpected"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value(ResultCode.INTERNAL_SERVER_ERROR.getCode()))
                .andExpect(jsonPath("$.msg").value(ResultCode.INTERNAL_SERVER_ERROR.getDefaultMessage()));
    }

}

@RestController
@RequestMapping("/test")
class ExceptionTestController {

    @GetMapping("/business")
    void businessError() {
        throw new BusinessException(ResultCode.CONFLICT, "已经投递过该职位");
    }

    @PostMapping("/validation")
    void validationError(@Valid @RequestBody ValidationRequest request) {
    }

    @GetMapping("/unexpected")
    void unexpectedError() {
        throw new IllegalStateException("do not expose this message");
    }
}

record ValidationRequest(@NotBlank(message = "名称不能为空") String name) {
}
