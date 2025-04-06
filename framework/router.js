class Router {
    constructor() {
      this.endpoints = {};
    }
  
    request(method = "GET", path, handler) {
      if (!this.endpoints[path]) {
        this.endpoints[path] = {};
      }
  
      if (this.endpoints[path][method]) {
        throw new Error(`${method} уже реализован по адресу ${path}`);
      }
  
      this.endpoints[path][method] = handler;
    }
  
    get(path, handler) {
      this.request("GET", path, handler);
    }
  
    post(path, handler) {
      this.request("POST", path, handler);
    }
  
    put(path, handler) {
      this.request("PUT", path, handler);
    }
  
    patch(path, handler) {
      this.request("PATCH", path, handler);
    }
  
    delete(path, handler) {
      this.request("DELETE", path, handler);
    }
  }
  
  module.exports = Router;
  