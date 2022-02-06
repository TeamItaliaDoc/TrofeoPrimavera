var getEloRun = false;
var giocatori = [];

var tornei = [];

function elabora() {
    //Carico risultati singoli tornei
    caricaRisultati();

    //Carico i dati di tutti i torne
    for (var i in tornei) {
        //per tutti i primi
        for (var iUser in tornei[i].primi) {
            var username = tornei[i].primi[iUser].toLowerCase();
            //Se non esiste lo creo
            if (! giocatori[username]) 
                creaGiocatore(username);
            
            //Assegno medaglia
            giocatori[username].oro ++;
        }

        //per tutti i secondi
        for (var iUser in tornei[i].secondi) {
            var username = tornei[i].secondi[iUser].toLowerCase();
            //Se non esiste lo creo
            if (! giocatori[username]) 
                creaGiocatore(username);
            
            //Assegno medaglia
            giocatori[username].argento ++;
        }

        //Per tutti i terzi
        for (var iUser in tornei[i].terzi) {
            var username = tornei[i].terzi[iUser].toLowerCase();
            //Se non esiste lo creo
            if (! giocatori[username]) 
                creaGiocatore(username);
            
            //Assegno medaglia
            giocatori[username].bronzo ++;
        }
    };    

    //Leggo avatar
    getAvatar();
}

function getAvatar() {
    //Cerco avatar
    for (var username in giocatori) {
        /*if (username == 'a550')
        {
            giocatori[username].avatar = "https://betacssjs.chesscomfiles.com/bundles/web/images/user-image.152ee336.svg";
           continue;
        }
        */
          getAvatarUrl('https://api.chess.com/pub/player/' + username);
    }
}     

function getAvatarUrl(url)
{
    //Eseguo funzione per ricercare un avatar
    $.getJSON(url,function(dataAvatar){
        if (dataAvatar.avatar) {
            giocatori[dataAvatar.username].avatar = dataAvatar.avatar;
        } else {
            giocatori[dataAvatar.username].avatar = "https://betacssjs.chesscomfiles.com/bundles/web/images/user-image.152ee336.svg";
        }
        giocatori[dataAvatar.username].url = dataAvatar.url;
        giocatori[dataAvatar.username].displayName = dataAvatar.url.substr(29, dataAvatar.url.length-29);

        //Se è bannato lo considero già stampato
        if (dataAvatar.status == 'closed:fair_play_violations') {
            giocatori[dataAvatar.username].posizione = 999;
        }

        //Se non ho caricato tuti gli avatar esengo ancora la funzione
        for (var username in giocatori) {
            if (! giocatori[username].avatar) {
                return;
            }
        }
  
        //Finito calcolo. Scrivo i risultati 
        //   Controllo se è già partita la fase di scrittura
        //      se arrivano contemporaneamente più caricamenti potrebbe succedere
        if (! getEloRun)
        {
            getEloRun = true;
            //Stampo medagliere 
            stampaMedagliere();

            //Stampo hall of fame
            stampaMedaglireHoF();

        }
    }).error(function(jqXhr, textStatus, error) {
        //è andato in errore ricarico i dati
        getAvatarUrl(this.url);    
        //Per evitare problemi se il giocatore è non esiste,
        //  se va in errore carico l'avatar di default
        //Tolto se il giocatore va in errore bisogna correggere anche stat
        //var username = this.url.substr(33, this.url.length - 32);
        //giocatori[username.toLowerCase()].avatar = "https://betacssjs.chesscomfiles.com/bundles/web/images/user-image.152ee336.svg";

    });

}

function creaGiocatore(apiUsername) {
    //Uso apiUsername perchè così posso inviare sia username che displayname
    var username = apiUsername.toLowerCase()
    giocatori[username] = {};
    giocatori[username].username = username;
    giocatori[username].url = '';
    giocatori[username].avatar = '';
    giocatori[username].displayName = '';
    giocatori[username].oro = 0;
    giocatori[username].argento = 0;
    giocatori[username].bronzo = 0;
    giocatori[username].punti = 0;
    giocatori[username].posizione = 0;
}

