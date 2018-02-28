const http = require('http');
const express = require('express');
const proto = require('./server');

function ExpressPeerServer(server, options) {
  var app = express();

  Object.assign(app, proto);

  options = app._options = Object.assign({
    debug: false,
    timeout: 5000,
    key: 'peerjs',
    ip_limit: 5000,
    concurrent_limit: 5000,
    allow_discovery: false,
    proxied: false
  }, options);

  // Connected clients
  app._clients = {};

  // Messages waiting for another peer.
  app._outstanding = {};

  // Mark concurrent users per ip
  app._ips = {};

  if (options.proxied) {
    app.set('trust proxy', options.proxied);
  }

  app.on('mount', function() {
    if (!server) {
      throw new Error('Server is not passed to constructor - '+
        'can\'t start PeerServer');
    }

    // Initialize HTTP routes. This is only used for the first few milliseconds
    // before a socket is opened for a Peer.
    app._initializeHTTP();
    app._setCleanupIntervals();
    app._initializeWSS(server);
  });

  return app;
}

exports = module.exports = class PeerServer {
  constructor (options = {}) {
    this.options = options;
    const { path = '/' } = options;

    const app = express();
    const server = this.server = http.createServer(app);

    var peerjs = ExpressPeerServer(server, options);
    app.use(path, peerjs);
  }

  start () {
    const { port = 9000 } = this.options;
    this.server.listen(port);
  }
}