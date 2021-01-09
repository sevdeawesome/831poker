const { pokerGame, getAllPlayers} = require("./pokerGame");

class pokerRound{
    constructor(theGame, currPlayer){
        this.theGame = theGame;

        //intitial dealer button
        this.currPlayer = currPlayer;
        this.dealer = currPlayer;
        this.indexOfCurrPlayer = 0;
        this.indexOfLastToAct = 0;

        //array of players who haven't folded, beginning at the dealer
        this.playersLeft = [];


        //no timer at the start
        this.currTimer = null;
    }


    

    //clears the current timeout on autofolding a player (done if they play)
    clearTimeOut(){
        clearTimeout(this.currTimer);
    }




    getNextThing(){
        //register turn as done
        console.log("Get next thing logged, current player is: " + this.currPlayer.getName());
        this.registerTurn(this.currPlayer);
        this.currPlayer.setTurn(false);
        this.clearTimeOut();


        //if only one player left who hasnt folded, give them money


        //if there are players left, get the next players turn
        if(this.checkIfPlayersLeft()){
            console.log("Case 1");
            
            this.startTimeOut(this.getNextPlayer(this.currPlayer));
            
        }

        //else if there are hands to be dealt, deal hands and get the currplayers turn
        else if(this.theGame.getNeedsDeal()){
            console.log("Case 2, deal");
            this.theGame.deal();
            this.startTimeOut(this.getNextPlayer(this.currPlayer));
        }

        else{
            //do stuff to winner
            console.log("case 3, winner");
            console.log(this.theGame.getWinner());
         
        }

        //else give winner money --> create new round
    }

    //starts a timeout to autofold a player and then go to the next thing
    //also sets it to their turn so they can go while the timeout is running
    startTimeOut(player){
        console.log("A timeout has been created for: " + player.getName());

        player.setTurn(true);

        var self = this;
        
        this.currTimer = setTimeout(function(){ 
            
            player.setValTurn("fold");
            player.setTurn(false);
            console.log("going to next turn");
            self.getNextThing();

         }, this.theGame.getTurnTime());
    }
    //do whatever their turn suggests you do, fold --> fold, check --> check, so on...
    registerTurn(player){
        console.log("Turn registered by " + player.getName());
    }

    getIndexOfCurrPlayer(){
        return this.indexOfCurrPlayer;
    }

    //if there are players who are yet to fold
    checkIfPlayersLeft(){
       if(this.indexOfCurrPlayer == this.indexOfLastToAct){
           return false;
       }
        return true;
    }

    getNextPlayer(player){
        var playersLeft = this.theGame.getAllPlayers();
        var index = this.getIndexOfPlayer(player);
        console.log(this.indexOfCurrPlayer);
        //last player in the array
        if(index == playersLeft.length - 1){
            if(playersLeft[0].getValTurn() == "fold" || playersLeft[0].getValTurn() == "autofolded" || playersLeft[0].getValTurn() == "folded" ){
                this.indexOfCurrPlayer = 0;
                return this.getNextPlayer(playersLeft[0]);
            }
            else{
                this.indexOfCurrPlayer = 0;
                this.currPlayer = playersLeft[0];
                return playersLeft[0];
            }
        }
        //the next player is folded
        else if(playersLeft[index + 1].getValTurn == "fold" || playersLeft[index + 1].getValTurn == "folded" || playersLeft[index + 1].getValTurn == "autofold"  ){
            return this.getNextPlayer(playersLeft[index]);
        }
        //next player isnt folded and isnt the last in the array
        else{
            this.indexOfCurrPlayer+=1;
            this.currPlayer = playersLeft[this.indexOfCurrPlayer];
            return playersLeft[this.indexOfCurrPlayer];
        }
    }


    


    
   





    getIndexOfPlayer(player){
        var playersLeft = this.theGame.getAllPlayers();
        for(var i = 0; i < playersLeft.length; i++){
            if(player.getName() == playersLeft[i].getName())
            {
                return i;
            }
        }
    }


    

    //clear the game for another hand
    clearGame(){
        //sets everyones move to undefined
        this.theGame.clearMoves();
        this.needsDeal = true;
    }

    
}


module.exports = pokerRound;


// //deprocated methods
//  //gets array of players left starting at the dealer 
//  getPlayersLeft(){

//     //all players that haven't folded
//    var allPlayers = this.theGame.getCurrPlayersInHand();
//    var index = 0;
//    var orderedPlayers = [];

//    for(var i = 0; i < allPlayers.length; i++){
//         if(this.currPlayer.getName() == allPlayers[i].getName()){
//             index = i;
//         }
//    }

//    for(var i = index; i < allPlayers.length; i++){
//        orderedPlayers.push(allPlayers[i]);
//    }
//    for(var i = 0; i < index; i++){
//        orderedPlayers.push(allPlayers[i]);
//    }

//    return orderedPlayers;

// }