function stampaMedagliere() {

    //Azzero totali
    for (var username in giocatori) {
        giocatori[username].posizione = 0;
        giocatori[username].punti = 0;
    }

    //Calcolo punteggi
    for (var username in giocatori) {
        //Calcolo punti
        giocatori[username].punti = giocatori[username].oro * 3 + giocatori[username].argento * 2 + giocatori[username].bronzo
    }

    //Imposto posizione e stampo
    var username = '';
    var max = 0;
    var posizione = 0;
    var nPareggi = 0;
    var oldMax = 0;
    while (max > -1)
    {
        max = -1;
        for (var i in giocatori)
        {
            if ((giocatori[i].posizione == 0) && (giocatori[i].punti > max || (giocatori[i].punti == max) ) && (giocatori[i].punti > 0)) {
                username = i;
                max = giocatori[i].punti;
            }
        }
        if (max > -1) 
        {
            if (oldMax == max)
            {
                nPareggi++;
            } else {
                posizione++;
                posizione += nPareggi;
                nPareggi = 0;
                oldMax = max;
            }    
           giocatori[username].posizione = posizione;

           //Stampo il giocatore
           stampaGiocatore(username);
        }
    }
   
 }
 
function stampaGiocatore(username)
{
    //stampo riga    
    var riga = '<tr class="riga">   <td class="med-col1">#'  + giocatori[username].posizione + '</td>  <td class="med-col-Giocatori">'+
        '<table><tbody><tr>        <td>        <img class="classifica-avatar" src="' + giocatori[username].avatar + '">    </td>    <td width="7px"></td>'+
        '<td><div>            <a class="username" href="' + giocatori[username].url + '" target="”_blank”">' + giocatori[username].displayName + '</a>        </div>         </td>    </tr>'+
        '</tbody></table> </td> ';
       riga += '<td class="med-col2">' + giocatori[username].punti + '</td>'

        riga += '<td class="med-col2">' + giocatori[username].oro + '</td> <td class="med-col2">' + giocatori[username].argento + '</td>  <td class="med-col2">' + giocatori[username].bronzo + '</td>'

    riga += '</tr>';

    $("#medagliere").append(riga)
}


function stampaMedaglireHoF() {

    var riga = '';
    //stampo tutti i tornei
    for (var i in tornei) {
        //stampo riga    
        riga = '<tr class="riga">' +
            '<td class="hall-col1">' + tornei[i].data +'</td>';
        //Primi
        riga += '<td class="hall-col-Giocatori"><table><tbody>';
        for (var iUser in tornei[i].primi) {
            var username = tornei[i].primi[iUser].toLowerCase();
            riga += '<tr> <td> <img class="classifica-avatar" src="' + giocatori[username].avatar + '"> </td> <td width="7px"></td> <td><div>  <a class="username" href="'+ giocatori[username].url + '" target="”_blank”">' + giocatori[username].displayName + '</a> </div> </td> </tr>';
        }
        riga += '</tbody></table> </td>';
        //secondi
        riga += '<td class="hall-col-Giocatori"><table><tbody>';
        for (var iUser in tornei[i].secondi) {
            var username = tornei[i].secondi[iUser].toLowerCase();
            riga += '<tr> <td> <img class="classifica-avatar" src="' + giocatori[username].avatar + '"> </td> <td width="7px"></td> <td><div>  <a class="username" href="'+ giocatori[username].url + '" target="”_blank”">' + giocatori[username].displayName + '</a> </div> </td> </tr>';
        }
        riga += '</tbody></table> </td>';
        //terzi
        riga += '<td class="hall-col-Giocatori"><table><tbody>';
        for (var iUser in tornei[i].terzi) {
            var username = tornei[i].terzi[iUser].toLowerCase();
            riga += '<tr> <td> <img class="classifica-avatar" src="' + giocatori[username].avatar + '"> </td> <td width="7px"></td> <td><div>  <a class="username" href="'+ giocatori[username].url + '" target="”_blank”">' + giocatori[username].displayName + '</a> </div> </td> </tr>';
        }
        riga += '</tbody></table> </td>';
        //Chiudo riga
        riga += '</tr>';

        console.log(riga);

    //stampo
        $("#hall").append(riga);        
    }
}
