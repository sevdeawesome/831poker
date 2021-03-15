
$( document ).ready(function() {
  tabcontent = document.getElementsByClassName("tabcontent");
  tabcontent[1].style.display = "none";
});

function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
  }

  function openOption(evt, optName){
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcont");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("menuoptions");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(optName).style.display = "block";
    evt.currentTarget.className += " active";
  }



var slider = document.getElementById("myRange");
var raise = document.getElementById("raise");

raise.value = slider.value;
slider.max = Number(yourStack+currMoneyInBetting);


slider.oninput = function() {
  slider.max = Number(yourStack+currMoneyInBetting);
  raise.value = this.value;
  console.log("Money in:" + currMoneyInBetting);
  console.log("stack:" + yourStack);
}
raise.oninput = function() {

  slider.value = Number(this.value+currMoneyInBetting);
}

function quarterRaise(){
  raise.value = Math.floor(currPot / 4);
  slider.value = Math.floor(currPot / 4);
}
function halfRaise(){
  raise.value = Math.floor(currPot / 2);
  slider.value = Math.floor(currPot / 2);
}
function allInRaise(){
  raise.value = yourStack ;
  slider.value = Number(yourStack + currMoneyInBetting);
}
var pauseButton = document.getElementById("pause");
pauseButton.onclick = function() {
  sendPauseUnPause();
}
var qRaise = document.getElementById("quarterRaise");
qRaise.onclick = function(){
  quarterRaise();
};
var hRaise = document.getElementById("halfRaise");
hRaise.onclick = function(){
  halfRaise();
};
var aRaise = document.getElementById("allInRaise");
aRaise.onclick = function(){
  allInRaise();
};

