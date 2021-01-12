const pokerGame = require('./pokerGame');
const player = require('./player');
const e = require('express');
const handEvaluator = require('./handEvaluator');

class pokerHand
{
    constructor(game){
    
    this.io = require('./server').getio();
    this.theGame = game;
    this.communityCards = [];
    this.playersInHand = this.theGame.getAllPlayers();
    this.dealerIdx = this.theGame.getDealerIdx() % this.theGame.getTotalPlayers();
    this.dealer = this.getPlayers()[this.dealerIdx];
    this.bigBlind = this.getNextPlayer(this.getNextPlayer(this.dealer));
    //Player who raised/bet last
    this.initialRaiser;
    //Players whos turn it currently is. (Starts at UTG).
    this.currPlayer = this.getNextPlayer(this.getNextPlayer(this.getNextPlayer(this.dealer)));
    this.moneyInPot = 0;
    this.currBet = 0;
    this.preflop = true;
    this.handComplete = false;
    this.flopDealt = false;
    this.turnDealt = false;
    this.riverDealt = false;
    

    this.runHand();
}




   //Function that starts the hand, starts preflop betting, calls updateHand() - >
   
   //does the round of betting
   //Deals the flop
   //Round of betting, if only 1 person left - > they win the pot
   //Deals the turn
   //Round of betting, if only 1 person left - > they win the pot
   //Deals the River
   //Round of betting, if only 1 person left - > they win the pot
   //Showdown, two people compare hands and whoever wins, - > they win the pot

   runHand()
   {
       for(var i = 0; i < this.playersInHand.length; i++)
       {
            console.log(this.playersInHand[i].getName() + " value is: " + this.playersInHand[i].getValTurn());
       }
       console.log("Curr money in pot is: " + this.moneyInPot);
       this.collectSmallBlind();
       this.collectBigBlind();
       this.currBet = this.theGame.getBB();
       //console.log(this.io);
       //Deal the hands and emit to the client the hands the players got
       this.theGame.shuffle();
       this.theGame.dealHands();
       this.emitEverything();

       //Sets initial raiser to big blind
       this.initialRaiser = this.getNextPlayer(this.getNextPlayer(this.dealer));
       console.log("Dealer is: " + this.dealer.getName());
       this.updateHand();
       //console.log(this.initialRaiser);
       //this.io.to(this.theGame.getPlayerAt(this.theGame.getDealerIdx()).getSock()).emit('yourTurn', this.theGame.getTurnTime());
       //var preFlopBets = bettingRound()

   }


   updateHand()
   {
       console.log("Current player is: " + this.getCurrPlayer().getName());
       //Updates all players clients with currentStack Sizes, the current cards on board, and if players are folded or not
       this.emitEverything();
       //If only one player left, that player wins the hand and receives money in their stack

       if(this.getPlayers().length == 1)
       {
           this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getPlayers()[0].getName() +" has won the pot of: " + this.getPot());
           this.getPlayers()[0].addToStack(this.moneyInPot);
           console.log("hand over");
           this.emitEverything();
           this.handComplete = true;

           //creates a new game in 5 seconds
           this.io.to(this.theGame.getGameID()).emit('consoleLog', "A new hand is starting in 5 seconds");
           this.theGame.clearGame();
           this.handComplete = true;
       }

       //If there are players left to act before the initial raiser, take their turn (when it gets to the intial raiser again, betting round is over)
       
