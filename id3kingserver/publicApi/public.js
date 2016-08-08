var dbHandler = require('.././dbHandler.js');

module.exports = [
  {
      method: 'GET',
      path: '/get',
      handler: function (request, reply) {
          reply(dbHandler.values);
      }
  },
  {
      method: 'GET',
      path: '/wewew',
      handler: {
        file: {
            path: '../how.txt',
        }
      }
  }
];
