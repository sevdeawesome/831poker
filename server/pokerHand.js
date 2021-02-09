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
    this.playersInHand = this.theGame.getEligiblePlayers();
    this.dealerIdx = this.theGame.getDealerIdx() % this.playersInHand.length;
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
       //Runs the hand if game has 2 or more players
       if(this.playersInHand.length > 1)
       {
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

   }


   updateHand()
   {
       console.log("Current player is: " + this.getCurrPlayer().getName());
       console.log("Current player has: $" + this.getCurrPlayer().getCurrMoneyInPot() + " money in the pot currently");
       //Updates all players clients with currentStack Sizes, the current cards on board, and if players are folded or not
       this.emitEverything();
       //If only one player left, that player wins the hand and receives money in their stack

       if(this.getPlayers().length == 1)
       {
           this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getPlayers()[0].getName() +" has won the pot of: " + this.getPot());
           this.io.to(this.theGame.getGameID()).emit('message', this.getPlayers()[0].getName() +" has won the pot of: " + this.getPot());
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
            this.callTurnOnNextPlayer(); 
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
                
                //Deal cards slower if everyone is all in/ only one person can play
                if(this.lessThanTwoCanPlay())
                {
                    var self = this;
                    setTimeout(function() {
                        self.callTurnOnNextPlayer();
                    }, 2000);
                }
                else{
                    this.callTurnOnNextPlayer();
                }
                //this.io.to(this.getCurrPlayer().getSock()).emit('yourTurn', this.theGame.getTurnTime());
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
               
               //Deal cards slower if everyone is all in/ only one person can play
               if(this.lessThanTwoCanPlay())
               {
                   var self = this;
                   setTimeout(function() {
                       self.callTurnOnNextPlayer();0
                   }, 2000);
               }
               else{
                   this.callTurnOnNextPlayer();
               }
               //this.io.to(this.getCurrPlayer().getSock()).emit('yourTurn', this.theGame.getTurnTime());
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
               
               //Deal cards slower if everyone is all in/ only one person can play
               if(this.lessThanTwoCanPlay())
               {
                   var self = this;
                   setTimeout(function() {
                       self.callTurnOnNextPlayer();
                   }, 2000);
               }
               else{
                   this.callTurnOnNextPlayer();
               }

               //this.io.to(this.getCurrPlayer().getSock()).emit('yourTurn', this.theGame.getTurnTime());
               this.riverDealt = true;
           }
           //Get winner at showdown and award them the pot. Hand is now over.
           else
           {
               /** 
               var firstPlayerMoneyInPot = this.playersInHand[0].getCurrMoneyInPot();
               var multiplePots = false;
               var splitPots = [];
                for(var i = 0; i < this.playersInHand.length; i++)
                {
                    if(this.playersInHand[i].getCurrMoneyInPot() != firstPlayerMoneyInPot)
                    {
                        if(splitPot1 == [null, null])
                        {
                            splitPot1 = [this.playersInHand[i].getName(), this.playersInHand[i].getCurrMoneyInPot()]
                        }
                        else if(splitPot2 == [null, null])
                        {
                            splitPot2 = 
                        }
                    }
                } 
                */
                //var handEval = new handEvaluator(this.communityCards);
                //var winner = this.getWinner(this.playersInHand);
                
                this.calculateAndAwardPots();
                

                //emit the winner string
                /** 
                this.io.to(this.theGame.getGameID()).emit("consoleLog", "\n \n" + winner.getName() + " has won the pot of: $ " + this.moneyInPot);
                this.io.to(this.theGame.getGameID()).emit("consoleLog", "\n \n" + winner.getName() + " has won the pot of: $ " + this.moneyInPot + " with: " + handEval.evaluateHandForString(winner.getHand()));
                this.io.to(this.theGame.getGameID()).emit("message", "" +winner.getName() + " has won the pot of: $ " + this.moneyInPot + " with: " + handEval.evaluateHandForString(winner.getHand()));

                console.log(winner.getName() + "has won the pot of: $" + this.moneyInPot);
                */

                //Clears all players Money in pot values, clears all turn vals and sets them all to undefined, and moves the dealer Index up by one for the next hand.
                this.emitEverything();
                //winner.addToStack(this.moneyInPot);
                this.io.to(this.theGame.getGameID()).emit('consoleLog', "A new hand is starting in 5 seconds");
                this.theGame.clearGame();
                this.handComplete = true;
                
           }
       }
       
       }
       
       //console.log("Current User is: " + this.currPlayer.getName());
       //this.io.to(this.currPlayer.getSock()).emit('yourTurn', this.theGame.getTurnTime());
    }

    calculateAndAwardPots()
    {
        var handEval = new handEvaluator(this.communityCards);

        //Go through the players still in the hand, and make a list of the split pots there will be.

        var pots = [];
        for(var i = 0; i < this.playersInHand.length; i++)
        {
            console.log(this.playersInHand[i].getName() + " has: " + this.playersInHand[i].getCurrMoneyInPot() + " money in the pot");
            if(!pots.includes(this.playersInHand[i].getCurrMoneyInPot()))
            {
                pots.push(this.playersInHand[i].getCurrMoneyInPot());
            }
        }
        //console.log(pots);

        //simple bubblesort of pots
        for(var y = 0; y<pots.length;y++){
            for(var index =0; index<pots.length-1; index++){
                if(pots[index]>pots[index+1]){
                    var temp = pots[index];
                    pots[index]=pots[index+1];
                    pots[index+1]=temp;
                }
            }
        }

        //For each split pot, make an index in a new array of winners 
       

        
        //For each pot, check the eligibility of each player in the hand to win the pot, and determine the current winner of the pot.
 
       
        for(var i = 0; i < pots.length; i++)
        {
            var tied = false;
            var numWinners = 1;
            var currWinners = [];
            //Set default winner to the first player in the array of the hand.
            currWinners.push(this.playersInHand[0]);

            //console.log(currWinners);
            //Go through each player
            for(var j = 1; j < this.playersInHand.length; j++)
            {

                if(this.playersInHand[j].getCurrMoneyInPot() >= pots[i])
                {
                    
                    if(handEval.returnBestHand(currWinners[0].getHand(), this.playersInHand[j].getHand()) == currWinners[0].getHand())
                    {
                        //currwinner stays
                        console.log("Curr Winner stays the same with: " + currWinners[0].getName());
                    }
                    else if(handEval.returnBestHand(currWinners[0].getHand(), this.playersInHand[j].getHand()) == this.playersInHand[j].getHand())
                    {
                        console.log("Curr Winner changes to " + this.playersInHand[j].getName());
                        currWinners =[];
                        currWinners[0] = this.playersInHand[j];
                        tied= false;
                    }
                    //split pot case
                    else{
                        //console.log(handEval.returnBestHand(currWinners[0].getHand(), this.playersInHand[j].getHand()));
                        console.log("Pot #: " + i + "is a split pot");
                        tied = true;
                        currWinners[numWinners++] = this.playersInHand[j];
                        console.log("The number of winners is "+numWinners);
                    }
                }
            }
           // console.log(currWinners);

            //counts up the total value of the pot, called moneyAwarded, based on who had money in the pot
            var moneyAwarded=0;
            moneyAwarded = Number(moneyAwarded);
            for(var p=0; p<this.theGame.getAllPlayers().length;p++){
                //if they had less than the value of the pot, add whatever money was in pot, and set their money in pot to zero
                if(pots[i]>this.theGame.getAllPlayers()[p].getCurrMoneyInPot()){
                    moneyAwarded+=this.theGame.getAllPlayers()[p].getCurrMoneyInPot();
                    this.theGame.getAllPlayers()[p].setCurrMoneyInPot(0);

                    //Find index of player who now has 0 in the stack and remove them from the hand array 
                    var index = this.playersInHand.indexOf(this.theGame.getAllPlayers()[p]);
                    if (index !== -1) {
                        console.log("Found and removed player w 0 stack");
                        this.playersInHand.splice(index, 1);
                    }
                    
                } 
                //if they had at least the value of the pot, add the pot value to the total money awarded, and subtract pot value from their total money in pot
                else{
                    moneyAwarded+=pots[i];
                    this.theGame.getAllPlayers()[p].setCurrMoneyInPot(this.theGame.getAllPlayers()[p].getCurrMoneyInPot()-pots[i]);
                }
            }
            //split up money amongst winners, if 1 winner, the entire prize is given to the one winner. Prize is rounded to 2 decimal places
             moneyAwarded = (moneyAwarded/currWinners.length).toFixed(2);
             console.log("Money awarded: " + moneyAwarded);
            for(var k = 0; k < currWinners.length; k++){
                if(pots.length > 1)
                {
                    //Main pot winner announced differently
                    if(i==0)
                    {
                        currWinners[k].addToStack(moneyAwarded);
                        this.io.to(this.theGame.getGameID()).emit('message', "" + currWinners[k].getName() + " has won the main pot of $" + moneyAwarded + " with: " + handEval.evaluateHandForString(currWinners[k].getHand()));
                        console.log(currWinners[k].getName() + " has won the main pot of $" + moneyAwarded + " with: " + handEval.evaluateHandForString(currWinners[k].getHand()));
                    }
                    else
                    {
                        //If only one player wins the pot, don't announce it just give them their money quietly.
                        if(this.playersInHand.length == 1)
                        {
                            currWinners[k].addToStack(moneyAwarded);
                        }
                        //Normal split pot announcement
                        else{
                            currWinners[k].addToStack(moneyAwarded);
                            this.io.to(this.theGame.getGameID()).emit('message', "" + currWinners[k].getName() + " has won split pot: " + i + " of $" + moneyAwarded + " with: " + handEval.evaluateHandForString(currWinners[k].getHand()));
                            console.log("" + currWinners[k].getName() + " has won split pot: " + i + " of $" + moneyAwarded + " with: " + handEval.evaluateHandForString(currWinners[k].getHand()));
                        }
                        /**
                        var numPlayersPot = 0;
                        for(var l = 0; l < this.playersInHand.length; l++)
                        {
                            if(this.playersInHand[i].getCurrMoneyInPot() >= pots[i])
                            {
                                numPlayersPot++;
                            }
                        }
                        if(numPlayersPot > 1)
                        {
                            currWinners[k].addToStack(moneyAwarded);
                            this.io.to(this.theGame.getGameID()).emit('message', "" + currWinners[k].getName() + " has won split pot: " + i + " of $" + moneyAwarded + " with: " + handEval.evaluateHandForString(currWinners[k].getHand()));
                            console.log(currWinners[k].getName() + " has won $" + moneyAwarded + " with: " + handEval.evaluateHandForString(currWinners[k].getHand()));
                        }
                         */
                    }
                }
                else{
                //Else only one pot and will announce the winner of that pot normally
                currWinners[k].addToStack(moneyAwarded);
                this.io.to(this.theGame.getGameID()).emit('message', "" + currWinners[k].getName() + " has won $" + moneyAwarded + " with: " + handEval.evaluateHandForString(currWinners[k].getHand()));
                console.log(currWinners[k].getName() + " has won $" + moneyAwarded + " with: " + handEval.evaluateHandForString(currWinners[k].getHand()));
                }
            }
            
            for(var u = i+1; u<pots.length;u++){
                pots[u]=pots[u]-pots[i];
            }
        }
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
        if(!this.lessThanTwoCanPlay())
        {
            this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getCurrPlayer().getName() + " has checked. " );
        }
    }
    else if(valTurn == "call")
    {
        //They have less than pot
        if(this.getCurrPlayer().getStackSize() < this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound())
        {
            console.log("Player calling all in for more than they have");
            this.moneyInPot += Number(this.getCurrPlayer().getStackSize());
            
            this.getCurrPlayer().addCurrMoneyInBettingRound( Number(this.getCurrPlayer().getStackSize()));
            this.getCurrPlayer().addCurrMoneyInPot( Number(this.getCurrPlayer().getStackSize()));
            this.getCurrPlayer().minusFromStack(this.getCurrPlayer().getStackSize());
        }
        
        else{
        this.getCurrPlayer().minusFromStack(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.moneyInPot += Number(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.getCurrPlayer().addCurrMoneyInPot(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.getCurrPlayer().addCurrMoneyInBettingRound(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());

        //For split pots
       
        }

        this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getCurrPlayer().getName() + " has called. " );
        if(this.getCurrPlayer().getStackSize() == 0)
        {
            this.getCurrPlayer().setAllIn();
            this.getCurrPlayer().setValTurn("playerIsAllIn");
            console.log(this.getCurrPlayer().getName() + " is now ALL IN");
        }
    }

    else if(valTurn == "fold" || valTurn =="autoFold")
    {
        this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getCurrPlayer().getName() + " has folded. " );

        //If player in dealer position folds, moves the dealer index one up because otherwise the splice will move them down one.
        
        if(this.getCurrPlayer() == this.dealer)
        {
            
            var newDealer = this.dealer;
            for(var i = 0; i < this.playersInHand.length - 1; i++)
            {
                newDealer = this.getNextPlayer(newDealer);
            }
            this.dealer = newDealer;
            console.log("New dealer is: " + this.dealer.getName());
        }

    }
    else if(valTurn == "playerIsAllIn")
    {
        //Do nothing, move to the next player
    }
    
    //Raise/ bet section
    else
    {
        //valTurn = Number(valTurn + this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.io.to(this.theGame.getGameID()).emit('consoleLog', this.getCurrPlayer().getName() + " has raised to: " + valTurn);
        this.getCurrPlayer().minusFromStack(valTurn - this.getCurrPlayer().getCurrMoneyInBettingRound());
        console.log("The player has put "+(valTurn-this.getCurrPlayer().getCurrMoneyInPot())+" into the pot");
        this.currBet = Number(valTurn);
        
        this.moneyInPot += Number(valTurn - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.getCurrPlayer().addCurrMoneyInPot(this.getCurrBet() - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.getCurrPlayer().addCurrMoneyInBettingRound(valTurn - this.getCurrPlayer().getCurrMoneyInBettingRound());
        this.initialRaiser = this.getCurrPlayer();

        //For split pots
       

        if(this.getCurrPlayer().getStackSize() == 0)
        {
            this.getCurrPlayer().setAllIn();
            this.getCurrPlayer().setValTurn("playerIsAllIn");
            console.log(this.getCurrPlayer().getName() + " is now ALL IN");
        }

        //sets other players decisions to undefined as they can now act again

        var currP = this.getCurrPlayer();
        
        currP = this.getNextPlayer(currP);

        for(var i = 0; i < this.playersInHand.length; i++)
        {
            if(currP != this.getCurrPlayer())
            {
                currP.setValTurn("undefined");
                currP = this.getNextPlayer(currP);
                console.log("Made " + currP.getName() + "'s turn undefined");
            }
        }
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
    this.currPlayer.setTurn(false);
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
        else if(valTurn == "playerIsAllIn")
        {
            return true;
            //Do nothing, move to the next player
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
            if((valTurn - this.getCurrPlayer().getCurrMoneyInBettingRound()) > this.getCurrPlayer().getStackSize())
            {
                this.io.to(this.currPlayer.getSock()).emit('consoleLog', "Invalid bet. You cannot bet an amount greater than your stack size");
                return false;
            }
            return true;
        }
        
    
   }

   callTurnOnNextPlayer()
   {
        
       console.log("Curr Player is: " + this.getCurrPlayer().getName() + " and valTurn == " + this.getCurrPlayer().getValTurn());
       if(this.getCurrPlayer().isAllIn())
       {
        this.io.to(this.getCurrPlayer().getSock()).emit('allIn');
        console.log("THIS GUY IS ALL IN");
       }
       //If 1 or 0 players can still act in the hand, noone needs to take their turn, so it just auto checks them
       else if((!(this.getCurrPlayer().getValTurn() == "undefined")) && this.lessThanTwoCanPlay())
       {
            this.getCurrPlayer().setValTurn("check");
            console.log("Should skip turn and autoCheck this bib");
            this.playerTurn("check");
       }
       else{
           console.log("THIRD OPTION REACHED");
            
           this.getCurrPlayer().setTurn(true);
           this.emitEverything();
           
           this.io.to(this.getCurrPlayer().getSock()).emit('yourTurn', this.theGame.getTurnTime());
       }
   }

   eligibleForBlinds(person)
   {
       if(this.playersInHand.indexOf(person) != -1)
       {
           if(person.getStackSize() >= 10)
           {
                return true;
           }
       }
       return false;
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

    //Gets winner from an array of players ( allows you to put different arrays of players in the case of split pots)
    /** 
    getWinner(players)
    {
        var handEval = new handEvaluator(this.communityCards);
        var currWinner = players[0];
        

        //Broadcast to the room what everyone has
        for(var i = 0; i < players.length; i++)
        {
            console.log(players[i].getName() + " has " + (handEval.evaluateHandForString(players[i].getHand())));
            this.io.to(this.theGame.getGameID()).emit('consoleLog', players[i].getName() + " has " + handEval.evaluateHandForString(players[i].getHand()) );
        }

        for(var i = 0; i < players.length; i++)
        {
            if(handEval.returnBestHand(currWinner.getHand(), players[i].getHand()) == players[i].getHand())
            {
                currWinner = players[i];
            }
        }

        this.io.to(this.theGame.getGameID()).emit('consoleLog', currWinner.getName() + " wins the hand with " + handEval.evaluateHandForString(currWinner.getHand()) );
        console.log(currWinner.getName() + " wins the hand with: " + handEval.evaluateHandForString(currWinner.getHand()));

		return currWinner;
    }
    */


   

    //Main function
    


    //Taking turns


    //Helper functions

    emitEverything(){
        //[[playernames], [stacksizes], [isTurn], [currMoneyInBettingRound], [allHands] (for showHand Functionality)]
        this.io.to(this.theGame.getGameID()).emit('hands', this.theGame.returnDisplayHands());
        this.io.to(this.theGame.getGameID()).emit('roomUsers', {room: this.theGame.getGameID(), users: this.theGame.getAllNames(), stacksizes: this.theGame.getAllStackSizes()});
        this.io.to(this.theGame.getGameID()).emit('dealBoard', this.getCardPNGs());
        this.io.to(this.theGame.getGameID()).emit('potSize', this.getPot());
        this.io.to(this.theGame.getGameID()).emit('roomPlayers', this.theGame.emitPlayers());
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

    lessThanTwoCanPlay()
    {
        var numPlayersNotAllIn = 0;
        for(var i =0; i < this.playersInHand.length; i++)
        {
            if(!this.playersInHand[i].isAllIn())
            {
                numPlayersNotAllIn++;
            }
        }
        if(numPlayersNotAllIn < 2)
        {
            return true;
        }
        return false;
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
            this.currPlayer.setTurn(false);
            this.emitEverything();
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
            if(this.playersInHand[i].isAllIn())
            {
                this.playersInHand[i].setValTurn("playerIsAllIn");
            }
            else{
                if(this.lessThanTwoCanPlay())
                {
                    this.playersInHand[i].setValTurn("check");
                }
                else{
                    this.playersInHand[i].setValTurn("undefined");
                    this.playersInHand[i].setCurrMoneyInBettingRound(0);
                }
           
            }

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