
class Card {
  constructor(s, n)
  {
    this.suit = s;
	this.number = n;

  }

  getSuit(){
    return this.suit;
  }

  getNumber(){
    return this.number;
  }

  static numberToString(number){
    if(number == 2)
		{
			return "Two";
		}
		if(number == 3)
		{
			return "Three";
		}
		if(number == 4)
		{
			return "Four";
		}
		if(number == 5)
		{
			return "Five";
		}
		if(number == 6)
		{
			return "Six";
		}
		if(number == 7)
		{
			return "Seven";
		}
		if(number == 8)
		{
			return "Eight";
		}
		if(number == 9)
		{
			return "Nine";
		}
		if(number == 10)
		{
			return "Ten";
		}
		if(number == 11)
		{
			return "Jack";
		}
		if(number == 12)
		{
			return "Queen";
		}
		if(number == 13)
		{
			return "King";
		}
		if(number == 14)
		{
			return "Ace";
		}
		return null;
  }

  abbreviatedString()
  {
	  var cardString = "";
	  if(this.number == 2)
	  {
		  cardString+= "2";
	  }
	  if(this.number == 3)
	  {
		  cardString+= "3";
	  }
	  if(this.number == 4)
	  {
		  cardString+= "4";
	  }
	  if(this.number == 5)
	  {
		  cardString+= "5";
	  }
	  if(this.number == 6)
	  {
		  cardString+= "6";
	  }
	  if(this.number == 7)
	  {
		  cardString+= "7";
	  }
	  if(this.number == 8)
	  {
		  cardString+= "8";
	  }
	  if(this.number == 9)
	  {
		  cardString+= "9";
	  }
	  if(this.number == 10)
	  {
		  cardString+= "10";
	  }
	  if(this.number == 11)
	  {
		  cardString+= "J";
	  }
	  if(this.number == 12)
	  {
		  cardString+= "Q";
	  }
	  if(this.number == 13)
	  {
		  cardString+= "K";
	  }
	  if(this.number == 14)
	  {
		  cardString+= "A";
	  }
	  cardString+=this.suit;
	  return cardString;
  }

  

  cardToString()
	{
    var number = this.number;
    var suit = this.suit;
		var cardString = "";
		if(number == 2)
		{
			cardString += "Two";
		}
		if(number == 3)
		{
			cardString += "Three";
		}
		if(number == 4)
		{
			cardString += "Four";
		}
		if(number == 5)
		{
			cardString += "Five";
		}
		if(number == 6)
		{
			cardString += "Six";
		}
		if(number == 7)
		{
			cardString += "Seven";
		}
		if(number == 8)
		{
			cardString += "Eight";
		}
		if(number == 9)
		{
			cardString += "Nine";
		}
		if(number == 10)
		{
			cardString += "Ten";
		}
		if(number == 11)
		{
			cardString += "Jack";
		}
		if(number == 12)
		{
			cardString += "Queen";
		}
		if(number == 13)
		{
			cardString += "King";
		}
		if(number == 14)
		{
			cardString += "Ace";
		}

		if(suit == 's')
		{
			cardString += " of Spades";
		}
		if(suit == 'c')
		{
			cardString += " of Clubs";
		}
		if(suit == 'h')
		{
			cardString += " of Hearts";
		}
		if(suit == 'd')
		{
			cardString += " of Diamonds";
		}
		return cardString;
	}

	cardToPNG()
	{
    var number = this.number;
    var suit = this.suit;
		var cardString = "" + number;


		if(suit == 's')
		{
			cardString += "S";
		}
		if(suit == 'c')
		{
			cardString += "C";
		}
		if(suit == 'h')
		{
			cardString += "H";
		}
		if(suit == 'd')
		{
			cardString += "D";
		}
		
		cardString += ".png";
		return cardString;
	}

	cardToString()
	{
		var cardString = "";
		if(this.number == 2)
		{
			cardString += "Two";
		}
		if(this.number == 3)
		{
			cardString += "Three";
		}
		if(this.number == 4)
		{
			cardString += "Four";
		}
		if(this.number == 5)
		{
			cardString += "Five";
		}
		if(this.number == 6)
		{
			cardString += "Six";
		}
		if(this.number == 7)
		{
			cardString += "Seven";
		}
		if(this.number == 8)
		{
			cardString += "Eight";
		}
		if(this.number == 9)
		{
			cardString += "Nine";
		}
		if(this.number == 10)
		{
			cardString += "Ten";
		}
		if(this.number == 11)
		{
			cardString += "Jack";
		}
		if(this.number == 12)
		{
			cardString += "Queen";
		}
		if(this.number == 13)
		{
			cardString += "King";
		}
		if(this.number == 14)
		{
			cardString += "Ace";
		}
		
		if(this.suit == 's')
		{
			cardString += " of Spades";
		}
		if(this.suit == 'c')
		{
			cardString += " of Clubs";
		}
		if(this.suit == 'h')
		{
			cardString += " of Hearts";
		}
		if(this.suit == 'd')
		{
			cardString += " of Diamonds";
		}
		return cardString;
	}
}







module.exports = Card;
