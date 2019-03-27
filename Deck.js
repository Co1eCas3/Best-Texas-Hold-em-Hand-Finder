const deck = () => {
  const deckArr = [];
  let suit;

  for (let i = 0; i < 4; i++) {
    switch (i) {
      case 0:
        suit = "c";
        break;
      case 1:
        suit = "d";
        break;
      case 2:
        suit = "h";
        break;
      case 3:
        suit = "s";
        break;
      default:
        break;
    }

    for (let j = 2; j <= 14; j++) {
      let card = {};
      card.suit = suit;
      card.val = j;
      switch (j) {
        case 11:
          card.fVal = "J";
          break;
        case 12:
          card.fVal = "Q";
          break;
        case 13:
          card.fVal = "K";
          break;
        case 14:
          card.fVal = "A";
          break;
        default:
          break;
      }

      card.display = (card.fVal || card.val) + card.suit;

      deckArr.push(card);
    }
  }

  return deckArr;
};
