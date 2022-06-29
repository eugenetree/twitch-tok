import { Injectable } from '@nestjs/common';
import { HttpRequestConfig, HttpRequstReturnType, HttpService } from './http.type';
import axios, { AxiosRequestConfig } from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

@Injectable()
export class DefaultHttpService implements HttpService {
  private readonly client = applyCaseMiddleware(axios.create());

  constructor() { }

  async get(path: string, config?: HttpRequestConfig): Promise<HttpRequstReturnType> {
    return axios.get(path, config);
  }

  async post(path: string, data: unknown, config?: HttpRequestConfig): Promise<HttpRequstReturnType> {
    return axios.post(path, data, config);
  }

}

type f = AxiosRequestConfig