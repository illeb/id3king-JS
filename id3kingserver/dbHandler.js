
const cheerio = require('cheerio');
const request = require('request-promise');
const fs = require("fs");
const $q = require('q');
const sqlite3 = require('sqlite3');

const siteBaseAddress = "http://www.id3king.it/"
const itinerariBaseAddress =  siteBaseAddress + "Itinerari%20Frame/";
module.exports.rebuildDB = function() {
      var itinerari = {};
      var localita = [];

      var promises = [];
      //ottenimento di tutti gli anni
      request(itinerariBaseAddress + 'titolo.htm', function(err, response, result) {

        var $ = cheerio.load(result);
        var links = $('a');
        for(var i=0; i < links.length; i++){
            var linkToDate = $(links.eq(i)).attr('href');

            var promise = request(itinerariBaseAddress + linkToDate, function(err, response, result){
                var righe = cheerio.load(result)('tr');
                for(var j=0; j < righe.length; j++){
                    var colonneRiga = righe.eq(j).children('td');
                    var newItinerario = {};
                    newItinerario.id = parseInt(colonneRiga.eq(0).text().replace(/\W/g, ''));
                    newItinerario.link = siteBaseAddress + colonneRiga.eq(0).find('a').attr('href');
                    newItinerario.descrizione = colonneRiga.eq(2).text().replace(/\s\s+/g, ' ');

                    var data = colonneRiga.eq(1).text().replace(/[^\d\/]/g, '').split('/');
                    data[2] = parseInt(data[2]) < 70 ? '20' + data[2] : '19' + data[2]; //se la data è ad esempio /11, allora intendiamo che siamo nel 2011, non 1911
                    newItinerario.data = data[0] + '/' + data[1] + '/' + data[2];

                    var durata = colonneRiga.eq(3).text().replace(/(\s\s+)*[ ']+/g, '');
                    var ore = parseInt(durata.split("h")[0]);
                    var minuti = parseInt(durata.split("h")[1]);
                    newItinerario.durata = ore * 60 + minuti;

                    var lunghezza = colonneRiga.eq(5).text().replace(/\s\s+/g, ' ').replace(/[ ]/g, '');
                    var isKm = lunghezza.toLowerCase().includes('km');
                    lunghezza = parseInt(lunghezza.replace(/\D/g, ""));
                    newItinerario.lunghezza = isKm ? lunghezza * 1000 : lunghezza;

                    newItinerario.difficolta = colonneRiga.eq(4).text().replace(/\s\s+/g, '');
                    newItinerario.dislivello = colonneRiga.eq(6).text().replace(/\s\s+/g, ' ').replace(/[Dh+ m]/g, '');
                    itinerari[newItinerario.id] = newItinerario;
                }
              });
           promises.push(promise);
        }

        //all'ottenimento di tutti i dati degli itinerari (vedi promises), ottieni i dati delle localita...
        $q.all(promises).done(function() {
    			request(siteBaseAddress + 'toponimi2.htm', function(err, response, result) {
    				var righe = cheerio.load(result)('tr');
    				for(var i=0; i < righe.length; i++){

              var colonneRiga = righe.eq(i).children('td');
    				  var newLocalita = {};
    				  newLocalita.id = i;
    				  newLocalita.nome = colonneRiga.eq(0).text().replace(/\s\s+/g, ' ');

    				  var itinerariCollegati = colonneRiga.eq(1).text().replace(/\s\s+/g, ' ').replace(/[,]/g, '');
    				  itinerariCollegati = itinerariCollegati.split(' ')
                .map(function(value){
      					  return parseInt(value);
      				  }).filter(function(value){
      					   return !isNaN(value);
      				  });

    				  itinerariCollegati.forEach(function(idItinerario){
    						itinerari[idItinerario].IDlocalita = newLocalita.id;
    				  });

              localita.push(newLocalita);
    				}

           createDatabase();
    			});
        });

      //creazione del DB degli itinerari..
  	  function createDatabase() {
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
  	  }
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
