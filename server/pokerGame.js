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
        var currWinner = this.players[0];
		var stillNull;
		for(var i = 0; i < this.players.length; i++)
		{
			if(stillNull)
			{
				if(this.players[i] != null)
				{
					stillNull = false;
					currWinner = this.players[i];
				}
			}
			else if(this.players[i] != null)
			{
				if(handEval.returnBestHand(currWinner.getHand(), this.players[i].getHand()) == this.players[i].getHand())
				{
					currWinner = this.players[i];
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
        for(var i = 0; i < 3; i++)
        {
            this.communityCards[i] = this.deck.deal();
        }
    }
    dealTurn(){
        this.communityCards[3] = this.deck.deal();
    }
    dealRiver(){
        this.communityCards[4] = this.deck.deal();
    }

    dealFullBoard(){
        this.dealFlop(); this.dealTurn(); this.dealRiver();

        var cardPNGS = [];
        for(var i = 0; i < this.communityCards.length; i++)
        {
            var info = this.communityCards[i].cardToPNG();
            cardPNGS.push(info);
        }

        return cardPNGS;
    }


}




module.exports = {pokerGame};