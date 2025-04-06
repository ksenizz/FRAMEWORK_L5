const EventEmitter = require("events");
const http = require("http");
const url = require("url");

class Framework {
  constructor() {
    this.server = this._createServer();
    this.emitter = new EventEmitter();
    this.middlewares = [];
  }

  listen(port, callback) {
    this.server.listen(port, callback);
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  addRouter(router) {
    for (const path in router.endpoints) {
      const endpoint = router.endpoints[path];
      for (const method in endpoint) {
        this.emitter.on(this._getRouteMask(path, method), (req, res) => {
          endpoint[method](req, res);
        });
      }
    }
  }

  _createServer() {
    return http.createServer((req, res) => {
      let body = "";
      const parsedUrl = url.parse(req.url, true);
      req.url = parsedUrl.pathname;
      req.params = this._getParams(parsedUrl.pathname);
      req.query = parsedUrl.query;

      res.send = (data) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(data);
      };

      res.json = (data) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      };

      res.status = (code) => {
        res.writeHead(code);
        return res;
      };

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        if (body) {
          try {
            req.body = JSON.parse(body);
          } catch (e) {
            req.body = body;
          }
        }

        this._applyMiddleware(req, res, () => {
          const emitted = this.emitter.emit(
            this._getRouteMask(req.url, req.method),
            req,
            res
          );

          if (!emitted) {
            res.status(404).send("Not Found");
          }
        });
      });

      req.on("error", (err) => {
        console.error("Request error:", err);
        res.status(500).send("Internal Server Error");
      });
    });
  }

  _getRouteMask(path, method) {
    return `[${path}]:[${method}]`;
  }

  _applyMiddleware(req, res, next) {
    let index = 0;

    const nextMiddleware = () => {
      if (index < this.middlewares.length) {
        this.middlewares[index++](req, res, nextMiddleware);
      } else {
        next();
      }
    };

    nextMiddleware();
  }

  _getParams(path) {
    const pathParts = path.split("/").filter(part => part);
    const params = {};
    if (pathParts.length > 0 && pathParts[0].startsWith(":")) {
      params.id = pathParts[0].slice(1);
    }
    return params;
  }
}

module.exports = Framework;
