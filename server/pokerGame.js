const DeckOfCards = require('./DeckOfCards');
const player = require('./player');
const pokerHand = require('./pokerHand');

//const DeckOfCards = require('./DeckOfCards');

class pokerGame{
    constructor(gameID){
        this.gameHost;
        this.password;
        this.defaultStackSize;
        this.totalPlayers = 0;   //number of players
        this.players = [];   //array of all the players
        this.gameID = gameID;  //room
        this.begun = false;  //has the game already started
        this.deck = new DeckOfCards();
        this.turnTime = 10000;
        this.dealerIdx = 0;
        this.smallBlind;
        this.bigBlind;
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
    getPassword()
    {
        return this.password;
    }
    getHost()
    {
        return this.gameHost;
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
        if(this.gameHost == null)
        {
            this.gameHost = player;
        }
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
                if(this.players.length > 0)
                {
                    this.gameHost = this.players[0];
                }
                else{
                    this.gameHost = null;
                }
               
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

    checkIfNameIsInGame(name)
    {
        for(var i = 0; i < this.getAllPlayers().length; i++)
        {
            if(this.getAllPlayers()[i].getName() == name)
            {
                return true;
            }
        }
        return false;
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
            //If they have a hand, display it to client side
            if(this.players[i].getHand() != null)
            {
                var info = {name: this.players[i].getName(), hand: this.players[i].getHand().getPNGHand()}
                arr.push(info);
            }
            //else display no hand for them
            else{
                var info = {name: this.players[i].getName(), hand: null}
                arr.push(info);
            }
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
    pauseUnPause() {
        //set up pause and unpause functionality here.
        console.log("The game has been paused");
        if(this.hand.getPaused==false){
            this.hand.unPause();
        } else {
            this.hand.pause();
        }
    }
    
    emitPlayers(){
        /*
        [dealerPosition, {name, stacksize, currMoneyInBettingRound, isFolded, card1, card2, isShown1, isShown2, isStraddled, isTurn}]
        */

        var returnArr = [];
        var dealerIndex = this.dealerIdx%this.getTotalPlayers();
        returnArr.push(dealerIndex);
        var currPerson;
        for(var i = 0; i < this.getTotalPlayers(); i++){
            currPerson = this.getPlayerAt(i);
            var holeCard1;
            var holeCard2;
            if(currPerson.getHand() == null){
                holeCard1 = "blue_back.png";
                holeCard2 = "blue_back.png"
            }
            else{
                holeCard1 = currPerson.getHand().getHoleCard1().cardToPNG();
                holeCard2 = currPerson.getHand().getHoleCard2().cardToPNG();
            }
            
            returnArr.push({name: currPerson.getName(), stack:  currPerson.getStackSize(), moneyIn: currPerson.getCurrMoneyInBettingRound(), 
            card1: holeCard1, card2: holeCard2, 
            valTurn: currPerson.getValTurn(), isShown1: false, isShown2: false, isStraddled: false, isTurn: currPerson.getTurn()
            });
        }
        return  returnArr;
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