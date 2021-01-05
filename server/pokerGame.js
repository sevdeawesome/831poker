const DeckOfCards = require('./DeckOfCards');
const player = require('./player');
const handEvaluator = require('./handEvaluator');

//const DeckOfCards = require('./DeckOfCards');

class pokerGame{
    constructor(gameID){
        this.totalPlayers = 0;   //number of players
        this.players = [];   //array of all the players
        this.gameID = gameID;  //room
        this.begun = false;  //has the game already started
        this.deck = new DeckOfCards();
        this.communityCards = [];
        this.currBet = 0;
        this.totalPot = Number(0);
        this.needsDeal = true;
    }
    getTotalPot()
    {
        console.log(this.totalPot);
        return this.totalPot;
    }
    addToPot(num)
    {
        Number(this.totalPot +=num);
    }
    setCurrBet(a){
        this.currBet = a;
    }
    getCurrBet(){
        return this.currBet;
    }
    getDeck(){
        return this.deck;
    }
    shuffle(){
        this.deck.shuffle();
    }
    getBegun(){
        return this.begun;
    }
    setBegun(hasit){
        this.begun = hasit;
    }

    //add player object to array players
    playerJoin(player){
        this.players.push(player);
        this.totalPlayers++;
    }
    
    //remove playr from array given a socket id
    playerLeave(id){
        for(var i = 0; i < this.totalPlayers; i++)
        {
            if(this.players[i].getSock() == id){
                let temp = this.players[i];
                
                this.players.splice(i, 1);
                this.totalPlayers--;
                return temp;
            }
        }
    }

    //pass through socket id and return the player object
    getCurrentUser(id){
        for(var i = 0; i < this.totalPlayers; i++)
        {
            if(this.players[i].getSock() == id){
                return this.players[i];
            }
        }
    }

    getAllPlayers(){
        return this.players;
    }
    getPlayersLength(){
        return this.players.length;
    }
    getAllNames(){
        var names = [];
        for(var i = 0; i < this.totalPlayers; i++)
        {
            names.push(this.players[i].getName());
        }
        return names;
    }
    getAllStackSizes(){
        var stacks = [];
        for(var i = 0; i < this.totalPlayers; i++)
        {
            stacks.push(this.players[i].getStackSize());
        }
        return stacks;
    }
    getGameID()
    {
        return this.gameID;
    }

    getWinner()
    {
        let handEval = new handEvaluator(this.communityCards);
        var stillIn = this.getCurrPlayersInHand();
        var currWinner = stillIn[0];
		var stillNull;
		for(var i = 0; i < stillIn.length; i++)
		{
			if(stillNull)
			{
				if(stillIn[i] != null)
				{
					stillNull = false;
					currWinner = stillIn[i];
				}
			}
			else if(stillIn[i] != null)
			{
				if(handEval.returnBestHand(currWinner.getHand(), stillIn[i].getHand()) == stillIn[i].getHand())
				{
					currWinner = stillIn[i];
				}
			}
		}
		return currWinner;
    }
    
    checkIfSockIDisInGame(sockID)
    {
        for(var i = 0; i < this.totalPlayers; i++)
        {
            if(this.players[i].getSock() == sockID)
            {
                return true;
            }
        }
        return false;
    }

    getPlayerFromSockID(sockID){
        for(var i = 0; i < this.totalPlayers; i++)
        {
            if(this.players[i].getSock() == sockID)
            {
                return this.players[i];
            }
        }
        return null;
    }

    getPlayerAt(i){
        return this.players[i];
    }
    
    
    //give each player a playerHand object
    dealHands(){
        for(var i = 0; i < this.totalPlayers; i++)
        {
            this.players[i].setHand(this.deck.deal(), this.deck.deal());
        }
    }

    returnDisplayHands(){
        var arr = [];
       
        for(var i = 0; i < this.totalPlayers; i++)
        {
            var info = {name: this.players[i].getName(), hand: this.players[i].getHand().getPNGHand()}
            arr.push(info);
        }
        return arr;
        
    }

    dealFlop(){
        for(var j = 0; j < 3; j++){
            this.communityCards[j] = this.deck.deal();
            console.log("flop card dealt");
        }
        
        var cardPNGS = [];
        for(var i = 0; i < this.communityCards.length; i++)
        {
            var info = this.communityCards[i].cardToPNG();
            cardPNGS.push(info);
        }
        return cardPNGS;
    }
    dealTurn(){
        
        this.communityCards[3] = this.deck.deal();
        console.log("turn card dealt")
        
        var cardPNGS = [];
        for(var i = 0; i < this.communityCards.length; i++)
        {
            var info = this.communityCards[i].cardToPNG();
            cardPNGS.push(info);
        }
        return cardPNGS;

    }
    dealRiver(){
       
        this.communityCards[4] = this.deck.deal();
        console.log("river card dealth");
        this.needsDeal = false;
        var cardPNGS = [];
        for(var i = 0; i < this.communityCards.length; i++)
        {
            var info = this.communityCards[i].cardToPNG();
            cardPNGS.push(info);
        }
        return cardPNGS;
    }
    getNeedsDeal(){
        return this.needsDeal;
    }

