const DeckOfCards = require('./DeckOfCards');
const player = require('./player');
const pokerHand = require('./pokerHand');

//const DeckOfCards = require('./DeckOfCards');

class pokerGame{
    constructor(gameID){
        this.totalPlayers = 0;   //number of players
        this.players = [];   //array of all the players
        this.gameID = gameID;  //room
        this.begun = false;  //has the game already started
        this.deck = new DeckOfCards();
        this.turnTime = 10000;
        this.dealerIdx = 0;
        this.smallBlind = 10;
        this.bigBlind = 20;
        this.hand = null;
        this.handNumber = 0;
    }
    newHand()
    {
        this.hand = new pokerHand(this);
    }
    returnHand()
    {
        return this.hand;
    }
    getSB()
    {
        return this.smallBlind;
    }
    getBB()
    {
        return this.bigBlind;
    }
    getDealerIdx(){
        return this.dealerIdx;
    }
    
    getTurnTime(){
        return this.turnTime;
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
    getTotalPlayers(){
        return this.totalPlayers;
    }
    getEligiblePlayers()
    {
        var ePlayers = [];
        for(var i = 0; i < this.players.length; i++)
        {
            if(this.players[i].getStackSize() > 0)
            {
                ePlayers.push(this.players[i]);
            }
        }
        return ePlayers;
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
    
    
    //give each player in the hand a playerHand object
    dealHands(){
        for(var i = 0; i < this.getAllPlayers().length; i++)
        {
            if(this.getAllPlayers()[i].getStackSize() != 0 )
            {
                this.getAllPlayers()[i].setHand(this.getDeck().deal(), this.getDeck().deal());
            }   
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

    increaseDealerPosition()
    {
        this.dealerIdx += 1;
    }


    //deal the flop/turn/river depending on whats already been dealt

    //sets all players moves to u (undefined, havent gone yet)
    
    clearPlayersInfo(){
        for(var i = 0; i < this.players.length; i++){
            this.players[i].resetInfo();
        }
    }
    
    

    //clear the game for another hand, and starts the next hand in 5 seconds
    clearGame(){
        this.clearPlayersInfo();
        this.increaseDealerPosition();
        this.deck = new DeckOfCards();
        this.deck.shuffle();
        this.deck.shuffle();
        this.deck.shuffle();
        this.deck.shuffle();

        
        this.hand = null;
        
        
        this.handNumber += 1;
        var self = this;

        setTimeout(function() {

            self.newHand();
        }, 5000);

    }

}




module.exports = {pokerGame};