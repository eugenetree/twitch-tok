import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { camelizeKeys, decamelizeKeys } from "humps";

const isResponseFromStream = (response: AxiosResponse) => {
  return response.data?.headers?.['content-type'] === 'binary/octet-stream';
}

export const applyAxiosCaseConverter = (axios: AxiosInstance): AxiosInstance => {
  axios.interceptors.response.use((response: AxiosResponse) => {
    if (response.data && !isResponseFromStream(response)) {
      response.data = camelizeKeys(response.data);
    }
    return response;
  })

  axios.interceptors.request.use((config: AxiosRequestConfig) => {
    if (config.params || config.data) {
      config.params = decamelizeKeys(config.params);
    }
    return config;
  });

  return axios;
}