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
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BusinessClosureIntegrationTest {

    private static final Pattern CAPTCHA_CODE = Pattern.compile(">([A-Z0-9]{4})</text>");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtService jwtService;

    @Test
    void seekerToCompanyToAdminClosureShouldWorkEndToEnd() throws Exception {
        String suffix = Long.toString(System.nanoTime(), 36);

        JsonNode seekerAuth = register("closure_seeker_" + suffix, "回归求职者", "SEEKER");
        String seekerToken = bearer(seekerAuth.path("accessToken").asText());
        long seekerId = seekerAuth.path("user").path("id").asLong();

        JsonNode resume = request(post("/api/resumes")
                .header(HttpHeaders.AUTHORIZATION, seekerToken)
                .contentType("application/json")
                .content(json(Map.of(
                        "name", "回归求职者",
                        "title", "产品设计师",
                        "education", "BACHELOR",
                        "experienceYears", 3,
                        "currentCity", "杭州",
                        "expectCity", "杭州",
                        "expectSalaryMin", 18,
                        "expectSalaryMax", 28,
                        "skillTags", List.of("Figma", "B端产品", "用户研究"),
                        "summary", "三年以上企业产品体验设计经验，能够独立负责完整业务链路。"
                ))), 200);
        long resumeId = resume.path("id").asLong();
        assertThat(resume.path("isDefault").asBoolean()).isTrue();

        JsonNode application = request(post("/api/applications")
                .header(HttpHeaders.AUTHORIZATION, seekerToken)
                .contentType("application/json")
                .content(json(Map.of("jobId", 1, "resumeId", resumeId))), 200);
        long applicationId = application.path("id").asLong();
        assertThat(application.path("status").asText()).isEqualTo("PENDING_VIEW");

        request(put("/api/company/applications/" + applicationId + "/status")
                .header(HttpHeaders.AUTHORIZATION, bearer("chenyu_hr"))
                .contentType("application/json")
                .content(json(Map.of("status", "INTERVIEW", "remark", "安排第一轮面试"))), 200);

        JsonNode messages = request(get("/api/messages")
                .header(HttpHeaders.AUTHORIZATION, seekerToken)
                .queryParam("page", "1")
                .queryParam("size", "50"), 200);
        boolean hasApplicationMessage = false;
        for (JsonNode message : messages.path("records")) {
            if (message.path("type").asText().equals("APPLICATION")
                    && message.path("relatedId").asLong() == applicationId) {
                hasApplicationMessage = true;
                break;
            }
        }
        assertThat(hasApplicationMessage).isTrue();

        JsonNode companyAuth = register("closure_company_" + suffix, "回归企业", "COMPANY");
        String companyToken = bearer(companyAuth.path("accessToken").asText());
        JsonNode companyProfile = request(get("/api/company/profile")
                .header(HttpHeaders.AUTHORIZATION, companyToken), 200);
        long companyId = companyProfile.path("id").asLong();

        request(put("/api/company/profile")
                .header(HttpHeaders.AUTHORIZATION, companyToken)
                .contentType("application/json")
                .content(json(Map.of(
                        "name", "回归测试企业",
                        "industry", "企业服务",
                        "scale", "100-499人",
                        "city", "杭州",
                        "intro", "这是用于验证完整招聘闭环的回归测试企业。",
                        "contactName", "测试 HR",
                        "contactPhone", "13800009999",
                        "contactEmail", "closure@example.com"
                ))), 200);

        String adminToken = bearer("admin_zhou");
        JsonNode announcement = request(post("/api/admin/announcements")
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType("application/json")
                .content(json(Map.of(
                        "title", "闭环公告-" + suffix,
                        "summary", "闭环测试公告摘要",
                        "content", "这是用于验证公告消息投递的完整内容。",
                        "channel", "SEEKER",
                        "status", "PUBLISHED"
                ))), 200);
        JsonNode announcementMessages = request(get("/api/messages")
                .header(HttpHeaders.AUTHORIZATION, seekerToken)
                .queryParam("type", "ANNOUNCEMENT")
                .queryParam("page", "1")
                .queryParam("size", "50"), 200);
        boolean hasAnnouncementMessage = false;
        for (JsonNode message : announcementMessages.path("records")) {
            if (message.path("relatedId").asLong() == announcement.path("id").asLong()) {
                hasAnnouncementMessage = true;
                break;
            }
        }
        assertThat(hasAnnouncementMessage).isTrue();

        request(put("/api/admin/companies/" + companyId + "/audit")
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType("application/json")
                .content(json(Map.of("auditStatus", "APPROVED", "reason", ""))), 200);

        long approvedJobId = createCompanyJob(companyToken, "回归职位-" + suffix);
        JsonNode approvedJob = request(put("/api/admin/jobs/" + approvedJobId + "/audit")
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType("application/json")
                .content(json(Map.of("auditStatus", "APPROVED", "reason", ""))), 200);
        assertThat(approvedJob.path("status").asText()).isEqualTo("PUBLISHED");

        request(get("/api/jobs/" + approvedJobId), 200);

        long rejectedJobId = createCompanyJob(companyToken, "待驳回职位-" + suffix);
        request(put("/api/admin/jobs/" + rejectedJobId + "/audit")
                .header(HttpHeaders.AUTHORIZATION, adminToken)
                .contentType("application/json")
                .content(json(Map.of("auditStatus", "REJECTED", "reason", "职位信息不完整"))), 200);
        JsonNode rejectedJob = request(get("/api/company/jobs/" + rejectedJobId)
                .header(HttpHeaders.AUTHORIZATION, companyToken), 200);
        assertThat(rejectedJob.path("auditStatus").asText()).isEqualTo("REJECTED");
        assertThat(rejectedJob.path("auditReason").asText()).isEqualTo("职位信息不完整");

        UserAccount registeredSeeker = userMapper.findById(seekerId);
        assertThat(registeredSeeker).isNotNull();
    }

    private long createCompanyJob(String companyToken, String title) throws Exception {
        JsonNode created = request(post("/api/company/jobs")
                .header(HttpHeaders.AUTHORIZATION, companyToken)
                .contentType("application/json")
                .content(json(Map.ofEntries(
                        Map.entry("title", title),
                        Map.entry("categoryId", 12),
                        Map.entry("city", "杭州"),
                        Map.entry("district", "滨江区"),
                        Map.entry("salaryMin", 20),
                        Map.entry("salaryMax", 30),
                        Map.entry("education", "BACHELOR"),
                        Map.entry("experience", "THREE_TO_FIVE"),
                        Map.entry("description", "负责企业协同产品的体验设计与跨团队方案落地。"),
                        Map.entry("skillTags", List.of("Figma", "B端产品")),
                        Map.entry("duties", List.of("负责产品体验设计")),
                        Map.entry("requirements", List.of("三年以上 B 端产品经验")),
                        Map.entry("perks", List.of("弹性工作"))
                ))), 200);
        assertThat(created.path("auditStatus").asText()).isEqualTo("PENDING");
        return created.path("id").asLong();
    }

    private JsonNode register(String username, String nickname, String role) throws Exception {
        JsonNode captcha = request(post("/api/auth/captcha"), 200);
        String captchaId = captcha.path("captchaId").asText();
        String captchaCode = extractCaptchaCode(captcha.path("imageBase64").asText());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("username", username);
        body.put("password", "dreamhiring");
        body.put("nickname", nickname);
        body.put("role", role);
        body.put("captchaId", captchaId);
        body.put("captchaCode", captchaCode);
        return request(post("/api/auth/register")
                .contentType("application/json")
                .content(json(body)), 200);
    }

    private String extractCaptchaCode(String dataUrl) {
        String encoded = dataUrl.substring(dataUrl.indexOf(',') + 1);
        String svg = new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
        Matcher matcher = CAPTCHA_CODE.matcher(svg);
        assertThat(matcher.find()).isTrue();
        return matcher.group(1);
    }

    private JsonNode request(MockHttpServletRequestBuilder request, int expectedStatus) throws Exception {
        String body = mockMvc.perform(request)
                .andExpect(status().is(expectedStatus))
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8);
        JsonNode response = objectMapper.readTree(body);
        assertThat(response.path("code").asInt()).isEqualTo(expectedStatus);
        return response.path("data");
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }

    private String bearer(String token) {
        if (token.startsWith("Bearer ")) {
            return token;
        }
        if (token.contains(".")) {
            return "Bearer " + token;
        }
        UserAccount user = userMapper.findByUsername(token);
        SecurityPrincipal principal = new SecurityPrincipal(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                user.getRole()
        );
        return "Bearer " + jwtService.createToken(principal);
    }
}
