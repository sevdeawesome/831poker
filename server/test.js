const card = require('./card');
const playerHand = require('./playerHand');
const DeckOfCards = require("./DeckOfCards");
const Card = require('./card');
const handEvaluator = require('./handEvaluator');


let theDeck = new DeckOfCards(); theDeck.shuffle();

//For rand cards
//let cardsOnBoard = [theDeck.deal(), theDeck.deal(), theDeck.deal()];
//let p2hand = new playerHand(theDeck.deal(), theDeck.deal());
//let p1hand = new playerHand(theDeck.deal(), theDeck.deal());



let cardsOnBoard = [new Card('d', 7), new Card('h', 11), new Card('h', 4), new Card('h', 6)];
let p2hand = new playerHand(new Card('h', 9), new Card('c', 3));

//console.log(cardsOnBoard);
//console.log(p1hand);
//console.log(p2hand.getHoleCard1().abbreviatedString() + ", " + p2hand.getHoleCard2().abbreviatedString());

let handEval = new handEvaluator(cardsOnBoard);

console.log(handEval.evaluateHandForString(p2hand));





//theDeck.shuffle();
//console.log(theDeck);

// console.log(theDeck.getDeck());

// theDeck.shuffle();
// console.log(theDeck.getDeck());
// console.log("card suit: ", p1hand.getHoleCard1().getSuit());
// console.log("card suit: ", p1hand.getHoleCard2().getSuit());
