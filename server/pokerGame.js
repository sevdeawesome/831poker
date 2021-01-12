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


    //deal the flop/turn/river depending on whats already been dealt

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
            this.players[i].setValTurn("undefined");
        }
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

    // playerRaise(player, raiseamt){
    //      //IMPLEMENT: takes money, puts in pot, updates all stacksizes, updates pot


    //     //  if(player.getValTurn() > (player.getStackSize() - player.getCurrMoneyInPot())){
    //     //     io.to(theGame.getGameID()).emit('message', player.getName() + ", you do not have enough money to raise that");
    //     //     player.setValTurn("u");

    //     //   }
    //     //   else{
    //     //     var raiseAmt = Number(player.getValTurn());
    //     //     theGame.setCurrBet(player.getValTurn());
    //     //     theGame.addToPot(raiseAmt);
    //     //     player.setCurrMoneyInPot(player.getValTurn());
    //     //     io.to(theGame.getGameID()).emit('message', player.getName() + ", raised " + player.getValTurn());
    //     //     io.to(theGame.getGameID()).emit('potSize', theGame.getTotalPot());
    //     //   }
    // }
    // playerFold(player){
    //     io.to(theGame.getGameID()).emit('message', player.getName() + " has folded ");
    // }
    // playerCheck(player){
    //     // if(theGame.getCurrBet() > 0){
    //     //     player.setValTurn("u");
    //     //     io.to(theGame.getGameID()).emit('message', player.getName() + ", you cannot check when there is a raise ");

    //     //   }

    //     //   else{
    //     //    io.to(theGame.getGameID()).emit('message', player.getName() + " has checked ");
    //     //   }
    // }
    // playerCall(player){
    //     // if(theGame.getCurrBet() > 0 && ( (player.getStackSize() - player.getCurrMoneyInPot()) > theGame.getCurrBet())){
    //     //     io.to(theGame.getGameID()).emit('message', player.getName() + " has called ");
    //     //     theGame.addToPot(Number(theGame.getCurrBet() - player.getCurrMoneyInPot()));
    //     //     player.subtractFromStack(theGame.getCurrBet() - player.getCurrMoneyInPot());
    //     //     player.setCurrMoneyInPot(theGame.getCurrBet());
    //     //     io.to(player.getRoom()).emit('roomUsers', {room: player.getRoom(), users: theGame.getAllNames(), stacksizes: theGame.getAllStackSizes()});
    //     //     io.to(theGame.getGameID()).emit('message', "Pot size is: " + theGame.getCurrMoneyInPot());
    //     //     io.to(theGame.getGameID()).emit('potSize', theGame.getTotalPot());

    //     //     //IMPLEMENT put money in pot
    //     //   }
    //     //   else{
    //     //     player.setValTurn("u");
    //     //     io.to(theGame.getGameID()).emit('message', player.getName() + ", you have insufficient funds");

    //     //     //IMPLEMENT split pot
    //     //   }
    // }
    // playerAutoFold(player){
    //     // if(theGame.getCurrBet() == 0){
    //     //     io.to(theGame.getGameID()).emit('message', player.getName() + " auto check ");
    //     //     player.setValTurn("a");
    //     //   }
    //     //   else{
    //     //     io.to(theGame.getGameID()).emit('message', player.getName() + " has folded by autofolder bot ");
    //     //     player.setValTurn("f");
    //     //   }
    // }

}




module.exports = {pokerGame};