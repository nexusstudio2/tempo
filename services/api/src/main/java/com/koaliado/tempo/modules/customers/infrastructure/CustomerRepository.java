package com.koaliado.tempo.modules.customers.infrastructure;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.koaliado.tempo.modules.customers.application.CreateCustomerCommand;
import com.koaliado.tempo.modules.customers.application.CustomerView;
import com.koaliado.tempo.shared.tenancy.UuidBytes;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import com.koaliado.tempo.modules.customers.application.UpdateCustomerCommand;

/**
 * Todas las consultas exigen tenantId: no existe ningun metodo sin filtro de
 * tenant.
 */
@Repository
public class CustomerRepository {
    private static final String COLUMNS = "id, branch_id, full_name, email, phone, date_of_birth, "
            + "emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, status, notes, created_at";

    private final JdbcClient jdbc;

    public CustomerRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<CustomerView> findPage(UUID tenantId, int limit, int offset) {
        return jdbc.sql("SELECT " + COLUMNS + " FROM customers WHERE tenant_id = :t "
                + "ORDER BY created_at DESC, id LIMIT :limit OFFSET :offset")
                .param("t", UuidBytes.toBytes(tenantId))
                .param("limit", limit)
                .param("offset", offset)
                .query(this::map)
                .list();
    }

    public Optional<CustomerView> findById(UUID tenantId, UUID id) {
        return jdbc.sql("SELECT " + COLUMNS + " FROM customers WHERE tenant_id = :t AND id = :id")
                .param("t", UuidBytes.toBytes(tenantId))
                .param("id", UuidBytes.toBytes(id))
                .query(this::map)
                .optional();
    }

    public void insert(UUID tenantId, UUID id, CreateCustomerCommand c) {
        jdbc.sql("INSERT INTO customers (id, tenant_id, branch_id, full_name, email, phone, date_of_birth, "
                + "emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, notes) "
                + "VALUES (:id, :t, :branch, :name, :email, :phone, :dob, :ecn, :ecp, :ecr, :notes)")
                .param("id", UuidBytes.toBytes(id))
                .param("t", UuidBytes.toBytes(tenantId))
                .param("branch", c.branchId() == null ? null : UuidBytes.toBytes(c.branchId()))
                .param("name", c.fullName())
                .param("email", blankToNull(c.email()))
                .param("phone", blankToNull(c.phone()))
                .param("dob", c.dateOfBirth())
                .param("ecn", blankToNull(c.emergencyContactName()))
                .param("ecp", blankToNull(c.emergencyContactPhone()))
                .param("ecr", blankToNull(c.emergencyContactRelationship()))
                .param("notes", c.notes())
                .update();
    }

    public void insertGuardian(UUID tenantId, UUID customerId, CreateCustomerCommand.Guardian g, UUID recordedBy) {
        jdbc.sql("INSERT INTO customer_guardians (id, tenant_id, customer_id, full_name, relationship, phone, "
                + "email, consent_given_at, consent_recorded_by) "
                + "VALUES (:id, :t, :cid, :name, :rel, :phone, :email, :consent, :by)")
                .param("id", UuidBytes.toBytes(UUID.randomUUID()))
                .param("t", UuidBytes.toBytes(tenantId))
                .param("cid", UuidBytes.toBytes(customerId))
                .param("name", g.fullName())
                .param("rel", g.relationship())
                .param("phone", g.phone())
                .param("email", blankToNull(g.email()))
                .param("consent", Timestamp.from(g.consentGivenAt()))
                .param("by", UuidBytes.toBytes(recordedBy))
                .update();
    }

        public void update(UUID tenantId, UUID id, UpdateCustomerCommand c) {
        jdbc.sql("UPDATE customers SET full_name = COALESCE(:name, full_name), email = COALESCE(:email, email), "
                + "phone = COALESCE(:phone, phone), date_of_birth = COALESCE(:dob, date_of_birth), "
                + "branch_id = COALESCE(:branch, branch_id), "
                + "emergency_contact_name = COALESCE(:ecn, emergency_contact_name), "
                + "emergency_contact_phone = COALESCE(:ecp, emergency_contact_phone), "
                + "emergency_contact_relationship = COALESCE(:ecr, emergency_contact_relationship), "
                + "notes = COALESCE(:notes, notes) WHERE tenant_id = :t AND id = :id")
            .param("t", UuidBytes.toBytes(tenantId))
            .param("id", UuidBytes.toBytes(id))
            .param("name", blankToNull(c.fullName()))
            .param("email", blankToNull(c.email()))
            .param("phone", blankToNull(c.phone()))
            .param("dob", c.dateOfBirth())
            .param("branch", c.branchId() == null ? null : UuidBytes.toBytes(c.branchId()))
            .param("ecn", blankToNull(c.emergencyContactName()))
            .param("ecp", blankToNull(c.emergencyContactPhone()))
            .param("ecr", blankToNull(c.emergencyContactRelationship()))
            .param("notes", blankToNull(c.notes()))
            .update();
    }

    public void deactivate(UUID tenantId, UUID id) {
        jdbc.sql("UPDATE customers SET status = 'INACTIVE' WHERE tenant_id = :t AND id = :id")
            .param("t", UuidBytes.toBytes(tenantId))
            .param("id", UuidBytes.toBytes(id))
            .update();
    }

    public int activeGuardianCount(UUID tenantId, UUID customerId) {
        return jdbc.sql("SELECT COUNT(*) FROM customer_guardians "
                + "WHERE tenant_id = :t AND customer_id = :c AND status = 'ACTIVE'")
            .param("t", UuidBytes.toBytes(tenantId))
            .param("c", UuidBytes.toBytes(customerId))
            .query(Integer.class)
            .single();
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }

    private CustomerView map(ResultSet rs, int row) throws SQLException {
        byte[] branch = rs.getBytes("branch_id");
        var dob = rs.getDate("date_of_birth");
        return new CustomerView(
                UuidBytes.toUuid(rs.getBytes("id")),
                branch == null ? null : UuidBytes.toUuid(branch),
                rs.getString("full_name"), rs.getString("email"), rs.getString("phone"),
                dob == null ? null : dob.toLocalDate(),
                rs.getString("emergency_contact_name"), rs.getString("emergency_contact_phone"),
                rs.getString("emergency_contact_relationship"), rs.getString("status"), rs.getString("notes"),
                rs.getTimestamp("created_at").toInstant());
    }
}