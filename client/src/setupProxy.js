const proxy = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api/wordnet/',
    proxy({
      target: 'http://server:8080',
      changeOrigin: true,
    }),
  );
};
