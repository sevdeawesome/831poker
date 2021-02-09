const card = require('./card');
const playerHand = require('./playerHand');
const DeckOfCards = require("./DeckOfCards");
const Card = require('./card');
const handEvaluator = require('./handEvaluator');
const player = require('./player');
const pokerGame = require('./pokerGame');

let theDeck = new DeckOfCards(); theDeck.shuffle();

//For rand cards
let cardsOnBoard = [theDeck.deal(), theDeck.deal(), theDeck.deal()];
let p2hand = new playerHand(new Card('c', 9), new Card('c', 3));

let p1hand = new playerHand(new Card('s', 9), new Card('d', 3));




//let cardsOnBoard = [new Card('d', 7), new Card('h', 11), new Card('h', 4), new Card('h', 6)];
//let p2hand = new playerHand(new Card('h', 9), new Card('c', 3));

//console.log(cardsOnBoard);
//console.log(p1hand);
//console.log(p2hand.getHoleCard1().abbreviatedString() + ", " + p2hand.getHoleCard2().abbreviatedString());

let handEval = new handEvaluator(cardsOnBoard);

console.log("P1hand: " + p1hand.getStringHand());
console.log("P2hand: " + p2hand.getStringHand());
console.log("Board is: " + cardsOnBoard[0].cardToString()+", "+ cardsOnBoard[2].cardToString()+", "+ cardsOnBoard[2].cardToString());
console.log(handEval.returnBestHand(p1hand, p2hand));

if(handEval.returnBestHand(p1hand, p2hand) == p1hand)
{
    console.log("p1 wins");
}
else if(handEval.returnBestHand(p1hand, p2hand) == p2hand){
    console.log("p2 wins");
}
else{
    console.log("Tie Game");
}


//var time = Date.now();
//function autoFold()

/** 
var game = new pokerGame();
game.playerJoin(new player("Jim", 200, 20, "200"));
game.playerJoin(new player("Joe", 200, 202, "200"));
game.playerJoin(new player("Jaq", 200, 201, "200"));

*/




//theDeck.shuffle();
//console.log(theDeck);

// console.log(theDeck.getDeck());

// theDeck.shuffle();
// console.log(theDeck.getDeck());
// console.log("card suit: ", p1hand.getHoleCard1().getSuit());
// console.log("card suit: ", p1hand.getHoleCard2().getSuit());
