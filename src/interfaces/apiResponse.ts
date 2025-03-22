export type ApiResponse<T = unknown> = {
  message: string;
  status: number;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
};
