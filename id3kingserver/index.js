const Hapi = require('hapi');
const cron = require('cron');
const Inert = require('inert');
//carica tutte le routes di routes.js
var routes = require('./routes.js');
var dbHandler = require('./dbHandler.js');
const Path = require('path');
const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'frontEnd')
            }
        }
    }
});

server.connection({ port: 8081   });
server.register(Inert, () => {});
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);

    if(dbHandler.dbExist())
      dbHandler.getValues();
    else {
      dbHandler.rebuildDB();
        dbHandler.getValues();
    }


    cron.job("30 30 8 * * Sun", function(){
         dbHandler.rebuildDB();
         dbHandler.getValues();
     }).start();
});

server.route(routes);
