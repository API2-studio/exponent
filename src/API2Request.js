import API2QueryEncoder from "./API2QueryEncoder";
import API2RequestBuilder from "./API2RequestBuilder";
import axios from "axios";

export default class API2Request {
  constructor(baseURL, headers, params) {
    this.baseURL = baseURL;
    this.headers = headers;
    this.params = params;
  }

  async makeRequest(method, path, body = null) {
    try {
      const response = await axios({
        method: method,
        url: `${this.baseURL}/${path}`,
        headers: this.headers,
        params: this.params,
        data: body,
      });
      return response.data;
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  }

  async get(path) {
    return this.makeRequest("get", path);
  }

  async post(path, body) {
    return this.makeRequest("post", path, body);
  }

  async put(path, body) {
    return this.makeRequest("put", path, body);
  }

  async delete(path) {
    return this.makeRequest("delete", path);
  }
}