    //deal the flop/turn/river depending on whats already been dealt
    deal(){
        if(this.communityCards.length == 0){
            return this.dealFlop();
        }
        else if(this.communityCards.length == 3)
        {
            return this.dealTurn();
        }
        else if(this.communityCards.length == 4){
            return this.dealRiver();
        }
        
        else{
            var cardPNGS = [];
            for(var i = 0; i < this.communityCards.length; i++)
                {
                    var info = this.communityCards[i].cardToPNG();
                    cardPNGS.push(info);
                }
            return cardPNGS;
        }

    }

    //show the winner and give them their rightfully owned money
    dealWin(){
        var winner = this.getWinner();
        winner.addToStack(this.totalPot);

        for(var i = 0; i < this.totalPlayers; i++){
            this.players[i].setCurrMoneyInPot(0);
        }

    }

    //sets all players moves to u (undefined, havent gone yet)
    clearMoves(){
        for(var i = 0; i <  this.totalPlayers; i++){
            this.players[i].setValTurn("u");
        }
    }

    //returns everyone in the hand (that isnt folded)
    getCurrPlayersInHand(){
        var playersInHand = [];
        for(var i = 0; i <  this.totalPlayers; i++){
             if(this.players[i].getValTurn() != "pf" && this.players[i].getValTurn() != "f"){
                playersInHand.push(this.players[i]);
             }
        }
        return playersInHand;
    }

    //clear the game for another hand
    clearGame(){
        this.clearMoves();
        this.totalPot = 0;
        this.needsDeal = true;
    }



    //Player turn options
    
    //Player turn options
    
    //Player turn options
    
    //Player turn options

    playerRaise(player, raiseamt){
         //IMPLEMENT: takes money, puts in pot, updates all stacksizes, updates pot


        //  if(player.getValTurn() > (player.getStackSize() - player.getCurrMoneyInPot())){
        //     io.to(theGame.getGameID()).emit('message', player.getName() + ", you do not have enough money to raise that");
        //     player.setValTurn("u");

        //   }
        //   else{
        //     var raiseAmt = Number(player.getValTurn());
        //     theGame.setCurrBet(player.getValTurn());
        //     theGame.addToPot(raiseAmt);
        //     player.setCurrMoneyInPot(player.getValTurn());
        //     io.to(theGame.getGameID()).emit('message', player.getName() + ", raised " + player.getValTurn());
        //     io.to(theGame.getGameID()).emit('potSize', theGame.getTotalPot());
        //   }
    }
    playerFold(player){
        io.to(theGame.getGameID()).emit('message', player.getName() + " has folded ");
    }
    playerCheck(player){
        // if(theGame.getCurrBet() > 0){
        //     player.setValTurn("u");
        //     io.to(theGame.getGameID()).emit('message', player.getName() + ", you cannot check when there is a raise ");

        //   }

        //   else{
        //    io.to(theGame.getGameID()).emit('message', player.getName() + " has checked ");
        //   }
    }
    playerCall(player){
        // if(theGame.getCurrBet() > 0 && ( (player.getStackSize() - player.getCurrMoneyInPot()) > theGame.getCurrBet())){
        //     io.to(theGame.getGameID()).emit('message', player.getName() + " has called ");
        //     theGame.addToPot(Number(theGame.getCurrBet() - player.getCurrMoneyInPot()));
        //     player.subtractFromStack(theGame.getCurrBet() - player.getCurrMoneyInPot());
        //     player.setCurrMoneyInPot(theGame.getCurrBet());
        //     io.to(player.getRoom()).emit('roomUsers', {room: player.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes()});
        //     io.to(theGame.getGameID()).emit('message', "Pot size is: " + theGame.getCurrMoneyInPot());
        //     io.to(theGame.getGameID()).emit('potSize', theGame.getTotalPot());

        //     //IMPLEMENT put money in pot
        //   }
        //   else{
        //     player.setValTurn("u");
        //     io.to(theGame.getGameID()).emit('message', player.getName() + ", you have insufficient funds");

        //     //IMPLEMENT split pot
        //   }
    }
    playerAutoFold(player){
        // if(theGame.getCurrBet() == 0){
        //     io.to(theGame.getGameID()).emit('message', player.getName() + " auto check ");
        //     player.setValTurn("a");
        //   }
        //   else{
        //     io.to(theGame.getGameID()).emit('message', player.getName() + " has folded by autofolder bot ");
        //     player.setValTurn("f");
        //   }
    }

}




module.exports = {pokerGame};