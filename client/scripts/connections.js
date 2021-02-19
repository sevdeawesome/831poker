var username = document.getElementById('username').value;
var stacksize = document.getElementById('stacksize').value;
var lobbyname = document.getElementById('lobbyname').value;
var password = document.getElementById('password').value;

var poop = 43;

//Submitting create and join requests to the server. The server will send back a 'goodJoin' or 'goodCreate' if the input received was valid.
$(document).ready(function(){
    $(".joinConnection").click(function(event){

        
        event.preventDefault();

        username = document.getElementById('username').value;
        stacksize = document.getElementById('stacksize').value;
        lobbyname = document.getElementById('lobbyname').value;
        password = document.getElementById('password').value;

        sock.emit('joinAttempt', {username, stacksize, lobbyname, password});
        

      });

    $(".createConnection").click(function(event){

        event.preventDefault();

        username = document.getElementById('popupusername').value;
        stacksize = document.getElementById('popupstacksize').value;
        lobbyname = document.getElementById('popuplobbyname').value;
        smallBlind = document.getElementById('popupsmallblind').value;
        bigBlind = document.getElementById('popupbigblind').value;
        password = document.getElementById('popuppassword').value;

        sock.emit('createAttempt', {username, stacksize, lobbyname, smallBlind, bigBlind, password});

        

      });
      
    });

    //Moving user to the next html page (poker.html) if theyre request to create or join a game was valid.
    
    sock.on('goodJoin', () => {
       
        localStorage.setItem('name', (username));
        localStorage.setItem('lobby', (lobbyname));
        localStorage.setItem('stacksize', (stacksize));

        window.location.href = "/poker.html";
        // sock.emit('joinRoom', {username, stacksize, lobbyname});
        // sock.emit('test', username + " successfully joined the lobby: " + lobbyname);

    });

    sock.on('goodCreate', () => {
        sock.emit('createRoom', {username, stacksize, lobbyname, smallBlind, bigBlind, password});
        sock.emit('test', username + " successfully created the lobby: " + lobbyname + " with password: " + password);
        
        localStorage.setItem('name', (username));
        localStorage.setItem('lobby', (lobbyname));
        localStorage.setItem('stacksize', (stacksize));

        window.location.href = "/poker.html";

    });

    sock.on('badJoin', (text) => {
        alert(text);
    });

    sock.on('badCreate', (text) => {
        alert(text);
    });

    // sock.on('redirect', (location) => {
    //     window.location.href = location;
    //     sock.emit('joinAfterSwitchHref', );
    //     //sock.emit('joinRoom', {username, stacksize, lobbyname});
    // });