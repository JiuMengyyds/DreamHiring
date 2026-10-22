package com.dreamhiring;

import com.dreamhiring.entity.UserAccount;
import com.dreamhiring.mapper.UserMapper;
import com.dreamhiring.security.JwtService;
import com.dreamhiring.security.SecurityPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private RequestMappingHandlerMapping handlerMapping;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void controllerInventoryShouldMatchApiContract() {
        long count = handlerMapping.getHandlerMethods().values().stream()
                .filter(handler -> handler.getBeanType().getPackageName().startsWith("com.dreamhiring.controller"))
                .count();
        org.assertj.core.api.Assertions.assertThat(count).isEqualTo(66);
    }

    @Test
    void controllerMappingsShouldExactlyMatchOpenApiContract() throws Exception {
        JsonNode document = objectMapper.readTree(
                Files.readString(Path.of("..", "docs", "api", "openapi.json")));
        Set<String> expected = new java.util.HashSet<>();
        Iterator<Map.Entry<String, JsonNode>> paths = document.get("paths").fields();
        while (paths.hasNext()) {
            Map.Entry<String, JsonNode> path = paths.next();
            path.getValue().fieldNames().forEachRemaining(method ->
                    expected.add(method.toUpperCase() + " " + path.getKey()));
        }

        Set<String> actual = handlerMapping.getHandlerMethods().entrySet().stream()
                .filter(entry -> entry.getValue().getBeanType().getPackageName().startsWith("com.dreamhiring.controller"))
                .flatMap(entry -> entry.getKey().getMethodsCondition().getMethods().stream()
                        .flatMap(method -> entry.getKey().getPatternValues().stream()
                                .map(pattern -> method.name() + " " + pattern)))
                .collect(Collectors.toSet());

        org.assertj.core.api.Assertions.assertThat(actual)
                .containsExactlyInAnyOrderElementsOf(expected);
    }

    @Test
    void publicJobSearchAndStatsShouldWork() throws Exception {
        mockMvc.perform(get("/api/jobs").queryParam("city", "杭州"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records.length()").value(2));

        mockMvc.perform(get("/api/stats/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.salaryDistribution").isArray())
                .andExpect(jsonPath("$.data.overview.sampleCount").value(21458))
                .andExpect(jsonPath("$.data.overview.averageSalary").value(9.9))
                .andExpect(jsonPath("$.data.metadata.sourceDataset")
                        .value("阿里云天池-招聘数据分析数据集163746"));
    }

    @Test
    void configuredCorsOriginShouldBeAllowed() throws Exception {
        mockMvc.perform(options("/api/jobs")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers
                        .header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
    }

    @Test
    void protectedEndpointShouldReturn401WithoutToken() throws Exception {
        mockMvc.perform(get("/api/resumes"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void seekerShouldReadOwnResumes() throws Exception {
        mockMvc.perform(get("/api/resumes").header(HttpHeaders.AUTHORIZATION, bearer("linzhixia")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("林知夏"));
    }

    @Test
    void duplicateApplicationShouldReturn409() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .header(HttpHeaders.AUTHORIZATION, bearer("linzhixia"))
                        .contentType("application/json")
                        .content("{\"jobId\":1,\"resumeId\":1}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409));
    }

    @Test
    void companyShouldReadJobsAndCandidates() throws Exception {
        String token = bearer("chenyu_hr");
        mockMvc.perform(get("/api/company/jobs").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.records").isArray());

        mockMvc.perform(get("/api/company/applications").header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.records[0].resume.name").value("林知夏"));
    }

    @Test
    void adminShouldInspectDeadLettersAndLocalReplayShouldFailSafely() throws Exception {
        String token = bearer("admin_zhou");
        mockMvc.perform(get("/api/admin/dead-letters")
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.records[0].status").value("PENDING"))
                .andExpect(jsonPath("$.data.records[0].queueName")
                        .value("dreamhiring.notification.queue"));

        mockMvc.perform(post("/api/admin/dead-letters/1/replay")
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(422));

        mockMvc.perform(get("/api/admin/dead-letters")
                        .queryParam("status", "PENDING")
                        .header(HttpHeaders.AUTHORIZATION, token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.records[0].status").value("PENDING"));
    }

    @Test
    void companyShouldProcessCandidateStatus() throws Exception {
        mockMvc.perform(put("/api/company/applications/1/status")
                        .header(HttpHeaders.AUTHORIZATION, bearer("chenyu_hr"))
                        .contentType("application/json")
                        .content("{\"status\":\"REJECTED\",\"remark\":\"岗位方向不匹配\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REJECTED"));
    }

    @Test
    void adminShouldRejectDeletingUserWithBusinessData() throws Exception {
        mockMvc.perform(delete("/api/admin/users/1").header(HttpHeaders.AUTHORIZATION, bearer("admin_zhou")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409));
    }

    @Test
    void adminShouldRejectDeletingReferencedCategory() throws Exception {
        mockMvc.perform(delete("/api/admin/job-categories/1")
                        .header(HttpHeaders.AUTHORIZATION, bearer("admin_zhou")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409));
    }

    @Test
    void seekerShouldNotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/users").header(HttpHeaders.AUTHORIZATION, bearer("linzhixia")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));
    }

    private String bearer(String username) {
        UserAccount user = userMapper.findByUsername(username);
        SecurityPrincipal principal = new SecurityPrincipal(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                user.getRole()
        );
        return "Bearer " + jwtService.createToken(principal);
    }
}
