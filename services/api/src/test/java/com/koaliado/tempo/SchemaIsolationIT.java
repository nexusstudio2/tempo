package com.koaliado.tempo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.UUID;
import java.sql.Timestamp;
import java.time.LocalDate;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class SchemaIsolationIT {

    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("tempo")
            .withUsername("tempo")
            .withPassword("tempo-test-only");

    @BeforeAll
    static void migrate() {
        Path migrations = Path.of("..", "..", "database", "migrations").toAbsolutePath().normalize();
        Flyway.configure()
                .dataSource(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword())
                .locations("filesystem:" + migrations)
                .load()
                .migrate();
    }

    private Connection connect() throws SQLException {
        return DriverManager.getConnection(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword());
    }

    private static byte[] uuid() {
        UUID u = UUID.randomUUID();
        java.nio.ByteBuffer b = java.nio.ByteBuffer.allocate(16);
        b.putLong(u.getMostSignificantBits()).putLong(u.getLeastSignificantBits());
        return b.array();
    }

    private void exec(Connection c, String sql, Object... params) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            ps.executeUpdate();
        }
    }

    private byte[] insertTenant(Connection c, String slug) throws SQLException {
        byte[] id = uuid();
        exec(c, "INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)", id, slug, slug);
        return id;
    }

    private byte[] insertBranch(Connection c, byte[] tenantId, String name) throws SQLException {
        byte[] id = uuid();
        exec(c, "INSERT INTO branches (id, tenant_id, name) VALUES (?, ?, ?)", id, tenantId, name);
        return id;
    }

    private byte[] insertUser(Connection c, String email) throws SQLException {
        byte[] id = uuid();
        exec(c, "INSERT INTO users (id, cognito_subject, email, display_name) VALUES (?, ?, ?, ?)",
                id, "sub-" + email, email, email);
        return id;
    }

    @Test
    void schemaHasExpectedTables() throws Exception {
        try (Connection c = connect();
                PreparedStatement ps = c.prepareStatement(
                        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'tempo' "
                                + "AND table_name IN ('users','tenants','branches','tenant_memberships',"
                                + "'platform_admins','tenant_settings','audit_events')");
                ResultSet rs = ps.executeQuery()) {
            rs.next();
            assertThat(rs.getInt(1)).isEqualTo(7);
        }
    }

    @Test
    void membershipCannotPointToBranchOfAnotherTenant() throws Exception {
        try (Connection c = connect()) {
            byte[] tenantA = insertTenant(c, "gym-a");
            byte[] tenantB = insertTenant(c, "gym-b");
            byte[] branchOfB = insertBranch(c, tenantB, "Centro");
            byte[] user = insertUser(c, "cruce@test.local");

            assertThatThrownBy(() -> exec(c,
                    "INSERT INTO tenant_memberships (id, tenant_id, user_id, branch_id, role) VALUES (?, ?, ?, ?, ?)",
                    uuid(), tenantA, user, branchOfB, "MANAGER"))
                    .isInstanceOf(SQLException.class);
        }
    }

    private byte[] insertCustomer(Connection c, byte[] tenantId, String name, String email) throws SQLException {
        byte[] id = uuid();
        exec(c, "INSERT INTO customers (id, tenant_id, full_name, email) VALUES (?, ?, ?, ?)",
                id, tenantId, name, email);
        return id;
    }

    @Test
    void duplicateTenantLevelMembershipIsRejected() throws Exception {
        try (Connection c = connect()) {
            byte[] tenant = insertTenant(c, "gym-dup");
            byte[] user = insertUser(c, "dup@test.local");
            String sql = "INSERT INTO tenant_memberships (id, tenant_id, user_id, role) VALUES (?, ?, ?, ?)";
            exec(c, sql, uuid(), tenant, user, "BUSINESS_ADMIN");
            assertThatThrownBy(() -> exec(c, sql, uuid(), tenant, user, "BUSINESS_ADMIN"))
                    .isInstanceOf(SQLException.class);
        }
    }

    @Test
    void customerCannotPointToBranchOfAnotherTenant() throws Exception {
        try (Connection c = connect()) {
            byte[] tenantA = insertTenant(c, "cust-a");
            byte[] tenantB = insertTenant(c, "cust-b");
            byte[] branchOfB = insertBranch(c, tenantB, "Norte");
            assertThatThrownBy(() -> exec(c,
                    "INSERT INTO customers (id, tenant_id, branch_id, full_name) VALUES (?, ?, ?, ?)",
                    uuid(), tenantA, branchOfB, "Cruzado"))
                    .isInstanceOf(SQLException.class);
        }
    }

    @Test
    void sameEmailAllowedAcrossTenantsButNotWithinOne() throws Exception {
        try (Connection c = connect()) {
            byte[] tenantA = insertTenant(c, "mail-a");
            byte[] tenantB = insertTenant(c, "mail-b");
            insertCustomer(c, tenantA, "Ana", "ana@test.local");
            insertCustomer(c, tenantB, "Ana", "ana@test.local");
            assertThatThrownBy(() -> insertCustomer(c, tenantA, "Ana 2", "ana@test.local"))
                    .isInstanceOf(SQLException.class);
        }
    }

    @Test
    void minorWithoutEmailCanHaveGuardian() throws Exception {
        try (Connection c = connect()) {
            byte[] tenant = insertTenant(c, "minors");
            byte[] minor1 = uuid();
            byte[] minor2 = uuid();
            String sql = "INSERT INTO customers (id, tenant_id, full_name, date_of_birth) VALUES (?, ?, ?, ?)";
            exec(c, sql, minor1, tenant, "Menor Uno", LocalDate.of(2016, 5, 20));
            exec(c, sql, minor2, tenant, "Menor Dos", LocalDate.of(2015, 3, 2)); // dos NULL en email: permitido
            exec(c, "INSERT INTO customer_guardians (id, tenant_id, customer_id, full_name, relationship, phone, consent_given_at) "
                    + "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    uuid(), tenant, minor1, "Madre Uno", "Madre", "6140000000",
                    Timestamp.valueOf("2026-11-09 10:00:00"));
        }
    }

    @Test
    void guardianCannotReferenceCustomerOfAnotherTenant() throws Exception {
        try (Connection c = connect()) {
            byte[] tenantA = insertTenant(c, "guard-a");
            byte[] tenantB = insertTenant(c, "guard-b");
            byte[] customerOfB = insertCustomer(c, tenantB, "Menor B", null);
            assertThatThrownBy(() -> exec(c,
                    "INSERT INTO customer_guardians (id, tenant_id, customer_id, full_name, relationship, phone, consent_given_at) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    uuid(), tenantA, customerOfB, "Intruso", "Tutor", "6140000001",
                    Timestamp.valueOf("2026-11-09 10:00:00")))
                    .isInstanceOf(SQLException.class);
        }
    }

    @Test
    void emergencyContactRequiresNameAndPhoneTogether() throws Exception {
        try (Connection c = connect()) {
            byte[] tenant = insertTenant(c, "emergency");
            assertThatThrownBy(() -> exec(c,
                    "INSERT INTO customers (id, tenant_id, full_name, emergency_contact_name) VALUES (?, ?, ?, ?)",
                    uuid(), tenant, "Sin telefono", "Contacto"))
                    .isInstanceOf(SQLException.class);

        }
    }
}