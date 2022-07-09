import { Injectable } from '@nestjs/common';
import { HttpRequestConfig, HttpRequstReturnType, HttpService } from './http.type';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { camelizeKeys } from 'humps';
import { applyAxiosCaseConverter } from './http.helpers';

@Injectable()
export class DefaultHttpService implements HttpService {
  private readonly client = applyAxiosCaseConverter(axios.create());

  constructor() {
  }

  async get(path: string, config?: HttpRequestConfig): Promise<HttpRequstReturnType> {
    return this.client.get(path, config);
  }

  async post(path: string, data: unknown, config?: HttpRequestConfig): Promise<HttpRequstReturnType> {
    return this.client.post(path, data, config);
  }
}