var dbHandler = require('.././dbHandler.js');

module.exports = [
  {
      method: 'POST',
      path: '/getData',
      handler: function (request, reply) {
          reply(dbHandler.values);
      }
  },
  {
  method: 'GET',
   path: '/{param*}',
   handler: {
       directory: {
           path: '.',
           redirectToSlash: true,
           index: true
       }
   }
 }
];
