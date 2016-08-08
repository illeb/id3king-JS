var publicApi = require('./publicApi/public.js')

var routes = [].concat(publicApi);

//pubblica un unico array di routes, per darlo in pasto a index.js
module.exports = routes;
