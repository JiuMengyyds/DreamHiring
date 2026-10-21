package com.dreamhiring;

import com.dreamhiring.entity.UserAccount;
import com.dreamhiring.entity.DomainEnums.MessageType;
import com.dreamhiring.mapper.UserMapper;
import com.dreamhiring.security.JwtService;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.dto.AdminRequests.AnnouncementUpsertRequest;
import com.dreamhiring.dto.AdminRequests.AuditRequest;
import com.dreamhiring.dto.AdminRequests.CategoryUpsertRequest;
import com.dreamhiring.dto.AdminRequests.UserStatusRequest;
import com.dreamhiring.dto.ApplicationRequests.CreateRequest;
import com.dreamhiring.dto.ApplicationRequests.RemarkRequest;
import com.dreamhiring.dto.ApplicationRequests.StatusRequest;
import com.dreamhiring.dto.AuthRequests.ChangePasswordRequest;
import com.dreamhiring.dto.AuthRequests.LoginRequest;
import com.dreamhiring.dto.AuthRequests.RegisterRequest;
import com.dreamhiring.dto.CompanyRequests.JobUpsertRequest;
import com.dreamhiring.dto.CompanyRequests.UpdateProfileRequest;
import com.dreamhiring.dto.ResumeRequests.ResumeUpsertRequest;
import com.dreamhiring.vo.AnnouncementView;
import com.dreamhiring.vo.ApplicationViews.ApplicationDetailView;
import com.dreamhiring.vo.ApplicationViews.ApplicationView;
import com.dreamhiring.vo.AuthViews.UserProfileView;
import com.dreamhiring.vo.AuthViews.UserView;
import com.dreamhiring.vo.CompanyViews.CompanyJobView;
import com.dreamhiring.vo.CompanyViews.CompanyView;
import com.dreamhiring.vo.CompanyViews.DashboardView;
import com.dreamhiring.vo.JobViews.CategoryNode;
import com.dreamhiring.vo.JobViews.CompanyBrief;
import com.dreamhiring.vo.JobViews.JobDetail;
import com.dreamhiring.vo.JobViews.JobSummary;
import com.dreamhiring.vo.MessageViews.MessageView;
import com.dreamhiring.vo.ResumeView;
import com.dreamhiring.vo.StatsViews;
import com.dreamhiring.service.NotificationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiContractIntegrationTest {

    private static final Pattern TIMESTAMP =
            Pattern.compile("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private NotificationService notificationService;

    @Test
    void resultEnvelopeAndAnnouncementFieldsShouldMatchOpenApi() throws Exception {
        JsonNode response = readJson(get("/api/announcements"));

        Set<String> fields = new HashSet<>();
        response.fieldNames().forEachRemaining(fields::add);
        assertThat(fields).containsExactlyInAnyOrder("code", "msg", "data");
        JsonNode announcement = response.path("data").path("records").get(0);
        assertThat(announcement.has("publishedAt")).isTrue();
        assertThat(announcement.has("publishTime")).isFalse();
        assertTimestamp(announcement.path("publishedAt").asText());
        assertTimestamp(announcement.path("createdAt").asText());
    }

    @Test
    void responseModelsShouldExactlyMatchOpenApiSchemaProperties() throws Exception {
        JsonNode schemas = objectMapper.readTree(
                Files.readString(Path.of("..", "docs", "api", "openapi.json"))
        ).path("components").path("schemas");
        Map<String, Class<? extends Record>> mappings = responseSchemaMappings();

        mappings.forEach((schemaName, modelType) -> {
            Set<String> expected = new HashSet<>();
            collectProperties(schemas.path(schemaName), expected);
            Set<String> actual = Arrays.stream(modelType.getRecordComponents())
                    .map(component -> component.getName())
                    .collect(java.util.stream.Collectors.toSet());
            assertThat(actual)
                    .as("Fields for OpenAPI schema %s", schemaName)
                    .containsExactlyInAnyOrderElementsOf(expected);
        });
    }

    @Test
    void requestModelsShouldExactlyMatchOpenApiSchemaProperties() throws Exception {
        JsonNode schemas = objectMapper.readTree(
                Files.readString(Path.of("..", "docs", "api", "openapi.json"))
        ).path("components").path("schemas");
        Map<String, Class<? extends Record>> mappings = new LinkedHashMap<>();
        mappings.put("RegisterRequest", RegisterRequest.class);
        mappings.put("LoginRequest", LoginRequest.class);
        mappings.put("UpdateProfileRequest", com.dreamhiring.dto.AuthRequests.UpdateProfileRequest.class);
        mappings.put("ChangePasswordRequest", ChangePasswordRequest.class);
        mappings.put("CompanyUpdateRequest", UpdateProfileRequest.class);
        mappings.put("CompanyJobUpsertRequest", JobUpsertRequest.class);
        mappings.put("ResumeUpsertRequest", ResumeUpsertRequest.class);
        mappings.put("ApplicationCreateRequest", CreateRequest.class);
        mappings.put("ApplicationStatusRequest", StatusRequest.class);
        mappings.put("ApplicationRemarkRequest", RemarkRequest.class);
        mappings.put("AuditRequest", AuditRequest.class);
        mappings.put("CategoryUpsertRequest", CategoryUpsertRequest.class);
        mappings.put("AnnouncementUpsertRequest", AnnouncementUpsertRequest.class);
        mappings.put("UserStatusRequest", UserStatusRequest.class);

        mappings.forEach((schemaName, modelType) -> {
            Set<String> expected = new HashSet<>();
            collectProperties(schemas.path(schemaName), expected);
            Set<String> actual = Arrays.stream(modelType.getRecordComponents())
                    .map(component -> component.getName())
                    .collect(java.util.stream.Collectors.toSet());
            assertThat(actual)
                    .as("Fields for OpenAPI request schema %s", schemaName)
                    .containsExactlyInAnyOrderElementsOf(expected);
        });
    }

    @Test
    void publicJobDetailShouldExposePersistedDetailFields() throws Exception {
        JsonNode job = readJson(get("/api/jobs/1")).path("data");

        assertThat(job.path("companyLogoUrl").isMissingNode()).isFalse();
        assertThat(job.path("perks").isArray()).isTrue();
        assertThat(job.path("duties").size()).isPositive();
        assertThat(job.path("requirements").size()).isPositive();
        assertThat(job.path("company").path("name").asText()).isEqualTo("星云科技");
        assertTimestamp(job.path("publishedAt").asText());
        assertTimestamp(job.path("updatedAt").asText());
    }

    @Test
    void userMessageAndApplicationFieldsShouldMatchOpenApi() throws Exception {
        String seekerToken = bearer("linzhixia");

        JsonNode user = readJson(get("/api/users/me")
                .header(HttpHeaders.AUTHORIZATION, seekerToken)).path("data");
        assertTimestamp(user.path("createdAt").asText());
        assertTimestamp(user.path("updatedAt").asText());

        JsonNode message = readJson(get("/api/messages")
                .header(HttpHeaders.AUTHORIZATION, seekerToken))
                .path("data")
                .path("records")
                .get(0);
        assertThat(message.path("isRead").isBoolean()).isTrue();
        assertThat(message.has("read")).isFalse();

        JsonNode application = readJson(get("/api/applications/1")
                .header(HttpHeaders.AUTHORIZATION, seekerToken)).path("data");
        assertThat(application.path("candidate").path("username").asText()).isEqualTo("linzhixia");
        assertThat(application.path("resume").path("attachmentUrl").isTextual()).isTrue();
    }

    @Test
    void companyContractsShouldMatchOpenApi() throws Exception {
        String companyToken = bearer("chenyu_hr");

        JsonNode profile = readJson(get("/api/company/profile")
                .header(HttpHeaders.AUTHORIZATION, companyToken)).path("data");
        assertThat(profile.path("contactName").asText()).isEqualTo("陈屿");
        assertThat(profile.path("activeJobCount").asInt()).isPositive();
        assertThat(profile.has("auditReason")).isTrue();

        JsonNode job = readJson(get("/api/company/jobs/1")
                .header(HttpHeaders.AUTHORIZATION, companyToken)).path("data");
        assertThat(job.path("duties").size()).isPositive();
        assertThat(job.path("requirements").size()).isPositive();
        assertThat(job.path("applicantCount").asInt()).isPositive();
        assertThat(job.has("pendingApplicantCount")).isTrue();
        assertThat(job.has("auditReason")).isTrue();
        assertTimestamp(job.path("createdAt").asText());

        JsonNode dashboard = readJson(get("/api/company/dashboard")
                .header(HttpHeaders.AUTHORIZATION, companyToken)).path("data");
        assertThat(dashboard.path("recentApplications").isArray()).isTrue();
    }

    @Test
    void trendShouldReturnRequestedNumberOfMonths() throws Exception {
        JsonNode trend = readJson(get("/api/stats/trend").queryParam("months", "3")).path("data");

        assertThat(trend.isArray()).isTrue();
        assertThat(trend.size()).isEqualTo(3);
        assertThat(trend.get(2).path("month").asText()).matches("\\d{4}-\\d{2}");
    }

    @Test
    void writeOperationsShouldBeAudited() throws Exception {
        mockMvc.perform(put("/api/messages/1/read")
                        .header(HttpHeaders.AUTHORIZATION, bearer("linzhixia")))
                .andExpect(status().isOk());

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM operation_log WHERE action LIKE 'PUT %' AND result = 'SUCCESS'",
                Integer.class
        );
        assertThat(count).isPositive();
    }

    @Test
    void uploadShouldRejectSpoofedContentType() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "fake.pdf",
                "application/pdf",
                "not-a-pdf".getBytes()
        );
        mockMvc.perform(multipart("/api/files")
                        .file(file)
                        .param("scope", "RESUME_ATTACHMENT")
                        .header(HttpHeaders.AUTHORIZATION, bearer("linzhixia")))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value(422));
    }

    @Test
    void hotJobsShouldReturnPublishedJobs() throws Exception {
        mockMvc.perform(get("/api/jobs/hot").queryParam("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    @Test
    void notificationConsumerContractShouldBeIdempotent() {
        String dedupKey = "TEST:CONTRACT:1";

        notificationService.sendOnce(1L, MessageType.SYSTEM, "测试通知", "重复消费只写一次", 99L, dedupKey);
        notificationService.sendOnce(1L, MessageType.SYSTEM, "测试通知", "重复消费只写一次", 99L, dedupKey);

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM message WHERE dedup_key = ?",
                Integer.class,
                dedupKey
        );
        assertThat(count).isEqualTo(1);
    }

    private JsonNode readJson(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request)
            throws Exception {
        String body = mockMvc.perform(request)
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        return objectMapper.readTree(body);
    }

    private void assertTimestamp(String value) {
        assertThat(value).matches(TIMESTAMP);
        assertThat(value).doesNotContain("T");
    }

    private Map<String, Class<? extends Record>> responseSchemaMappings() {
        Map<String, Class<? extends Record>> mappings = new LinkedHashMap<>();
        mappings.put("UserSummary", UserView.class);
        mappings.put("UserProfile", UserProfileView.class);
        mappings.put("CompanySummary", CompanyBrief.class);
        mappings.put("JobSummary", JobSummary.class);
        mappings.put("JobDetail", JobDetail.class);
        mappings.put("CategoryNode", CategoryNode.class);
        mappings.put("Announcement", AnnouncementView.class);
        mappings.put("Resume", ResumeView.class);
        mappings.put("Application", ApplicationView.class);
        mappings.put("ApplicationDetail", ApplicationDetailView.class);
        mappings.put("Company", CompanyView.class);
        mappings.put("CompanyJob", CompanyJobView.class);
        mappings.put("CompanyDashboard", DashboardView.class);
        mappings.put("Message", MessageView.class);
        mappings.put("DistributionItem", StatsViews.Distribution.class);
        mappings.put("TrendPoint", StatsViews.TrendPoint.class);
        mappings.put("HotSkillItem", StatsViews.HotSkill.class);
        mappings.put("DashboardStatsData", StatsViews.Dashboard.class);
        return mappings;
    }

    private void collectProperties(JsonNode schema, Set<String> properties) {
        JsonNode direct = schema.path("properties");
        if (direct.isObject()) {
            direct.fieldNames().forEachRemaining(properties::add);
        }
        JsonNode allOf = schema.path("allOf");
        if (allOf.isArray()) {
            allOf.forEach(part -> {
                if (part.has("$ref")) {
                    String schemaName = part.path("$ref").asText().substring(
                            part.path("$ref").asText().lastIndexOf('/') + 1
                    );
                    collectReferencedProperties(schemaName, properties);
                } else {
                    collectProperties(part, properties);
                }
            });
        }
    }

    private void collectReferencedProperties(String schemaName, Set<String> properties) {
        try {
            JsonNode schemas = objectMapper.readTree(
                    Files.readString(Path.of("..", "docs", "api", "openapi.json"))
            ).path("components").path("schemas");
            collectProperties(schemas.path(schemaName), properties);
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Unable to read OpenAPI schema", exception);
        }
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
