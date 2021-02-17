//your stacksize var
var yourStack;
var currPot = 0;
var currMoneyInBetting = 0;


const sock = io();

const userList = document.getElementById('userList');
const roomName = document.getElementById('roomName');

sock.on('goodJoin', () => {

})

sock.on('goodCreate', () => {

})


//sock.emit('joinRoom', {username, stacksize, lobbyname});

sock.on('message', (text) => {
  writeEvent(text);
  //scroll down
  // var chatMessages = document.querySelector
  //n chatMessages.scrollTop = chatMessages.scrollHeight;
});

sock.on('consoleLog', (text) =>{
  writeConsoleEvent(text);
})

//Takes room info and list of users from the server and displays them
sock.on('roomUsers', ({room, users, stacksizes}) => {
  outputRoom(room);
} );

sock.on('gameBegun', () => {
  // var button = document.getElementById("generate");
  console.log("someone started a game!!!!");
  $("#generate").hide();
});



sock.on('dealBoard', (arr) => {
  showBoard(arr);
});

sock.on('potSize', (num) => {
  var pot = document.querySelector("#potSize");
  pot.innerText = '';
  pot.innerText = "Pot Size: " + num;
  currPot = num;
});

sock.on('allIn', () => {
  sendAllIn();
});

var timeOut;
var yourTurn = false;
var timer = document.getElementById("timer");
var timeRemainingOnScreen;
//When client recieves message 'yourTurn', starts a timer that 
sock.on('yourTurn', (turnTime) => {

  //play sound
  var audio = new Audio('sounds/yourTurn.mp3');
  audio.play();
  var count = turnTime / 1000;

  timeRemainingOnScreen = setInterval(function(){
    count -= 1;
    timer.innerText = count;
  }, 1000);

  //timer.innerText = "Time left:";
  yourTurn = true;
  //writeEvent(turnTime);
  writeConsoleEvent("You have " + turnTime/1000 + " seconds to take your turn until folded");
  timeOut = setTimeout(function(){
    sock.emit('playerTurn', "autoFold");
    writeConsoleEvent("Time has run out, you have been auto check/folded.");
    clearInterval(timeRemainingOnScreen);
    timer.innerText = '';
    yourTurn = false;
  }, turnTime);
});

sock.on('validOption', () => {

  clearTimeout(timeOut);
  clearInterval(timeRemainingOnScreen);
  timer.innerText = '';
  yourTurn = false;
});

sock.on("roomPlayers", (roomPlayers) =>{
  createPlayers(roomPlayers);
});

sock.on("audio", (audiotype) =>{
  playAudio(audiotype);
});

document.querySelector("#chat-form").addEventListener('submit', onFormSubmitted);  //send chat messae
document.getElementById("generate").addEventListener('click', startGame); //start game button
document.getElementById("checkbutton").addEventListener('click', sendCheck);
document.getElementById("callbutton").addEventListener('click', sendCall);
document.getElementById("foldbutton").addEventListener('click', sendFold);
document.getElementById("raisebutton").addEventListener('click', sendRaise);



