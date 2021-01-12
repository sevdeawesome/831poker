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
    this.valTurn = "undefined";
    this.currMoneyInPot = 0;
  }

  minusFromStack(num)
  {
    this.stackSize-=num;
  }
  getStackSize(){
    return this.stackSize;
  }
  addToStack(num)
  {
    this.stackSize+=num;
  }
  addCurrMoneyInPot(a){
    this.currMoneyInPot += a;
  }
  getCurrMoneyInPot(){
    return this.currMoneyInPot;
  }
  setValTurn(a){
    this.valTurn = a;
    console.log(this.getName() + "'s valTurn is now: " + this.getValTurn());
  }
  getValTurn(){
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

  setHand(c1, c2){
    this.hand = new playerHand(c1, c2);
    console.log(this.name + " in " + this.room + " got dealt " + this.hand.getStringHand());
  }

}


module.exports = player;










