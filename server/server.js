
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
const pokerHand = require("./pokerHand");
const handEvaluator = require("./handEvaluator");



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
    io.to(theGame.getGameID()).emit('roomPlayers', theGame.emitPlayers());
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
       io.to(theGame.getGameID()).emit('roomPlayers', theGame.emitPlayers());
       io.to(user.getRoom()).emit('roomUsers', {room: user.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes()});
      }
    }
      
      
  });



  

  sock.on('message', (text) => {
    var theGame = getGameFromSockID(sock.id);
    io.to(theGame.getGameID()).emit("message", text);

    
  });


  var interval = null;
  //setTimeout(function(){ playermove = "f"; }, turnTime);

  //when someone hits start game
  sock.on('startGame', () =>{

    //console.log(io.sockets.clients());
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
    

    //Starting a new poker hand:
    let handOfPoker = theGame.newHand();


    //io.to(theGame.getPlayerAt(theGame.getDealerIdx()).getSock()).emit('yourTurn', theGame.getTurnTime());
    //theGame.getPlayerAt(theGame.getDealerIdx()).setValTurn

   
    //Sending clients the players hands
  

    //var currPlayer = theGame.getPlayerFromSockID(sock);
   // currPlayer.setTurn(true);
  
  });



  //when they submit their turn
  
  sock.on('playerTurn', (turnVariable) =>{
    
    var turnVar = turnVariable;
    let theGame = getGameFromSockID(sock.id);
    let hand = theGame.returnHand();
    let player = hand.getCurrPlayer();

    //if valid option
    if(hand.validOption(turnVar))
    {
      //console.log("Player has chosen a valid option");
      io.to(player.getSock()).emit('validOption');
      player.setValTurn(turnVar);
      //Changes player to check if they autofolded where they could have checked
      if( (player.getValTurn() == "autoFold" && hand.getCurrBet() == 0) || (player.getValTurn() == "autoFold" && hand.getCurrBet() == player.getCurrMoneyInPot() ) )
      {
        player.setValTurn("check");
        turnVar = "check";
      }
      console.log(player.getName() + " has chosen action: " + player.getValTurn());
      hand.playerTurn(turnVar);
    }
    else{
      sock.emit()
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


module.exports = {
  getio: function() {

    return io;
}
}