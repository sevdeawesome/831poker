const card = require('./card');


class DeckOfCards{
  constructor()
  {
    this.totalCards = 52;
    this.deck = [];
    this.suits = ['s', 'c', 'h', 'd'];
    this.deckCounter = 0;



    for(var i = 0; i < this.suits.length; i++)
    {
      for(var j = 2; j < 15; j++)
      {
        this.deck[(i * 13) + (j - 2)] = new card(this.suits[i], j);
      }
    }
  }

  getSuits(){
    return this.suits;
  }

  getDeck(){
    return this.deck;
  }

  shuffle(){
    for(var i = 0; i < 52; i++)
    {
      var randomSpot = Math.round(Math.random() * 51);

      var temp = this.deck[i];
      this.deck[i] = this.deck[randomSpot];
      this.deck[randomSpot] = temp;
    }
    return null;
  }

  deal(){
    return this.deck[this.deckCounter++];
  }

}




module.exports = DeckOfCards;
