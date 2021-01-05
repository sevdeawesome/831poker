
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
   
    //Sending clients the players hands
    io.to(theGame.getGameID()).emit('hands', theGame.returnDisplayHands());

    //Dealing board test
    // io.to(theGame.getGameID()).emit('dealBoard', theGame.dealFullBoard());

    // io.to(theGame.getGameID()).emit('message', "The winner of this hand is: " + theGame.getWinner().getName());


    /*
      GAME TURNS GO HERE

    */
    //post blinds

    //round of turns
    const turnTime = 500;
    // var players = theGame.getAllPlayers();
    var playerIndex = 0;
    var currPlayer = theGame.getPlayerAt(playerIndex);
    var numPlayers = theGame.getPlayersLength();
  
      io.to(theGame.getGameID()).emit('message', currPlayer.getName() + "'s turn ");
    
    function getPlayersTurn(player){      ///GETTING ALL PLAYERS TURNS START
      var playermove = "u";

       //they check-->
      
      
      function checkIfMoved()
      {
        player.setTurn(true);
        

        //tries to check condition
        if(player.getValTurn() == "a"){
           theGame.playerCheck(player);
        }

        //tries to call condition
        if(player.getValTurn() == "b"){
          
          
        }

        //tries to raise condition
        else if(player.getValTurn() > 0){
          theGame.playerRaise(player);
        }


        //folds condition
        if(player.getValTurn() == "f"){
          theGame.playerFold(player);
        }

        

        //autofolder
        if(playermove == "f" ){
          theGame.playerAutoFold(player);
        }



        //if they enter a move
        if(player.getValTurn() != 'u' || playermove == "f" || player.getValTurn() == "f" || player.getValTurn() == "pf"){
          clearInterval(interval);
          console.log(player.getName());
          console.log(player.getValTurn());
          
          player.setTurn(false);

          //if more players still need to go
          if(playerIndex < numPlayers - 1){
            playerIndex++;
            currPlayer = theGame.getPlayerAt(playerIndex);
            io.to(theGame.getGameID()).emit('message', currPlayer.getName() + "'s turn ");
            if(player.getValTurn() != "f" && playermove != "f"){
              player.setValTurn("u");
            }
            getPlayersTurn(currPlayer);
            
            
          }

          //round over condition --> all players have been cycled through
          else if(playerIndex == numPlayers - 1){
            //still needs to deal
            if(theGame.getNeedsDeal()){
              io.to(theGame.getGameID()).emit('dealBoard',  theGame.deal());
              theGame.clearMoves();
              playerIndex = 0;
              currPlayer = theGame.getPlayerAt(playerIndex)
              io.to(theGame.getGameID()).emit('message', currPlayer.getName() + "'s turn ");
              getPlayersTurn(currPlayer);
              
            }
            //all streets have been won condition
            else{
              theGame.dealWin();
              io.to(player.getRoom()).emit('roomUsers', {room: player.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes()});
              console.log(theGame.getWinner().getName() + " has won the hand!!!");
              io.to(player.getRoom()).emit("message", theGame.getWinner().getName() + " has won the hand!!!");
            }
            
          }
        }

       
  
      }
      setTimeout(function(){ playermove = "f"; }, turnTime);
      var interval = setInterval(checkIfMoved, 100);
      
    }  //GETTING ALL PLAYERS TURNS END

    getPlayersTurn(currPlayer);

   
   


 


    //flop
    //round of turns
    //turn
    //round of turns
    //river
    //return winner

    /*
      GAME TURNS GO HERE

    */
  
  });



  //when they submit their turn
  
  sock.on('playerTurn', (turnVariable) =>{
    let theGame = getGameFromSockID(sock.id);
    let player = theGame.getCurrentUser(sock.id);
    if(player.getTurn()){
      player.setValTurn(turnVariable);

    }
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
