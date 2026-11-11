package com.koaliado.tempo.shared.tenancy;

import java.nio.ByteBuffer;
import java.util.UUID;

public final class UuidBytes {
    private UuidBytes() {
    }

    public static byte[] toBytes(UUID id) {
        return ByteBuffer.allocate(16).putLong(id.getMostSignificantBits())
                .putLong(id.getLeastSignificantBits()).array();
    }

    public static UUID toUuid(byte[] bytes) {
        ByteBuffer b = ByteBuffer.wrap(bytes);
        return new UUID(b.getLong(), b.getLong());
    }
}