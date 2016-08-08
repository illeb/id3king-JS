var dbHandler = require('.././dbHandler.js');

module.exports = [
  {
      method: 'POST',
      path: '/getData',
      handler: function (request, reply) {
          reply(dbHandler.values);
      }
  },
  {//FIXME:for debugging only, needs delete on release!
      method: 'GET',
      path: '/rebuildDB',
      handler: function (request, reply) {
             dbHandler.rebuildDB();
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
