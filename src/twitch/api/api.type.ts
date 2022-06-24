import { HttpRequstReturnType } from "src/http/http.type";

export abstract class TwitchApiService {
  public abstract getLastClips(): Promise<HttpRequstReturnType>;
}