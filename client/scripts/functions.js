
//create text
function writeEvent(text)
{
  //the ul createElement
  const parent = document.querySelector("#events");

  //the li getElementBy
  const el = document.createElement('li');
  el.innerHTML = text;

  parent.appendChild(el);

  //scroll to bottom on receive
  var getChat = document.querySelector("#events");
  getChat.scrollTop = getChat.scrollHeight;
};

function writeConsoleEvent(text)
{
  //the ul createElement
  const parent = document.querySelector("#console");

  //the li getElementBy
  const el = document.createElement('li');
  el.innerHTML = text;

  parent.appendChild(el);

  //scroll to bottom on receive
  var getChat = document.querySelector("#console");
  getChat.scrollTop = getChat.scrollHeight;
};


//sending chats
function onFormSubmitted(e)
{
  e.preventDefault();

  const input = document.querySelector("#chat");
  const text = input.value;
  input.value = '';
  sock.emit('message', username + ": " + text);
};


//BEGIN THE GAME
function startGame(){
  console.log("You have startde the game");
  sock.emit('startGame');
  
}

//get their name and roomnumber and stack size
const {username, stacksize, lobbyname} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});


// function outputUsers(users, stacksizes){
//   userList.innerHTML = '';
//   var stacksizecounter = 0;
//   users.forEach(user=>{
//     const li = document.createElement('li');
//     li.innerHTML = user + "<br> stacksize:" +  stacksizes[stacksizecounter++] + "<br><img class='opponentCards' src='../img/blue_back.png'></img> <img class='opponentCards' src='../img/blue_back.png'></img>";
//     //li.innerText = user;
//     userList.appendChild(li);
    
//   });
// }

function outputRoom(room){
  roomName.innerHTML = room;
}
function joinARoom(e){
  e.preventDefault();
}

function showHand(arr){

  var userInHand = false;

  for(var i = 0; i < arr.length; i++){
  
    if(username == arr[i].name){
      var hand = arr[i].hand;
      var handArr = hand.split(" ");
      var str1 = "img/" + handArr[0];
      var str2 = "img/" + handArr[1]
      document.getElementById("card1").src=str1;
      document.getElementById("card2").src=str2;
      //writeEvent(arr[i].hand);
      userInHand = true;

    }
    if(userInHand == false){
      document.getElementById("card1").src="img/blue_back.png";
      document.getElementById("card2").src="img/blue_back.png";
    }
  }
 
}

function showBoard(arr){
  var board = document.getElementById("theBoard");

  $("#theBoard").empty();
  for(var i = 0; i < arr.length; i++)
  {
    const li = document.createElement('li');
    li.innerHTML = "<img class='boardCard' src='../img/" + arr[i] + "'></img>";
    board.appendChild(li);
  }
}



//sending a turn to the server
function sendCheck(e)
{
  if(yourTurn)
  {
  e.preventDefault();  //prevent from reloading page
  sock.emit('playerTurn', "check");

  }
  else{
    e.preventDefault();  //prevent from reloading page
    writeEvent("Not your turn");
  }
}
function sendCall(e){
  if(yourTurn)
  {
  e.preventDefault();  //prevent from reloading page
  sock.emit('playerTurn', "call");

  }
  else{
    e.preventDefault();  //prevent from reloading page
    writeEvent("Not your turn");
  }
}
function sendFold(e){
  if(yourTurn)
  {
  e.preventDefault();  //prevent from reloading page
  sock.emit('playerTurn', "fold");

  }
  else{
    e.preventDefault();  //prevent from reloading page
    writeEvent("Not your turn");
  }
}
function sendRaise(e){
  if(yourTurn)
  {
    e.preventDefault();  //prevent from reloading page
    const raiseInput = document.querySelector("#raise");
    const raiseVal = raiseInput.value;
    sock.emit('playerTurn', raiseVal);

  }
  else{
    e.preventDefault();  //prevent from reloading page
    writeEvent("Not your turn");
  }
  
}
function sendAllIn(){
  sock.emit('playerTurn', "playerIsAllIn");
}