       if(this.handComplete == false){
       if(this.checkIfPlayersLeftToAct())
       {
           console.log("Keep on going more players need to act");
            this.io.to(this.theGame.getGameID()).emit('consoleLog', "It is " + this.getCurrPlayer().getName() +"'s turn");
            this.io.to(this.currPlayer.getSock()).emit('yourTurn', this.theGame.getTurnTime());
       }
       //If there are no players left to act in the betting round, then the game needs to either deal the flop, turn, river, or get the winner of the hand at showdown.
       else{
           if(this.flopDealt == false)
           {
               this.preflop = false;
                this.dealFlop();
                //sets the current player, Tells current player to act it is their turn, and clears the current bet for the next round, also clears the actions of the players in the hand (sets them all to undefined)
                this.currBet = 0; 
                this.currPlayer = this.getNextPlayer(this.dealer); 
                this.initialRaiser = null;
                this.clearMoves();
                
                this.emitEverything();
                this.io.to(this.getCurrPlayer().getSock()).emit('yourTurn', this.theGame.getTurnTime());
                this.flopDealt = true;
           }
           else if(this.turnDealt == false)
           {
               this.dealTurn();
               //sets the current player, Tells current player to act it is their turn, and clears the current bet for the next round, also clears the actions of the players in the hand (sets them all to undefined)
               this.currBet = 0; 
               this.currPlayer= this.getNextPlayer(this.dealer); 
               this.initialRaiser = null;
               this.clearMoves();
               
               this.emitEverything();
               this.io.to(this.getCurrPlayer().getSock()).emit('yourTurn', this.theGame.getTurnTime());
               this.turnDealt = true;
           }
       
           else if(this.riverDealt == false)
           {
               this.dealRiver();
               //sets the current player, Tells current player to act it is their turn, and clears the current bet for the next round, also clears the actions of the players in the hand (sets them all to undefined)
               this.currBet = 0; 
               this.currPlayer = this.getNextPlayer(this.dealer); 
               this.initialRaiser = null;
               this.clearMoves();

               this.emitEverything();
               this.io.to(this.getCurrPlayer().getSock()).emit('yourTurn', this.theGame.getTurnTime());
               this.riverDealt = true;
           }
           //Get winner at showdown and award them the pot. Hand is now over.
           else
           {
                var winner = this.getWinner();
                

                //emit the winner string
                this.io.to(this.theGame.getGameID()).emit("consoleLog", "\n \n" + winner.getName() + " has won the pot of: $ " + this.moneyInPot)

                console.log(winner.getName() + "has won the pot of: $" + this.moneyInPot);

                //Clears all players Money in pot values, clears all turn vals and sets them all to undefined, and moves the dealer Index up by one for the next hand.
                this.emitEverything();
                winner.addToStack(this.moneyInPot);
                this.io.to(this.theGame.getGameID()).emit('consoleLog', "A new hand is starting in 5 seconds");
                this.theGame.clearGame();
                this.handComplete = true;
                
           }
       }
       
       }
       
