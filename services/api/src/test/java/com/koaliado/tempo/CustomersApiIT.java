package com.koaliado.tempo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import com.koaliado.tempo.shared.tenancy.UuidBytes;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class CustomersApiIT {

    private static final String CTX = "X-Context-Id";

    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("tempo").withUsername("tempo").withPassword("tempo-test-only");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", MYSQL::getJdbcUrl);
        r.add("spring.datasource.username", MYSQL::getUsername);
        r.add("spring.datasource.password", MYSQL::getPassword);
        // Valores falsos: solo activan la rama autenticada; el JWT lo simula
        // spring-security-test.
        r.add("tempo.security.cognito-issuer", () -> "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TESTONLY");
        r.add("COGNITO_CLIENT_ID", () -> "test-client-only");
    }

    @Autowired
    MockMvc mvc;
    @Autowired
    JdbcTemplate jdbc;

    static final UUID TENANT_A = UUID.randomUUID();
    static final UUID TENANT_B = UUID.randomUUID();
    static final UUID CUSTOMER_B = UUID.randomUUID();
    static final UUID CUST_PATCH = UUID.randomUUID();
    static final UUID CUST_ISO = UUID.randomUUID();
    static final UUID CUST_BAJA = UUID.randomUUID();
    static final UUID CUST_MINOR = UUID.randomUUID();
    static UUID CTX_A, CTX_B, CTX_CUST, CTX_RECEP, CTX_INSTR;

    @BeforeAll
    static void seed(@Autowired JdbcTemplate jdbc) {
        tenant(jdbc, TENANT_A, "api-a");
        tenant(jdbc, TENANT_B, "api-b");
        CTX_A = user(jdbc, "sub-a", "a@test.local", TENANT_A, "BUSINESS_ADMIN");
        CTX_B = user(jdbc, "sub-b", "b@test.local", TENANT_B, "BUSINESS_ADMIN");
        CTX_CUST = user(jdbc, "sub-cust", "cust@test.local", TENANT_A, "CUSTOMER");
        user(jdbc, "sub-nomember", "none@test.local", null, null);
        CTX_RECEP = user(jdbc, "sub-recep", "recep@test.local", TENANT_A, "RECEPTIONIST");
        CTX_INSTR = user(jdbc, "sub-instr", "instr@test.local", TENANT_A, "INSTRUCTOR");
        customerOfA(jdbc, CUST_PATCH, "Para Editar");
        customerOfA(jdbc, CUST_ISO, "Aislado");
        customerOfA(jdbc, CUST_BAJA, "Para Baja");
        customerOfA(jdbc, CUST_MINOR, "Sin Fecha");
        jdbc.update("INSERT INTO customers (id, tenant_id, full_name) VALUES (?, ?, ?)",
                bytes(UUID.randomUUID()), bytes(TENANT_A), "Cliente de A");
        jdbc.update("INSERT INTO customers (id, tenant_id, full_name) VALUES (?, ?, ?)",
                bytes(CUSTOMER_B), bytes(TENANT_B), "Cliente de B");
    }

    private static void customerOfA(JdbcTemplate jdbc, UUID id, String name) {
        jdbc.update("INSERT INTO customers (id, tenant_id, full_name) VALUES (?, ?, ?)",
                bytes(id), bytes(TENANT_A), name);
    }

    private int auditCount(String action, UUID resourceId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM audit_events WHERE action = ? AND resource_id = ?",
                Integer.class, action, bytes(resourceId));
    }

    private static byte[] bytes(UUID id) {
        return UuidBytes.toBytes(id);
    }

    private static void tenant(JdbcTemplate jdbc, UUID id, String slug) {
        jdbc.update("INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)", bytes(id), slug, slug);
    }

    private static UUID user(JdbcTemplate jdbc, String sub, String email, UUID tenant, String role) {
        UUID uid = UUID.randomUUID();
        jdbc.update("INSERT INTO users (id, cognito_subject, email, display_name) VALUES (?, ?, ?, ?)",
                bytes(uid), sub, email, email);
        if (tenant == null) {
            return null;
        }
        UUID mid = UUID.randomUUID();
        jdbc.update("INSERT INTO tenant_memberships (id, tenant_id, user_id, role) VALUES (?, ?, ?, ?)",
                bytes(mid), bytes(tenant), bytes(uid), role);
        return mid;
    }

    private static RequestPostProcessor as(String sub) {
        return jwt().jwt(j -> j.subject(sub));
    }

    @Test
    void listShowsOnlyOwnTenantCustomers() throws Exception {
        mvc.perform(get("/api/v1/customers").with(as("sub-a")).header(CTX, CTX_A.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.fullName=='Cliente de A')]").exists())
                .andExpect(jsonPath("$[?(@.fullName=='Cliente de B')]").doesNotExist());
    }

    @Test
    void userCannotActWithContextOfAnotherUser() throws Exception {
        mvc.perform(get("/api/v1/customers").with(as("sub-a")).header(CTX, CTX_B.toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    void knownUuidOfOtherTenantCustomerReturns404() throws Exception {
        mvc.perform(get("/api/v1/customers/" + CUSTOMER_B).with(as("sub-a")).header(CTX, CTX_A.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    void missingContextHeaderIsBadRequest() throws Exception {
        mvc.perform(get("/api/v1/customers").with(as("sub-a")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void userWithoutAnyMembershipIsForbidden() throws Exception {
        mvc.perform(get("/api/v1/customers").with(as("sub-nomember")).header(CTX, CTX_A.toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    void customerRoleCannotListCustomers() throws Exception {
        mvc.perform(get("/api/v1/customers").with(as("sub-cust")).header(CTX, CTX_CUST.toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedRequestIsRejected() throws Exception {
        mvc.perform(get("/api/v1/customers").header(CTX, CTX_A.toString()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createAdultCustomerSucceedsAndIsInvisibleToOtherTenant() throws Exception {
        String body = "{\"fullName\":\"Adulto Nuevo\",\"email\":\"nuevo@test.local\",\"dateOfBirth\":\"1990-01-15\"}";
        var result = mvc.perform(post("/api/v1/customers").with(as("sub-a"))
                .header(CTX, CTX_A.toString())
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn();
        String location = result.getResponse().getHeader("Location");
        mvc.perform(get(location).with(as("sub-b")).header(CTX, CTX_B.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    void createMinorWithoutGuardianIsRejected() throws Exception {
        String body = "{\"fullName\":\"Menor Sin Tutor\",\"dateOfBirth\":\"2018-06-01\"}";
        mvc.perform(post("/api/v1/customers").with(as("sub-a"))
                .header(CTX, CTX_A.toString())
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void createMinorWithGuardianSucceeds() throws Exception {
        String body = "{\"fullName\":\"Menor Con Tutor\",\"dateOfBirth\":\"2018-06-01\","
                + "\"guardian\":{\"fullName\":\"Madre\",\"relationship\":\"Madre\",\"phone\":\"6140000000\","
                + "\"consentGivenAt\":\"2026-11-09T10:00:00Z\"}}";
        mvc.perform(post("/api/v1/customers").with(as("sub-a"))
                .header(CTX, CTX_A.toString())
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }

    @Test
    void adminCanPatchCustomerAndAuditIsRecorded() throws Exception {
        mvc.perform(patch("/api/v1/customers/" + CUST_PATCH).with(as("sub-a"))
                .header(CTX, CTX_A.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Nombre Editado\",\"phone\":\"6141112222\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Nombre Editado"))
                .andExpect(jsonPath("$.phone").value("6141112222"));
        assertThat(auditCount("customer.update", CUST_PATCH)).isEqualTo(1);
    }

    @Test
    void emptyPatchIsBadRequest() throws Exception {
        mvc.perform(patch("/api/v1/customers/" + CUST_ISO).with(as("sub-a"))
                .header(CTX, CTX_A.toString())
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void otherTenantCannotPatchCustomer() throws Exception {
        mvc.perform(patch("/api/v1/customers/" + CUST_ISO).with(as("sub-b"))
                .header(CTX, CTX_B.toString())
                .contentType(MediaType.APPLICATION_JSON).content("{\"fullName\":\"Hackeado\"}"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/customers/" + CUST_ISO).with(as("sub-a")).header(CTX, CTX_A.toString()))
                .andExpect(jsonPath("$.fullName").value("Aislado"));
    }

    @Test
    void otherTenantCannotDeactivateCustomer() throws Exception {
        mvc.perform(delete("/api/v1/customers/" + CUST_ISO).with(as("sub-b")).header(CTX, CTX_B.toString()))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/v1/customers/" + CUST_ISO).with(as("sub-a")).header(CTX, CTX_A.toString()))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void instructorCannotPatch() throws Exception {
        mvc.perform(patch("/api/v1/customers/" + CUST_ISO).with(as("sub-instr"))
                .header(CTX, CTX_INSTR.toString())
                .contentType(MediaType.APPLICATION_JSON).content("{\"fullName\":\"X\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void receptionistCannotDeactivate() throws Exception {
        mvc.perform(delete("/api/v1/customers/" + CUST_ISO).with(as("sub-recep")).header(CTX, CTX_RECEP.toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deactivateIsLogicalIdempotentAndAudited() throws Exception {
        for (int i = 0; i < 2; i++) {
            mvc.perform(delete("/api/v1/customers/" + CUST_BAJA).with(as("sub-a")).header(CTX, CTX_A.toString()))
                    .andExpect(status().isNoContent());
        }
        mvc.perform(get("/api/v1/customers/" + CUST_BAJA).with(as("sub-a")).header(CTX, CTX_A.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
        assertThat(auditCount("customer.deactivate", CUST_BAJA)).isEqualTo(1);
    }

    @Test
    void patchThatLeavesMinorWithoutGuardianIsRejectedAndRolledBack() throws Exception {
        mvc.perform(patch("/api/v1/customers/" + CUST_MINOR).with(as("sub-a"))
                .header(CTX, CTX_A.toString())
                .contentType(MediaType.APPLICATION_JSON).content("{\"dateOfBirth\":\"2018-06-01\"}"))
                .andExpect(status().isUnprocessableEntity());
        mvc.perform(get("/api/v1/customers/" + CUST_MINOR).with(as("sub-a")).header(CTX, CTX_A.toString()))
                .andExpect(jsonPath("$.dateOfBirth").value(nullValue()));
    }

    @Test
    void contextsListsOnlyOwnMemberships() throws Exception {
        mvc.perform(get("/api/v1/contexts").with(as("sub-a")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(CTX_A.toString()))
                .andExpect(jsonPath("$[0].role").value("BUSINESS_ADMIN"));
        mvc.perform(get("/api/v1/contexts").with(as("sub-nomember")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
