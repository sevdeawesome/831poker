const playerHand = require('./playerHand');



class player {
  constructor(name, stacksize, s, room){
    this.hand = null;
    this.stackSize = stacksize;
    this.sockID = s;
    this.name = name;
    this.handsWon = 0;
    this.room = room;
    this.isTurn = false;
    this.valTurn = "u";
    this.currMoneyInPot = 0;
  }
  setCurrMoneyInPot(a){
    this.currMoneyInPot = a;
  }
  getCurrMoneyInPot(){
    return this.currMoneyInPot;
  }
  setvalTurn(a){
    this.valTurn = a;
  }
  getvalTurn(){
    return this.valTurn;
  }
  getRoom(){
    return this.room;
  }
  setName(name)
  {
    this.name = name;
  }
  getTurn(){
    return this.isTurn;
  }
  setTurn(a){
    this.isTurn = a;
  }
  getName()
  {
    return this.name;
  }
  getSock(){
    return this.sockID;
  }
  getHand(){
    return this.hand;
  }
  getStackSize(){
    return this.stackSize;
  }
  setHand(c1, c2){
    this.hand = new playerHand(c1, c2);
    console.log(this.name + " in " + this.room + " got dealt " + this.hand.getStringHand());
  }

}


module.exports = player;










