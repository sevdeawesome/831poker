const Card = require('./card');
const DeckOfCards = require('./DeckOfCards');
const playerHand = require('./playerHand');

//Used for the numeric value of hands
const tenNegTwo = .01;
const tenNegFour = .0001;
const tenNegSix = .000001;
const tenNegEight = .00000001;
const tenNegTen = .0000000001;


class handEvaluator{


constructor(communityCards){
    this.cardsOnBoard = communityCards;
}





//Helper function to the main function of the class. Returns a number with the ones place being the type of hand
// (straight flush == 8, Quads == 7, Full House == 6, etc) and the tenths - ten thousandths place being the necessary part comparable if both players have the same type of 
//hand (Player A and Player B both have Quad A's but Player A has King high and Player B has 10 high) (for Example: 07.1413 vs 07.1410).

evaluateHandNumberValue(hand1)
{
    	//8
		if(this.returnStraightFlushNumber(hand1) != null)
		{
			return this.returnStraightFlushNumber(hand1);
		}
		//7
		if(this.returnQuadsNumber(hand1) != null)
		{
			return this.returnQuadsNumber(hand1);
		}
		//6
		if(this.returnFullHouseNumber(hand1) != null)
		{
			return this.returnFullHouseNumber(hand1);
		}
		//5
		if(this.returnFlushNumber(hand1) != null)
		{
			return this.returnFlushNumber(hand1);
		}
		//4
		if(this.returnStraightNumber(hand1) != null)
		{
			return this.returnStraightNumber(hand1);
		}
		//3
		if(this.returnTripsNumber(hand1) != null)
		{
			return this.returnTripsNumber(hand1);
		}
		//2
		if(this.returnTwoPairNumber(hand1) != null)
		{
			return this.returnTwoPairNumber(hand1);
		}
		//1
		if(this.returnPairNumber(hand1) != null)
		{
			return this.returnPairNumber(hand1);
		}
		//0
		if(this.returnHighCardNumber(hand1) != null)
		{
			return this.returnHighCardNumber(hand1);
		}
		return null;
}

//Main function of the class: Returns the better hand when two poker hands are entered into parameters of the method.
//Returns the better hand between the two

returnBestHand(hand1, hand2)
{
    var hand1number = this.evaluateHandNumberValue(hand1);
    var hand2number = this.evaluateHandNumberValue(hand2);

    //console.log(hand1number);
    //console.log(hand2number);
    
    if(hand1number>hand2number)
    {
        return hand1;
    }
    else if(hand2number>hand1number)
    {
        return hand2;
    }
    //Both hands the same
    else{
        return null;
    }
}


//String function of class: returns the best 5 card hand of what you have (ex. One pair: 10's, Ace King Jack) (ex. Two Pair Queens and Fours)
evaluateHandForString(hand1)
{
    //If preflop (no cards on the board)
    if(this.cardsOnBoard.length == 0)
    {
        if(hand1.getHoleCard1().getNumber() > hand1.getHoleCard2().getNumber())
        {
            return "High Card: " + hand1.getHoleCard1().cardToString() + ", " + hand1.getHoleCard2().cardToString();
        }
        else if(hand1.getHoleCard1().getNumber() < hand1.getHoleCard2().getNumber())
        {
            return "High Card: " + hand1.getHoleCard2().cardToString() + ", " + hand1.getHoleCard1().cardToString();
        }
        else
        {
            return "Pair of: " + Card.numberToString(hand1.getHoleCard1().getNumber()) + "'s";
        }
    }
    else{
    var handNum = this.evaluateHandNumberValue(hand1);

    //If Straight Flush
    if(handNum > 8)
    {
        var topOfStraight = Math.floor((handNum.toFixed(2) - Math.floor(handNum)) * 100);
        console.log(topOfStraight);
        return "Straight Flush: " + Card.numberToString(topOfStraight) + " to " + Card.numberToString(topOfStraight - 4);
    }
    //If Quads
    else if(handNum > 7)
    {
        var QuadsNum = Math.floor((handNum.toFixed(2) - Math.floor(handNum)) * 100);
        var highCard = ((handNum.toFixed(4) - handNum.toFixed(2)) * 10000).toFixed();
        console.log(highCard);
        return "Four of a Kind: " + Card.numberToString(QuadsNum) + "'s, " + Card.numberToString(highCard) + " high";
    }
    //If Full House
    else if(handNum > 6)
    {
        var tripsNum = Math.floor((handNum.toFixed(2) - Math.floor(handNum)) * 100);
        var pairNum = ((handNum.toFixed(4) - handNum.toFixed(2)) * 10000).toFixed();
        //console.log(tripsNum + " " + pairNum);
        return "Full House: " + Card.numberToString(tripsNum) +"'s full of " + Card.numberToString(pairNum) + "'s";
    }
    //If Flush
    else if(handNum > 5)
    {
        //console.log(handNum);
        var highestFlushCard = ((handNum.toFixed(2) - Math.floor(handNum)) * 100).toFixed();
        var secondFlushCard = ((handNum.toFixed(4) - handNum.toFixed(2)) * 10000).toFixed();
        var thirdFlushCard = ((handNum.toFixed(6) - handNum.toFixed(4)) *  1000000).toFixed();
        var fourthFlushCard = ((handNum.toFixed(8) - handNum.toFixed(6)) * 100000000).toFixed();
        var fifthFlushCard = ((handNum.toFixed(10) - handNum.toFixed(8)) * 10000000000).toFixed();

        return "Flush: " + Card.numberToString(highestFlushCard) + ", " + Card.numberToString(secondFlushCard) + ", " + Card.numberToString(thirdFlushCard) + ", " + Card.numberToString(fourthFlushCard) + ", " + Card.numberToString(fifthFlushCard);
    }
    //If Straight
    else if(handNum > 4)
    {
        //console.log(handNum);
        var straightCard = ((handNum.toFixed(2) - Math.floor(handNum)) * 100).toFixed();
        return "Straight: " + Card.numberToString(straightCard) + " to " + Card.numberToString(straightCard - 4);
    }
    //If Trips
    else if(handNum > 3)
    {
        //console.log(handNum);
        var tripsNum = ((handNum.toFixed(2) - Math.floor(handNum)) * 100).toFixed();
        var highCard = ((handNum.toFixed(4) - handNum.toFixed(2)) * 10000).toFixed();
        var secondHighCard = ((handNum.toFixed(6) - handNum.toFixed(4)) *  1000000).toFixed();

        return "Three of a Kind: " + Card.numberToString(tripsNum) + "'s, " + Card.numberToString(highCard) + ", " + Card.numberToString(secondHighCard) + " high";
    }
    //If TwoPair
    else if(handNum > 2)
    {
        var highPair = ((handNum.toFixed(2) - Math.floor(handNum)) * 100).toFixed();
        var lowPair = ((handNum.toFixed(4) - handNum.toFixed(2)) * 10000).toFixed();
        var highCard = ((handNum.toFixed(6) - handNum.toFixed(4)) *  1000000).toFixed();

        return "Two Pair: " + Card.numberToString(highPair) + "'s & " + Card.numberToString(lowPair) + "'s, " + Card.numberToString(highCard) + " high";
    }
    //If Pair
    else if(handNum > 1)
    {
        //console.log(handNum);
        var pair = ((handNum.toFixed(2) - Math.floor(handNum)) * 100).toFixed();
        var highCard = ((handNum.toFixed(4) - handNum.toFixed(2)) * 10000).toFixed();
        var secondHighCard = ((handNum.toFixed(6) - handNum.toFixed(4)) *  1000000).toFixed();
        var thirdHighCard = ((handNum.toFixed(8) - handNum.toFixed(6)) * 100000000).toFixed(); 

        return "Pair of: " + Card.numberToString(pair) + "'s, " + Card.numberToString(highCard) + ", " + Card.numberToString(secondHighCard) + ", " + Card.numberToString(thirdHighCard) + " high";
    }
    //If High Card
    else 
    {
        var highCard = ((handNum.toFixed(2) - Math.floor(handNum)) * 100).toFixed();
        var secondHighCard = ((handNum.toFixed(4) - handNum.toFixed(2)) * 10000).toFixed();
        var thirdHighCard = ((handNum.toFixed(6) - handNum.toFixed(4)) *  1000000).toFixed();
        var fourthHighCard = ((handNum.toFixed(8) - handNum.toFixed(6)) * 100000000).toFixed();
        var fifthHighCard = ((handNum.toFixed(10) - handNum.toFixed(8)) * 10000000000).toFixed();

        return "High Card: " + Card.numberToString(highCard) + ", " + Card.numberToString(secondHighCard) + ", " + Card.numberToString(thirdHighCard) + ", " + Card.numberToString(fourthHighCard) + ", " + Card.numberToString(fifthHighCard);
    }
    }
}


//////////
///////////////// Return Functions for the main function of the class
//////////

returnHighCardNumber(hand1)
{
    var cards = this.returnArrayOfSortedBoardAndHandCards(hand1);

    //Creating an array of the 5 highest cards
    var highCard = [cards[cards.length - 1], cards[cards.length - 2], cards[cards.length - 3], cards[cards.length - 4], cards[cards.length - 5]];

    var highCardNumber = 0 + highCard[0].getNumber() *tenNegTwo + highCard[1].getNumber() * tenNegFour + highCard[2].getNumber() * tenNegSix + highCard[3].getNumber() * tenNegEight+ highCard[4].getNumber() * tenNegTen;
    return highCardNumber;
}
returnPairNumber(hand1)
{
    var cards = this.returnArrayOfSortedBoardAndHandCards(hand1);

    var pair = false;
	var pairArr = null;
	var pairCard = 0;
		
		for(var i = cards.length - 2; i >= 0; i--)
		{
			if(cards[i +1].getNumber() == cards[i].getNumber())
			{
				pair = true;
				pairCard = cards[i].getNumber();
				break;
			}
		}
		
		var pairNumber = null;
		if(pair)
		{
			var arrCounter = 2;
			var pairArrCounter = 0;
            pairArr = [];

			for(var i = cards.length - 1; i >= 0; i--)
			{
				if(arrCounter <= 4 && cards[i].getNumber() != pairCard)
				{
					pairArr[arrCounter++] = cards[i];
				}
				if(cards[i].getNumber() == pairCard)
				{
					pairArr[pairArrCounter++] = cards[i];
				}
            }
			
            pairNumber = 1 + pairArr[0].getNumber() * tenNegTwo + pairArr[2].getNumber() * tenNegFour + pairArr[3].getNumber() * tenNegSix + pairArr[4].getNumber() * tenNegEight;
		}
		
		if(pairNumber!= null)
		{
			return pairNumber;
		}
		return null;
}
returnTwoPairNumber(hand1)
{
    var cards = this.returnArrayOfSortedBoardAndHandCards(hand1);

    var twoPairCheck = 0;
    var twoPairNumber1Index1 = 0;
    var twoPairNumber1Index2 = 0;
    var twoPairNumber2Index1 = 0;
    var twoPairNumber2Index2 = 0;
    
    var twoPair = false;
    var TwoPair = [];
    
    for(var i = cards.length - 2; i >= 0; i--)
    {
        if(cards[i+1].getNumber() == cards[i].getNumber())
        {
            twoPairCheck++;
            if(twoPairNumber1Index1 == 0)
            {
                twoPairNumber1Index1 = i;
                twoPairNumber1Index2 = i + 1;
            }
            else if(twoPairNumber2Index1 == 0)
            {
                twoPairNumber2Index1 = i;
                twoPairNumber2Index1 = i + 1;
                twoPair = true;
                break;
            }
        }
    }
    
    var twoPairNumber;
    if(twoPair)
    {
        var highCard = new Card('s', 0);
        for(var i = cards.length - 1; i >= 0; i--)
        {
            if(i != twoPairNumber1Index1 && i != twoPairNumber1Index2 && i != twoPairNumber2Index1 && i != twoPairNumber2Index1)
            {
                if(cards[i].getNumber() > highCard.getNumber())
                {
                    highCard = cards[i];
                }
            }
        }
        TwoPair = [cards[twoPairNumber1Index1], cards[twoPairNumber1Index2], cards[twoPairNumber2Index1], cards[twoPairNumber2Index2], highCard];	
        twoPairNumber = 2 + TwoPair[0].getNumber() * tenNegTwo + TwoPair[2].getNumber() * tenNegFour + TwoPair[4].getNumber() * tenNegSix;
    }
    
    if(twoPairNumber != null)
    {
        return twoPairNumber;
    }
    return null;
}
returnTripsNumber(hand1)
{
    var cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
    var tripCheck = 0;
    var tripCard = 0;
    var hasTrips = false;
    var Trips;
    
    for(var i = cards.length - 2; i >= 0; i--)
    {
        if(cards[i+1].getNumber() == cards[i].getNumber())
        {
            tripCheck++;
            if(tripCheck == 2)
            {
                hasTrips = true;
                tripCard = cards[i].getNumber();
                break;
            }
        }
        else {
            tripCheck = 0;
        }
    }
    
    //Number to be returned
    var tripsNumber;
    if(hasTrips)
    {
        var highCard = new Card('s', 0);
        var secondHighCard = new Card('s', 0);;
        Trips = [];
        var newArrCounter = 0;
        for(var i = 0; i < cards.length; i++)
        {
            if(cards[i].getNumber() > secondHighCard.getNumber() && cards[i].getNumber() != tripCard)
            {
                if(cards[i].getNumber() > highCard.getNumber())
                {
                    secondHighCard = highCard;
                    highCard = cards[i];
                }
                else {
                    secondHighCard = cards[i];
                }
            }
            if(cards[i].getNumber() == tripCard)
            {
                Trips[newArrCounter++] = cards[i];
            }
        }
        Trips[newArrCounter++] = highCard;
        Trips[newArrCounter] = secondHighCard;
        
        tripsNumber = 3 + Trips[0].getNumber() * tenNegTwo + Trips[3].getNumber() * tenNegFour + Trips[4].getNumber() * tenNegSix;
    }
    
    if(tripsNumber != null)
    {
        return tripsNumber;
    }
    return null;
}
returnStraightNumber(hand1)
{
    var cards = this.returnArrayOfSortedBoardAndHandCards(hand1);
		
		
    var straightCounter = 0;
    var isStraight = false;
    var wheel = false;
    var aceExists = false;
    var acePosition = 0;
    var straight = null;
    var topOfStraight = null;
    var topIndex = 0;
    
    for(var i = cards.length - 2; i >= 0; i--)
    {
        //Wheel Checker (A 2 3 4 5)
        if(i == cards.length - 2)
        {
            if(cards[cards.length -1].getNumber() == 14)
            {
                aceExists = true;
                acePosition = cards.length -1;
            }
            
        }
        
        if(straightCounter == 4)
        {
            isStraight = true;
            break;
        }
        if(cards[i].getNumber() - cards[i +1].getNumber() == -1)
        {
            if(straightCounter == 0)
            {
                topOfStraight = cards[i+1];
                topIndex = i + 1;
            }
            straightCounter++;
        }
        else if(cards[i].getNumber() == cards[i+1].getNumber())
        {
            //Skip over if its the same number
        }
        else {
            straightCounter = 0;
        }
        
        if(straightCounter == 3 && cards[i].getNumber() == 2 && aceExists)
        {
            wheel = true;
            isStraight = true;
            break;
        }
    }
    
    if(straightCounter == 4)
    {
        isStraight = true;
    }
    
    //Number to return
    var straightNumber = null;
    if(isStraight)
    {
        straight = [];
        var b = 0;
        
        if(wheel)
        {
            b = 4;
            straight[0] = cards[acePosition];
            for(var i = topIndex; i > 0; i--)
            {
                straight[b--] = cards[i];
                if(b == 0)
                {
                    break;
                }
                //Skip over if its the same number
                if(straight[b +1].getNumber() == cards[i -1].getNumber())
                {
                    i--;
                }
                
            }
            
        }
        else {
        
        for(var i = topIndex; i >= 0; i--)
        {
            straight[b++] = cards[i];
            if(b == 5)
            {
                break;
            }
            //Skip over if its the same number
            if(straight[b -1].getNumber() == cards[i -1].getNumber())
            {
                i--;
            }
            
        }
        }
        
        straightNumber = 4 + topOfStraight.getNumber() * tenNegTwo;
    }
    
    if(straightNumber != null)
    {
        return straightNumber;
    }
    return null;
    
}

returnFlushNumber(hand1)
{
    var suits = ['s', 'c', 'd', 'h'];
    var cards = this.returnArrayOfSortedBoardAndHandCards(hand1);

    var flushCount= 0;
    var currentSuit;
    var isFlush = false;
    var flush = null;
    
    //Number to return
    var flushNumber = null;
    for(var i = 0; i < suits.length; i++)
    {
        currentSuit = suits[i];
        flushCount = 0;
        for(var k = 0; k < cards.length; k++)
        {
            if(cards[k].getSuit() == currentSuit)
            {
                flushCount++;
                
                if(flushCount == 5)
                {
                    isFlush = true;
                    break;
                }
            }
        }
        
        if(isFlush)
        {
            flush = [];
            var flushArrayCounter = 0;
            for(var b = cards.length - 1; b >= 0; b--)
            {
                if(cards[b].getSuit() == currentSuit)
                {
                    flush[flushArrayCounter++] = cards[b];
                }
                if(flushArrayCounter == 5)
                {
                    break;
                }
            }
            flushNumber = 5 + flush[0].getNumber() * tenNegTwo + flush[1].getNumber() * tenNegFour + flush[2].getNumber() * tenNegSix+ flush[3].getNumber() * tenNegEight+ flush[4].getNumber() * tenNegTen;
            break;
        }
    }
    
    if(flushNumber != null)
    {
        return flushNumber;
    }
    return null;
}
returnFullHouseNumber(hand1)
{
    var cards = this.returnArrayOfSortedBoardAndHandCards(hand1);

    var tripCheck = 0;
    var trips = false;
    var tripNumber = 0;
    
    for(var i = cards.length - 2; i >= 0; i--)
    {
        if(cards[i+1].getNumber() == cards[i].getNumber())
        {
            tripCheck++;
            if(tripCheck == 2)
            {
                trips = true;
                tripNumber = cards[i].getNumber();
                break;
            }
        }
        else {
            tripCheck = 0;
        }
    }
    
    var House = null;
    var house = false;
    var pairNumber = 0;
    
    if(trips)
    {
        
        
        for(var i = cards.length - 2; i >= 0; i--)
        {
            if(cards[i].getNumber() != tripNumber && cards[i+1].getNumber() == cards[i].getNumber())
            {
                house = true;
                pairNumber = cards[i].getNumber();
            }
        }
    }
    
    //Number to return
    var fullHouseNumber = null;
    if(house)
    {
        House = [];
        var tripCount = 0;
        var pairCount = 3;
        for(var i = 0; i < cards.length; i++)
        {
            if(cards[i].getNumber() == tripNumber)
            {
                House[tripCount++] = cards[i];
            }
            if(cards[i].getNumber() == pairNumber)
            {
                House[pairCount++] = cards[i];
            }
        }
        fullHouseNumber = 6 + House[0].getNumber() * tenNegTwo + House[3].getNumber() * tenNegFour;
    }
    
    if(fullHouseNumber != null)
    {
        return fullHouseNumber;
    }
    return null;
}
returnQuadsNumber(hand1)
{
    var cards = this.returnArrayOfSortedBoardAndHandCards(hand1);

    var quadCount = 0;
    var hasQuads = false;
    var quadCard = 0;
    var Quads;
    
    for(var i = cards.length - 2; i >= 0; i--)
    {
        if(cards[i+1].getNumber() == cards[i].getNumber())
        {
            quadCount++;
            if(quadCount == 3)
            {
                hasQuads = true;
                quadCard = cards[i].getNumber();
                break;
            }
        }
        else {
            quadCount = 0;
        }
    }
    
    //Number to return
    var quadsNumber;;
    
    if(hasQuads)
    {
        var arrCounter = 0;
        var highCard = new Card('s', 0);
        Quads = [];
        for(var i = cards.length - 1; i >= 0; i--)
        {
            if(cards[i].getNumber() == quadCard)
            {
                Quads[arrCounter++] = cards[i];
            }
            else if(cards[i].getNumber() > highCard.getNumber())
            {
                highCard = cards[i];
            }
            
        }
        Quads[arrCounter] = highCard;
        quadsNumber = 7 + Quads[0].getNumber() * tenNegTwo + Quads[4].getNumber() * tenNegFour;
    }
    
    if(quadsNumber != null)
    {
        return quadsNumber;
    }
    return null;
}
returnStraightFlushNumber(hand1)
{
    var suits = ['s', 'c', 'd', 'h'];
    var cards = this.returnArrayOfSortedBoardAndHandCards(hand1);

    var flush = false;
    var flushSuit;;
    var flushCount = 0;
    for(var i = 0; i < suits.length; i++)
    {
        var currSuit = suits[i];
        flushCount = 0;
        for(var k = 0; k < cards.length; k++)
        {
            
            if(cards[k].getSuit() == currSuit)
            {
                flushCount++;
            }
        }
        if(flushCount >= 5)
        {
            flush = true;
            flushSuit = currSuit;
            break;
        }
    }
    
    
    var straight = null;
    //Number to return
    var straightFlushNumber;
    if(flush)
    {
        var cardsOfFlushSuit = [];
        var p = 0;
        for(var k = 0; k < cards.length; k++)
        {
            
            if(cards[k].getSuit() == flushSuit)
            {
                cardsOfFlushSuit[p++] = cards[k];
            }
        }
        cardsOfFlushSuit = this.insertionSort(cardsOfFlushSuit);

        //console.log(cardsOfFlushSuit);
        
        var straightCounter = 0;
        var isStraight = false;
        var wheel = false;
        var aceExists = false;
        var acePosition = 0;
        var topOfStraight = null;
        var topIndex = 0;
        for(var i = cardsOfFlushSuit.length - 2; i >= 0; i--)
        {
            if(cards[cards.length -1].getNumber() == 14)
            {
                aceExists = true;
                acePosition = cards.length -1;
            }
            
            if(straightCounter == 4)
            {
                isStraight = true;
                break;
            }
            if(cardsOfFlushSuit[i].getNumber() - cardsOfFlushSuit[i +1].getNumber() == -1)
            {
                if(straightCounter == 0)
                {
                    topOfStraight = cardsOfFlushSuit[i+1];
                    topIndex = i + 1;
                }
                straightCounter++;
            }
            else if(cardsOfFlushSuit[i].getNumber() == cardsOfFlushSuit[i+1].getNumber())
            {
                //Skip over if its the same number
            }
            else {
                straightCounter = 0;
            }
            if(straightCounter == 3 && cards[i].getNumber() == 2 && aceExists)
            {
                wheel = true;
                isStraight = true;
                break;
            }
        }
        if(straightCounter == 4)
        {
            isStraight = true;
        }
        
        if(isStraight)
        {
            straight = [];
            var b = 0;
            
            if(wheel)
            {
                b = 4;
                straight[0] = cards[acePosition];
                for(var i = topIndex; i > 0; i--)
                {
                    straight[b--] = cards[i];
                    if(b == 0)
                    {
                        break;
                    }
                    //Skip over if its the same number
                    if(straight[b +1].getNumber() == cards[i -1].getNumber())
                    {
                        i--;
                    }
                    
                }
            }
            else {
            for(var i = topIndex; i >= 0; i--)
            {
                
                straight[b++] = cardsOfFlushSuit[i];
                if(b == 5)
                {
                    break;
                }
                //Skip over if its the same number
                if(straight[b -1].getNumber() == cardsOfFlushSuit[i -1].getNumber())
                {
                    i--;
                }
                
            }
            }
            
            straightFlushNumber = 8 + topOfStraight.getNumber() * tenNegTwo;
        }
        
        
        
        
    }
    
    if(straightFlushNumber != null)
    {
        return straightFlushNumber;
    }
    return null;
}

///////////
///////////////// Return Functions for the main function of the class
//////////


//Helper functions

currentNumCardsOnBoard()
{
    if(this.cardsOnBoard == null)
    {
        return 0;
    }
    return this.cardsOnBoard.length;
}
cardNumberIsOnTheBoard()
{

}
updateBoard(newBoard)
{

}
getCurrentBoard()
{
    return this.cardsOnBoard;
}

    //Takes array of cards and sorts them
    insertionSort(arr)
	{
		for(var i = 0; i < arr.length; i++)
		{
			var keyCard = arr[i];
			var key = arr[i].getNumber();
			var j = i - 1;
			
			
			
			while(j >= 0 && arr[j].getNumber() > key)
			{
				arr[j+1] = arr[j];
				j = j -1;
			}
			arr[j + 1] = keyCard;
        }
        
        return arr;
	}

returnArrayOfSortedBoardAndHandCards(hand1)
{
    //Put community + hole cards in an array
    var cards = [];
    var j =0;
    for(var i = 0; i < this.currentNumCardsOnBoard(); i++)
    {
        cards[i] = this.cardsOnBoard[i];
        j++;
    }
    cards[j++] = hand1.getHoleCard1();
    cards[j] = hand1.getHoleCard2();
    //
    cards = this.insertionSort(cards);
    return cards;
}


}




module.exports = handEvaluator;



