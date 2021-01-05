//write events when received from Server

//get their name and roomnumber and stack size

const sock = io();

const userList = document.getElementById('userList');
const roomName = document.getElementById('roomName');

sock.emit('joinRoom', {username, stacksize, lobbyname});

sock.on('message', (text) => {
  writeEvent(text);
  //scroll down
  // var chatMessages = document.querySelector
  //n chatMessages.scrollTop = chatMessages.scrollHeight;
});
writeEvent("Welcome to Sevnet Poker");

//Takes room info and list of users from the server and displays them
sock.on('roomUsers', ({room, users, stacksizes}) => {
  outputUsers(users, stacksizes);
  outputRoom(room);
} );

sock.on('gameBegun', () => {
  // var button = document.getElementById("generate");
  console.log("someone started a game!!!!");
  $("#generate").hide();
});


sock.on('hands', (arr) => {
 showHand(arr);
});

sock.on('dealBoard', (arr) => {
  showBoard(arr);
});




document.querySelector("#chat-form").addEventListener('submit', onFormSubmitted);  //send chat messae
document.getElementById("generate").addEventListener('click', startGame); //start game button
document.getElementById("checkbutton").addEventListener('click', sendCheck);
document.getElementById("callbutton").addEventListener('click', sendCall);
document.getElementById("foldbutton").addEventListener('click', sendFold);
document.getElementById("raisebutton").addEventListener('click', sendRaise);