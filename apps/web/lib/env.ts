export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1",
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === "true",
};
