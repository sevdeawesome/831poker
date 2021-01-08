
const http = require("http");
const express = require("express");
const socketio = require("socket.io");



//sock.emit() // only emit to sock
// io.emit() //emit to all sockets
// sock.broadcast.emit() //emit to all sockets except sock


//importing poker classes
const card = require('./card');
const player = require("./player");
const playerHand = require('./playerHand');
const DeckOfCards = require("./DeckOfCards");
const { pokerGame, getAllPlayers} = require("./pokerGame");
const pokerRound = require("./pokerRound");




//server setup
const app = express();
const clientPath = `${__dirname}/../client`;
app.use(express.static(clientPath));
console.log(`Serving static from ${clientPath}`);
const server = http.createServer(app);
const listOfPokerRooms = [];

const io = socketio(server);

//server setup


//on connection listening



io.on('connection', (sock) => {
//inside connect
    console.log("someone connected!");

  sock.on('joinRoom', ({username, stacksize, lobbyname}) => {
    //Check for room already made
    let theGame = null;
    var isCreated = false;
    for(var i = 0; i < listOfPokerRooms.length; i++)
    {
      if(listOfPokerRooms[i].getGameID() == lobbyname)
      {
        isCreated = true;
        theGame = listOfPokerRooms[i];
      }
    }

    //Create new game
    if(!isCreated)
    {
        theGame = new pokerGame(lobbyname);
        console.log("New game created with ID: " + lobbyname);
        listOfPokerRooms.push(theGame);
    }
    

    console.log(username + " joined: " + lobbyname);


    //check if the game has already started, if so  they cant click button
    if(theGame.getBegun()){
      sock.emit('gameBegun');
    }
    const user = new player(username, stacksize, sock.id, lobbyname);

    //Actually join the room
    sock.join(user.getRoom());

    //console.log(user);
    theGame.playerJoin(user);

    //Send users client the room name and info so it can display
    io.to(user.getRoom()).emit('roomUsers', {room: user.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes()});

    io.to(user.getRoom()).emit('message', theGame.getCurrentUser(sock.id).getName() + " is now spectating...");

  });


  sock.on('disconnect', () => {
    //Going through array of games to see if the sock was in any of them
    var theGame = getGameFromSockID(sock.id);
    if(theGame != null)
    {
      const user = theGame.getCurrentUser(sock.id);
      if(user != null)
      {
       io.to(theGame.getGameID()).emit("message",  theGame.getCurrentUser(sock.id).getName() + " has left the channel")
       console.log(theGame.getCurrentUser(sock.id).getName() + " has left the channel");
       theGame.playerLeave(sock.id);
       io.to(user.getRoom()).emit('roomUsers', {room: user.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes()});
      }
    }
      
      
  });



  

  sock.on('message', (text) => {
    var theGame = getGameFromSockID(sock.id);
    io.to(theGame.getGameID()).emit("message", text);

    
  });


  //setTimeout(function(){ playermove = "f"; }, turnTime);

  //when someone hits start game
  sock.on('startGame', () =>{
    var theGame = null;
    for(var i = 0; i < listOfPokerRooms.length; i++)
    {
      if(listOfPokerRooms[i].checkIfSockIDisInGame(sock.id))
      {
        theGame = listOfPokerRooms[i];
        listOfPokerRooms[i].setBegun(true);
      }
    }
    console.log("Someone has started the game in: " + theGame.getGameID());
    io.to(theGame.getGameID()).emit('gameBegun');
    theGame.setBegun(true);

    //the game has begun so the game goes in here
    theGame.shuffle();
    theGame.dealHands();
    let player = theGame.getCurrentUser(sock.id);
    //Sending clients the players hands
    io.to(theGame.getGameID()).emit('hands', theGame.returnDisplayHands());

    var currPokerRound = new pokerRound(theGame, player);
    currPokerRound.getNextThing();

    
  
  });



  //when they submit their turn
  sock.on('playerTurn', (turnVariable) =>{
    let theGame = getGameFromSockID(sock.id);
    let player = theGame.getCurrentUser(sock.id);
    let currPokerRound = theGame.getCurrPokerRound();
    //it is their turn -- allow stuff to happen
    if(player.getTurn()){
      //emit everything, getnextThing
      currPokerRound.getNextThing();


      io.to(theGame.getGameID()).emit('hands', theGame.returnDisplayHands());
      io.to(user.getRoom()).emit('roomUsers', {room: user.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes()});
      io.to(theGame.getGameID()).emit('dealBoard', theGame.getCards());
    }

    //it is not their turn
    else{
      sock.emit('message', "Shut the fuck up retard, play on your turn");
      console.log(player.getValTurn());
    }
    
  });
//inside connect end ->
});




function getGameFromSockID(id){
 
  for(var i = 0; i < listOfPokerRooms.length; i++)
  {
    if(listOfPokerRooms[i].checkIfSockIDisInGame(id))
    {
      return listOfPokerRooms[i];
    }
  }
  return null;
}




server.on('error', (err) =>{
  console.log("error: ", err);
});

server.listen(8080, () => {
  console.log("Server started on port 8080");
});
