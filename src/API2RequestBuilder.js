import axios from 'axios'; // Ensure axios is installed and imported
import API2QueryEncoder from './API2QueryEncoder'; // Adjust the path as necessary
import API2Request from './API2Request'; // Adjust the path as necessary

export default class API2RequestBuilder {
  constructor(baseURL = '') {
    this.request;
    this.baseURL = baseURL;
    this.headers = {};
    this.params = {};
    this.encoder = new API2QueryEncoder();
    this.path = '';
    this.request = null;
  }

  reset() {
    this.baseURL = '';
    this.headers = {};
    this.params = {};
    this.encoder.reset();
    this.path = '';
    this.request = null;
  }
  
  setBaseURL(url) {
    this.baseURL = url;
    return this; // Support method chaining
  }

  setHeader(key, value) {
    this.headers[key] = value;
    return this;
  }

  setParams(params) {
    this.params = { ...this.params, ...params };
    return this;
  }

  buildRequest() {
    this.request = new API2Request(this.baseURL, this.headers, this.params);
    return this.request;
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
      return this.decodeResponse(response);
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  async get(path) {
    return this.makeRequest('get', path);
  }

  async post(path, body) {
    return this.makeRequest('post', path, body);
  }

  // Implement put, delete, etc., similarly

  decodeResponse(response) {
    return response.data; // Customize this method as needed based on your API's response structure
  }
}
