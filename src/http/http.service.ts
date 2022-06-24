import { Injectable } from '@nestjs/common';
import { HttpRequestConfig, HttpRequstReturnType, HttpService } from './http.type';
import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

@Injectable()
export class DefaultHttpService implements HttpService {
  private readonly client = applyCaseMiddleware(axios.create());
  
  constructor() {

  }

  async get(path: string, config?: HttpRequestConfig): Promise<HttpRequstReturnType> {
    console.log('GET | REQ', config);
    const res = await this.client.get(path, config);
    console.log('GET | RES', res.data);
    return res;
  }

  async post(path: string, data: unknown, config?: HttpRequestConfig): Promise<HttpRequstReturnType> {
    console.log('POST | REQ', data);
    const res = await this.client.post(path, data, config);
    console.log('POST | RES', res.data);
    return res;
  }
}
