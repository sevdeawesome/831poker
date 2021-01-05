const card = require('./card');


class playerHand
{
  constructor(c1, c2){
    this.holeCard1 = c1;
    this.holeCard2 = c2;
  }
  getHoleCard1(){
    return this.holeCard1;
  }
  getHoleCard2(){
    return this.holeCard2;
  }
  getStringHand(){
    var x = '' + this.holeCard1.cardToString() + " and " + this.holeCard2.cardToString();
    return x;
  }
  getPNGHand(){
    var x = '' + this.holeCard1.cardToPNG() + " " + this.holeCard2.cardToPNG();
    return x;
  }



}


module.exports = playerHand;
