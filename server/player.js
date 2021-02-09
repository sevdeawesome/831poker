const playerHand = require('./playerHand');



class player {
  constructor(name, stacksize, s, room){
    this.hand = null;
    this.stackSize = stacksize;
    this.sockID = s;
    this.name = name;
    this.handsWon = 0;
    this.room = room;
    this.valTurn = "undefined";
    this.currMoneyInPot = 0;
    this.currMoneyInBettingRound = 0;
    this.allIn = false;
    this.isTurn = false;
    this.hasHand = true;
  }
  setHasHand(a){
    this.hasHand = a;
  }
  getHasHand(){
    this.hasHand;
  }
  setTurn(a){
    this.isTurn = a;
  }
  getTurn(){
    return this.isTurn;
  }
  isAllIn(){
    return this.allIn;
  }
  setAllIn(){
    this.allIn = true;
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
    this.stackSize+=Number(num);
  }
  addCurrMoneyInPot(a){
    this.currMoneyInPot += a;
  }
  getCurrMoneyInPot(){
    return this.currMoneyInPot;
  }
  setCurrMoneyInPot(num){
    this.currMoneyInPot=num;
  }
  getCurrMoneyInBettingRound(){
    return this.currMoneyInBettingRound;
  }
  addCurrMoneyInBettingRound(num){
    this.currMoneyInBettingRound += num;
  }
  setCurrMoneyInBettingRound(num){
    this.currMoneyInBettingRound = num;
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
  resetInfo(){
    this.currMoneyInPot = 0;
    this.valTurn = "undefined";
    this.currMoneyInBettingRound = 0;
    this.allIn = false;
  }

  setHand(c1, c2){
    this.hand = new playerHand(c1, c2);
    console.log(this.name + " in " + this.room + " got dealt " + this.hand.getStringHand());
  }

}


module.exports = player;










