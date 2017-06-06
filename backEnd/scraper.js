const cheerio = require('cheerio');
const request = require('request-promise');
const $q = require('q');

var itinerari = {};
var localita = [];
var promises = [];

const siteBaseAddress = "http://www.id3king.it/"
const itinerariBaseAddress =  siteBaseAddress + "Itinerari%20Frame/";
module.exports.scanSite = function(doneCallback) {

  request(itinerariBaseAddress + 'titolo.htm', function(err, response, result) {

    var $ = cheerio.load(result);
    var links = $('a');
    for(var i=0; i < links.length; i++){
        var linkToDate = $(links.eq(i)).attr('href');

        let promise = request(itinerariBaseAddress + linkToDate, function(err, response, result){
            var righe = cheerio.load(result)('tr');
            for(var j=0; j < righe.length; j++) {
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
    return $q.all(promises).done(function() {
      // Ottenimento toponimi principali (LOCALITA)
      let promiseToponimiPrincipali = request(siteBaseAddress + 'toponimi2.htm', function(err, response, result) {
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

          itinerariCollegati.forEach( idItinerario => [idItinerario].IDlocalita = newLocalita.id);
          localita.push(newLocalita);
        }
        doneCallback(itinerari, localita);
      });

      // Ottenimento toponimi secondari (LUOGHI)
      let promiseToponimiSecondari = request(siteBaseAddress + 'TopGen/alfabeto.htm', function(err, response, result) {
        promises = [];
        let luoghi = {};
        let links = cheerio.load(result)('a');
        for (let i = 0; i < links.length; i++) {
          let link = $(links.eq(i)).attr('href'); //ottieni tutti i link delle lettere

          let promise = request(itinerariBaseAddress + 'TopGen/' + link, function(err, response, result) {
              let righe = cheerio.load(result)('tr'); //parsing della singola lettera
              for(let j=0; j < righe.length; j++) {
                    var colonneRiga = righe.eq(j).children('td');
                    let nome = colonneRiga.eq(1).text().replace(/\s\s+/g, ' ');
                    luoghi[nome] = luoghi[nome] == null ? { itinerariCollegati : [] } : luoghi[nome];

                    let itinerariCollegati = colonneRiga.eq(2).text().replace(/\s\s+/g, ' ').replace(/[,]/g, '');
                    itinerariCollegati = itinerariCollegati.split(' ').map(value => parseInt(value)).filter(value => !isNaN(value));
                    itinerariCollegati.forEach( idItinerario => [idItinerario].IDlocalita = newLocalita.id);

                    luoghi[nome].itinerariCollegati = luoghi[nome].itinerariCollegati.concat(itinerariCollegati);
              }
          });
          promises.push(promise);
        }
      });

      $q.all([promiseToponimiPrincipali, promiseToponimiSecondari]).then(function(){
        doneCallback(itinerari, localita);
      });
    });
});
}
