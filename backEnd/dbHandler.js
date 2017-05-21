const fs = require("fs");
const sqlite3 = require('sqlite3');

module.exports.rebuildDB = function(itinerari, localita) {
        //creazione del DB degli itinerari..
        var db = new sqlite3.Database('db_id3king.sqlite3');

        db.serialize(function(){

          db.run("BEGIN TRANSACTION");
          db.run("drop table if exists 'LOCALITA'");
          db.run("CREATE TABLE 'LOCALITA' (" +
                	"'ID'	INTEGER NOT NULL," +
                	"'Nome'	TEXT NOT NULL," +
                	"PRIMARY KEY(ID))");

         db.run("drop table if exists 'ITINERARIO'");
         db.run("CREATE TABLE 'ITINERARIO' (" +
                	"`ID`	INTEGER NOT NULL," +
                	"`Data`	TEXT NOT NULL," +
                	"`Link`	TEXT," +
                	"`Descrizione`	TEXT," +
                	"`Difficolta`	NUMERIC NOT NULL," +
                	"`Durata`	INTEGER," +
                	"`Lunghezza`	INTEGER," +
                	"`Dislivello`	REAL," +
                	"`ID_LOCALITA`	INTEGER," +
                	"FOREIGN KEY(`ID_LOCALITA`) REFERENCES LOCALITA(ID))");

          //db.parallelize? https://github.com/mapbox/node-sqlite3/wiki/Control-Flow
          var stmt = db.prepare("INSERT INTO LOCALITA (ID, Nome) VALUES (?, ?)");
          localita.forEach(function(localita){
              stmt.run(localita.id, localita.nome);
          });
          stmt.finalize();

          stmt = db.prepare("INSERT INTO ITINERARIO (ID, Data, Link, Descrizione, Difficolta, Durata, Lunghezza, Dislivello, ID_LOCALITA) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
          for (var chiave in itinerari) {
            var itinerario = itinerari[chiave];
            if(itinerari.hasOwnProperty(chiave))
                stmt.run(itinerario.id, itinerario.data, itinerario.link, itinerario.descrizione, itinerario.difficolta, itinerario.durata, itinerario.lunghezza, itinerario.dislivello, itinerario.IDlocalita);
          }
          stmt.finalize();
          db.run("END");
          console.log('builded');
        });
};

module.exports.getValues = function(){
    var db = new sqlite3.Database('db_id3king.sqlite3');
    db.all(`SELECT ITINERARIO.ID, Data, Link, Descrizione, Difficolta, Durata, Lunghezza, Dislivello, Nome AS NomeLocalita
            FROM ITINERARIO INNER JOIN LOCALITA ON ITINERARIO.ID_LOCALITA = LOCALITA.ID`, function(err, results) {
                module.exports.values = results;
           });
}

module.exports.dbExist = function(){
    return fs.existsSync('db_id3king.sqlite3');
}
