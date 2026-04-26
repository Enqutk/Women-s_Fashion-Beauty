export type HealthStatusResponse = {
  ok: boolean;
  message: string;
  serverTime: string | null;
  error?: string;
};