       //console.log("Current User is: " + this.currPlayer.getName());
       //this.io.to(this.currPlayer.getSock()).emit('yourTurn', this.theGame.getTurnTime());
    }
    

        
   

   playerTurn(valTurn)
   {
       if(this.initialRaiser == null)
       {
           this.initialRaiser = this.getCurrPlayer();
           console.log("Setting initial raiser to: " + this.getCurrPlayer().getName());
       }
    if(valTurn == "check")
    {
        this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getCurrPlayer().getName() + " has checked. " );
    }
    else if(valTurn == "call")
    {
        this.getCurrPlayer().minusFromStack(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.moneyInPot += Number(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.getCurrPlayer().addCurrMoneyInBettingRound(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());

        //For split pots
        this.getCurrPlayer().addCurrMoneyInPot(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInPot());
        

        this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getCurrPlayer().getName() + " has called. " );
    }

    else if(valTurn == "fold" || valTurn =="autoFold")
    {
        this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getCurrPlayer().getName() + " has folded. " );
    }
 
    //Raise/ bet section
    else
    {
        
        this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getCurrPlayer().getName() + " has raised to: " + valTurn);
        this.getCurrPlayer().minusFromStack(valTurn - this.getCurrPlayer().getCurrMoneyInBettingRound());
        
        this.currBet = Number(valTurn);
        
        this.moneyInPot += Number(valTurn - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.getCurrPlayer().addCurrMoneyInBettingRound(valTurn - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.initialRaiser = this.getCurrPlayer();

        //For split pots
        this.getCurrPlayer().addCurrMoneyInPot(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInPot());
    }

    //Special Case: It is preflop and everyone checked to the bigBlind and he checked, doesnt move to the next player so the betting round ends.
    if(valTurn == "check" && this.getCurrPlayer() == this.bigBlind && this.getCurrBet() == this.theGame.getBB() && this.preflop == true)
    {
        this.playersInHand = this.updatePlayersLeftInHand();
        this.updateHand();
        this.preflop = false;
        this.emitEverything();
    }
    //Move to the next player
    else{

    console.log(this.getCurrPlayer().getName() + " has $: " + this.getCurrPlayer().getCurrMoneyInPot() + " and now current pot is: " + this.getPot());
    console.log(this.currPlayer.getName() + "'s turn is over. Now moving to " + this.getNextPlayer(this.getCurrPlayer()).getName() +"'s turn.");
    this.currPlayer = this.getNextPlayer(this.getCurrPlayer());

    this.playersInHand = this.updatePlayersLeftInHand();
    
    //This player turn is over, move to the next thing
    this.emitEverything();
    this.updateHand();
    }
   }

   validOption(valTurn)
   {
       if(valTurn == null)
        {
            return false;
        }
       //If valTurn == check
        if(valTurn == "check")
        {
            //If big blind or straddle, and noone raises your bb/straddle, you can check
            if(this.getCurrBet() == this.getCurrPlayer().getCurrMoneyInPot())
            {
                return true;
            }
            if(this.getCurrBet() != 0)
            {
                //Tells player they cannot check, they must either call or raise
                this.io.to(this.currPlayer.getSock()).emit('consoleLog', "You cannot check. The current bet is: " + this.getCurrBet() + ", you must either call or raise");
                return false;
            }
            
            return true;
        }
        else if(valTurn == "call")
        {
            if(this.getCurrBet() == this.getCurrPlayer().getCurrMoneyInBettingRound() && this.preflop)
            {
                this.io.to(this.currPlayer.getSock()).emit('consoleLog', "You cannot call. You're big blind dummy");
                return false;
            }
            if(this.getCurrBet() == 0)
            {
                this.io.to(this.currPlayer.getSock()).emit('consoleLog', "You cannot call. There is no current bet.");
                return false;
            }
            return true;
        }
        else if(valTurn == "fold" || valTurn == "autoFold")
        {
            return true;
        }
        //Does not let big blind fold preflop, also if there is no current bet, just sets the players value to check 
        else if(valTurn == "autoFold")
        {

        }
        //Bet/Raise
        else
        {
            if(valTurn == 0)
            {
                this.io.to(this.currPlayer.getSock()).emit('consoleLog', "Thats not a bet thats a check you retard.");
                return false;
            }
            //If they try to bet less than currbet
            if(this.getCurrBet() > valTurn)
            {
                this.io.to(this.currPlayer.getSock()).emit('consoleLog', "Invalid bet. You must at least call the current bet of: " + this.getCurrBet());
                return false;
            }
            //Try to bet more than their stack size
            if(valTurn > this.getCurrPlayer().getStackSize())
            {
                this.io.to(this.currPlayer.getSock()).emit('consoleLog', "Invalid bet. You cannot bet an amount greater than your stack size");
                return false;
            }
            return true;
        }
        
    
   }




   collectSmallBlind()
   {
      // console.log(this.getNextPlayer(this.dealer));
       //console.log(this.theGame.getSB());

       this.getNextPlayer(this.dealer).minusFromStack(this.theGame.getSB());
       this.getNextPlayer(this.dealer).addCurrMoneyInPot(this.theGame.getSB());
       this.getNextPlayer(this.dealer).setCurrMoneyInBettingRound(this.theGame.getSB());
       this.moneyInPot += this.theGame.getSB();
      //console.log("Collected small blind from: " + this.getNextPlayer(this.dealer).getName());
       this.io.to(this.getNextPlayer(this.dealer).getSock()).emit('consoleLog', "You are assigned small blind and " + this.theGame.getSB() + " has been taken from your stack");
   }

   collectBigBlind()
   {
       this.getNextPlayer(this.getNextPlayer(this.dealer)).minusFromStack(this.theGame.getBB());
        this.getNextPlayer(this.getNextPlayer(this.dealer)).addCurrMoneyInPot(this.theGame.getBB());
        this.getNextPlayer(this.getNextPlayer(this.dealer)).setCurrMoneyInBettingRound(this.theGame.getBB());
       this.moneyInPot += this.theGame.getBB();
       //console.log("Collected big blind from: " + this.getNextPlayer(this.getNextPlayer(this.dealer)).getName());
       this.io.to(this.getNextPlayer(this.getNextPlayer(this.dealer)).getSock()).emit('consoleLog', "You are assigned big blind and " + this.theGame.getBB() + " has been taken from your stack");
   }

   dealFlop(){
    for(var j = 0; j < 3; j++)
    {
        this.communityCards[j] = this.theGame.getDeck().deal();
    }
    console.log("The Flop has been dealt \n \n \n");
    this.io.to(this.theGame.getGameID()).emit('consoleLog', "The Flop has been dealt");
    }       

    dealTurn(){
        
        this.communityCards[3] = this.theGame.getDeck().deal();
        console.log("The Turn has been dealt \n \n \n");
        this.io.to(this.theGame.getGameID()).emit('consoleLog', "The Turn has been dealt");
    }
    dealRiver(){
        this.communityCards[4] = this.theGame.getDeck().deal();
        console.log("The River has been dealt \n \n \n");
        this.io.to(this.theGame.getGameID()).emit('consoleLog', "The River has been dealt");
    }

    getWinner()
    {
        let handEval = new handEvaluator(this.communityCards);

        var currWinner = this.playersInHand[0];
        

        //Broadcast to the room what everyone has
        for(var i = 0; i < this.playersInHand.length; i++)
        {
            console.log(this.playersInHand[i].getName() + " has " + (handEval.evaluateHandForString(this.playersInHand[i].getHand())));
            this.io.to(this.theGame.getGameID()).emit('consoleLog', this.playersInHand[i].getName() + " has " + handEval.evaluateHandForString(this.playersInHand[i].getHand()) );
        }

        for(var i = 0; i < this.playersInHand.length; i++)
        {
            if(handEval.returnBestHand(currWinner.getHand(), this.playersInHand[i].getHand()) == this.playersInHand[i].getHand())
            {
                currWinner = this.playersInHand[i];
            }
        }

        this.io.to(this.theGame.getGameID()).emit('consoleLog', currWinner.getName() + " wins the hand with " + handEval.evaluateHandForString(currWinner.getHand()) );
        console.log(currWinner.getName() + " wins the hand with: " + handEval.evaluateHandForString(currWinner.getHand()));

		return currWinner;
    }


   

    //Main function
    


    //Taking turns


    //Helper functions

    emitEverything(){
        //[[playernames], [stacksizes], [isTurn], [currMoneyInBettingRound], [allHands] (for showHand Functionality)]
        var arr = [];

        //this.io.to(this.theGame.getGameID()).emit('handInfo', arr);
        this.io.to(this.theGame.getGameID()).emit('hands', this.theGame.returnDisplayHands());
      //  this.io.to(this.theGame.getGameID()).emit('roomUsers', {room: this.theGame.getGameID(), users: this.theGame.getAllNames(), stacksizes: this.theGame.getAllStackSizes()});
        this.io.to(this.theGame.getGameID()).emit('dealBoard', this.getCardPNGs());
        this.io.to(this.theGame.getGameID()).emit('potSize', this.getPot());
    }
    getPlayers()
    {
        return this.playersInHand;
    }

    getCurrPlayer()
    {
        return this.currPlayer;
    }

    getDealer()
    {
        return this.dealer;
    }
    getPot()
    {
        return this.moneyInPot;
    }
    getCurrBet()
    {
        return this.currBet;
    }

    getIndexOfPlayer(player){
        var playersLeft = this.Players();
        for(var i = 0; i < playersLeft.length; i++){
            if(player.getName() == playersLeft[i].getName())
            {
                return i;
            }
        }
    }

    checkIfPlayersLeftToAct()
    {
        var playersLeft = this.getPlayers();
        for(var i = 0; i < playersLeft.length; i++){
            if (playersLeft[i].getValTurn() == "undefined"){
                return true;
            }
        }

        if(this.currPlayer == this.initialRaiser)
        {
            console.log("No more players left to act, reached initial raiser, returning false with " + this.currPlayer.getName() + "'s turn");
            return false;
        }
        
        return true;
    }
    

    //Get the next in order player, assumes all players in this.playersInhand are still in the hand (as they should be).
    getNextPlayer(player){
        for(var i = 0; i < this.playersInHand.length; i++)
        {
            if(this.playersInHand[i].getName() == player.getName())
            {
                if(i == this.playersInHand.length - 1)
                {
                    return this.playersInHand[0];
                }
                else{
                    return this.playersInHand[i+1];
                }
            }
        }
    }


    //updates the players array with a list of players that arent folded. Should be called after every fold/turn
    updatePlayersLeftInHand(){

        var playersStillLeft= [];
        for(var i = 0; i <  this.playersInHand.length; i++){
             if(this.playersInHand[i].getValTurn() != "fold" && this.playersInHand[i].getValTurn() != "autoFold"){
                playersStillLeft.push(this.playersInHand[i]);
            }
        }
        return playersStillLeft;
    }

    clearMoves(){
        for(var i = 0; i <  this.playersInHand.length; i++){
            this.playersInHand[i].setValTurn("undefined");
            this.playersInHand[i].setCurrMoneyInBettingRound(0);
        }

    }

    getCardPNGs(){
        var cardPNGS = [];
            for(var i = 0; i < this.communityCards.length; i++)
                {
                    var info = this.communityCards[i].cardToPNG();
                    cardPNGS.push(info);
                }
            return cardPNGS;
    }
    


}



/**
 * updatePokerHand()
    {
        //If theres still players to bet, let them keep betting
        if(this.theGame.getNextPlayer(this.currPlayer) != this.lastRaiser)
        {
            //Continue calling turnTimer function on next player
            turnTimer = setTimeout(function(){
                theGame.getNextPlayer(this.currPlayer).setValTurn("autoFolded");
                console.log()
            })
        }
    }


       //If they get autofolded but they can check, it changes it to them checking instead, or special big blind case where it just lets them check
    else if(valTurn =="autoFold")
    {
        if(this.getCurrBet() == 0 || (this.getCurrBet() == this.getCurrPlayer().getCurrMoneyInPot()))
        {
            console.log("gets here");
            this.getCurrPlayer().setValTurn("check");
            this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getCurrPlayer().getName() + " has checked. " );
        }
        else{
            this.io.to(this.getCurrPlayer().getSock()).emit('consoleLog', "You have been folded by autofolder bot");
            this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getCurrPlayer().getName() + " has folded. " );
        }
    }

    ^
    |
    |

    This should be handled clientside, by emiting the current bet to the current player so if they get autofolded, it just changes it to check if the current bet is 0 on the client side.
 */


module.exports = pokerHand;