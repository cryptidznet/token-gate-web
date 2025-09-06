export type ServiceResponse<T = unknown> = {
  success: boolean;
  message: string;
  responseObject?: T;
  statusCode: number;
};
