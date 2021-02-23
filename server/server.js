
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
const e = require("express");



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
    console.log("someone connected, sock ID is: " + sock.id);

  sock.on('test', (text) => {
    console.log(text);
  });

  sock.on('joinAttempt', ({username, stacksize, lobbyname, password}) => {
    console.log(username + "is attempting to join lobby: " + lobbyname);
    var gameFound = false;
    for(var i = 0; i < listOfPokerRooms.length; i++)
    {
      if(listOfPokerRooms[i].getGameID() == lobbyname){
        gameFound = true;
        if(listOfPokerRooms[i].checkIfNameIsInGame(username))
        {
          io.to(sock.id).emit('badJoin', "Someone already is using this name");
        }
        else if(listOfPokerRooms[i].getPassword() != password)
        {
          io.to(sock.id).emit('badJoin', "Incorrect password for the lobby: " + lobbyname);
        }
        else if(stacksize <= 0)
        {
          io.to(sock.id).emit('badJoin', "Stack is less than 0, please try again");
        }
        else{
          io.to(sock.id).emit('goodJoin');
        }
      }
    }
    if(!gameFound)
    {
      console.log(username + " attempted to join lobby: " + lobbyname + ", but lobby was not found. :L");
      io.to(sock.id).emit('badJoin', "Lobby with name: " + lobbyname + " not found. :(");
    }
  });

  sock.on('createAttempt', ({username, stacksize, lobbyname, smallBlind, bigBlind, password}) => {
    gameCreated = false;
    for(var i = 0; i < listOfPokerRooms.length; i++)
    {
      if(listOfPokerRooms[i].getGameID() == lobbyname)
      {
        gameCreated = true;
      }
    }

    if(gameCreated == true)
    {
      io.to(sock.id).emit('badCreate', "The lobby: " + lobbyname + " has already been created");
    }
    else if(stacksize <= 0)
    {
      io.to(sock.id).emit('badCreate', "Invalid Default stack size, please try again");
    }
    else if(smallBlind > bigBlind)
    {
      io.to(sock.id).emit('badCreate', "Invalid small/big blind set up");
    }
    else{
      io.to(sock.id).emit('goodCreate');
      //console.log(username + " successfully created a new Lobby with ID: " + lobbyname);
    }
    
  });

  
  sock.on('createRoom', ({username, stacksize, lobbyname, smallBlind, bigBlind, password}) => {
    var theGame = new pokerGame(lobbyname);
    theGame.smallBlind = Number(smallBlind);
    theGame.bigBlind = Number(bigBlind);
    theGame.password = password;
    theGame.defaultStackSize = Number(stacksize);
    console.log("New game created with ID: " + lobbyname);
    listOfPokerRooms.push(theGame);
        // const user = new player(username, stacksize, sock.id, lobbyname);

        // //Actually join the room
        // sock.join(user.getRoom());

        // //console.log(user);
        // theGame.playerJoin(user);

    //Send users client the room name and info so it can display
    // io.to(user.getRoom()).emit('roomUsers', {room: user.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes()});
    // io.to(theGame.getGameID()).emit('roomPlayers', theGame.emitPlayers());
    // io.to(user.getRoom()).emit('message', theGame.getCurrentUser(sock.id).getName() + " is now spectating...");
    
  });

  sock.on('joinRoom', (arrLobbynameUserNameStackSize) => {

    //Find lobby for user
    var lobbyname = arrLobbynameUserNameStackSize[0];
    var username = arrLobbynameUserNameStackSize[1];
    var stacksize = Number(arrLobbynameUserNameStackSize[2]);

    let theGame = null;
    for(var i = 0; i < listOfPokerRooms.length; i++)
    {
      if(listOfPokerRooms[i].getGameID() == lobbyname)
      {
        theGame = listOfPokerRooms[i];
        console.log("Found game: " + lobbyname);
      }
    }
    
    const user = new player(username, stacksize, sock.id, lobbyname);

    // //Create new game
    // if(!isCreated)
    // {
    //     theGame = new pokerGame(lobbyname);
    //     console.log("New game created with ID: " + lobbyname);
    //     listOfPokerRooms.push(theGame);
    // }
    

    console.log(username + " joined: " + lobbyname);


    //check if the game has already started, if so  they cant click button
    if(theGame.getBegun()){
      sock.emit('gameBegun');
    }

    //Actually join the room
    sock.join(user.getRoom());

    //console.log(user);
    theGame.playerJoin(user);

    //Send users client the room name and info so it can display'
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

  sock.on('audio', (name) => {
    var theGame = getGameFromSockID(sock.id);
    io.to(theGame.getGameID()).emit("audio", name);

    
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