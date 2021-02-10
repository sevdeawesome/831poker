
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
yourStack = stacksize;



function outputRoom(room){
  roomName.innerHTML = room;
}
function joinARoom(e){
  e.preventDefault();
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
  sock.emit('audio', "check");
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
  sock.emit('audio', "raise");
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
  sock.emit('audio', "fold");
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

function playAudio(name){
  var audio = null;
  if(name == "yourTurn"){
    audio = new Audio('sounds/yourTurn.mp3');
  }
  else if(name == "check"){
    audio = new Audio('sounds/check.mp3');
  }
  else if(name == "raise"){
    audio = new Audio('sounds/raise.wav');
  }
  else{
    audio = new Audio('sounds/fold.wav')
  }
  audio.play();
}


 

//shows all the other player objects, appends to #playersList
function createPlayers(playerArr){
  var dealerIndex = playerArr.shift();
  console.log(dealerIndex);
  var playersList = document.getElementById("playersList");
  var yourIndex = 0;
  playersList.innerHTML = "";

  for(var j = 0; j < playerArr.length; j++){

    var currPlayer = playerArr[j];
    if(currPlayer.name == username){
      yourIndex = j;
      var str1 = "img/" + currPlayer.card1;
      var str2 = "img/" + currPlayer.card2;
      document.getElementById("card1").src=str1;
      document.getElementById("card2").src=str2;

      var myPlayer = document.getElementById("myPlayer");
     
      // myPlayer.className = "";
      myPlayer.classList.add("dealer");
      myPlayer.classList.add("youGlow");

      currMoneyInBetting = currPlayer.moneyIn;
      console.log(currPlayer.moneyIn);
      yourStack = currPlayer.stack;

      console.log(yourStack);
      document.getElementById("myName").innerText = currPlayer.name;
      document.getElementById("myStack").innerText = currPlayer.stack;
      document.getElementById("myMoneyInPot").innerText = currPlayer.moneyIn;
      if(j != dealerIndex){
            myPlayer.classList.remove("dealer");
      }
      if(currPlayer.isTurn == false){
        myPlayer.classList.remove("youGlow");
      }
    }
  }

  for(var i = yourIndex + 1; i < playerArr.length; i++){
    var currPlayer = playerArr[i];
    appendPlayer(currPlayer, i, dealerIndex);
  }
  for(i = 0; i < yourIndex; i++){
    var currPlayer = playerArr[i];
    appendPlayer(currPlayer, i, dealerIndex);
  }

}

function appendPlayer(currPlayer, i, dealerIndex){
  var playersList = document.getElementById("playersList");
    //creates a new player element in the list
    var card1 = "img/blue_back.png";
    var card2 = "img/blue_back.png";

    //if(currPlayer.isFolded)
    console.log(currPlayer.valTurn);
    if(currPlayer.valTurn == "folded" || currPlayer.valTurn == "autoFold" || currPlayer.valTurn == "fold" ){
      card1 = "img/folded_back.png";
      card2 = "img/folded_back.png";
    }
    else if(currPlayer.hasHand == false){
      card1 = "";
      card2 = "";
    }

    var liElement = document.createElement('li');
    if(i == dealerIndex){
      liElement.classList.add("dealer");
    }
    if(currPlayer.isTurn == true){
      liElement.classList.add("glow");
    }
    liElement.classList.add("player");

    liElement.innerHTML = '<img class="leftTilt opponentCards" src="' + card1 + '">';
    liElement.innerHTML += '<img class="rightTilt opponentCards" src="' + card2 + '"><div class="playerp"><span class="opponentName"> ' + currPlayer.name 
    + '</span> <br> <span class="opponentStackSize">' +currPlayer.stack + 
    '</span> </div> <span class="opponentMoneyInPot">' + currPlayer.moneyIn + '</span></div>' + '<img class="dealerchip" src="img/DEALER-CHIP.png">';
    playersList.appendChild(liElement);
}
/*
 [dealerPosition, {name, stacksize, currMoneyInBettingRound, isFolded, card1, card2, isShown1, isShown2, isStraddled, isTurn, hasHand}]
<li class="player">
        <img class='opponentCards leftTilt' src='../img/blue_back.png'></img><img class='opponentCards rightTilt' src='../img/blue_back.png'></img><br>
        <p>Name <br> <span class="opponentStackSize">2000</span><hr><span class="opponentMoneyInPot">200</span></p>
      </li>

function outputUsers(users, stacksizes){
  userList.innerHTML = '';
  var stacksizecounter = 0;
  users.forEach(user=>{
    const li = document.createElement('li');
    li.innerHTML = user + "<br> stacksize:" +  stacksizes[stacksizecounter++] + "<br><img class='opponentCards' src='../img/blue_back.png'></img> <img class='opponentCards' src='../img/blue_back.png'></img>";
    //li.innerText = user;
    userList.appendChild(li);
    
  });
}

*/