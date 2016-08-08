const crypto = require('crypto');
const hash = crypto.createHash('sha256');

var routes = [
  /*{
      method: 'GET',
      path: '/test1',
      handler: function (request, reply) {
          reply('Hello, test1' + encodeURIComponent(request.params.name) + '!');

      }
  },
  {
      method: 'GET',
      path: '/test2',
      handler: function (request, reply) {
          reply('Hello test2!');

      }
  }*/
  {
      method: 'GET',
      path: '/login/changepsw/{password?}',
      handler: function (request, reply) {

          crypto.randomBytes(64, function(error, buff){
              if (error) throw err;
              var salt = buff.toString('hex');
              hash.update(salt + request.params.password);
              var hashWithSalt = hash.digest('hex');
              reply(request.params.password);
          });
      }
  }
];

/*
var routes = [];
routes.push({
    method: 'POST',
    path: '/login/login/{login}',
    handler: function (request, reply) {

        reply('Hello, world!');
    }
});*/
/*
routes.push({
    method: 'GET',
    path: '/login/changepsw/{password?}',
    handler: function (request, reply) {
        crypto.randomBytes(64, function(error, buff){
            if (err) throw err;
            debugger;
            hash.update(buff.toString('hex') + request.params.password);
            var test = hash.digest('hex');
            debugger;
        });
        reply('Hello, world!');
    }
});*/

//esponi questi routes all'"esterno", in modo da poter essere presi dal file routes.js
module.exports = routes;
