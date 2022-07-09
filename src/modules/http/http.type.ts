import { AxiosRequestConfig, AxiosResponseHeaders } from "axios";

export type HttpRequestHeaders = Record<string, string | number | boolean>;

export type ResponseType =
  | 'arraybuffer'
  | 'blob'
  | 'document'
  | 'json'
  | 'text'
  | 'stream';

export type HttpRequestConfig = {
  headers?: Record<string, string | number | boolean>;
  params?: Record<string, unknown>;
  data?: Record<string, unknown>;
  responseType?: ResponseType;
}

export type HttpRequstReturnType<Data = any> = {
  data: Data;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export abstract class HttpService {
  abstract get(path: string, config?: HttpRequestConfig): Promise<HttpRequstReturnType>;
  abstract post(path: string, data: unknown, config?: HttpRequestConfig): Promise<HttpRequstReturnType>;
}