const generateTestHand = () => {
  const Deck = deck();

  const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  const seats = getRandomInt(2, 6);

  const communityCards = () => {
    const cCards = [];
    let randomCard;
    while (cCards.length < 5) {
      randomCard = getRandomInt(0, Deck.length - 1);

      cCards.push(Deck.splice(randomCard, 1)[0].display);
    }
    return cCards;
  };
  const holeCards = () => {
    const hCardsArr = [];
    while (hCardsArr.length < seats) {
      let player = [];
      while (player.length < 2) {
        randomCard = getRandomInt(0, Deck.length - 1);
        player.push(Deck.splice(randomCard, 1)[0].display);
      }
      hCardsArr.push(player);
    }
    return hCardsArr;
  };

  return [communityCards(), ...holeCards()];
};

const generateTests = numOfTests => {
  let i = 0;

  while (i < numOfTests) {
    let testHand = generateTestHand();
    console.log(showdown(...testHand), testHand);
    i++;
  }
};

generateTests(20);

// FIRST TEST BUGS:
// console.log(
//   showdown(
//     ["10d", "Qc", "Jh", "8c", "Jd"],
//     ["2h", "Ks"],
//     ["Kh", "4d"],
//     ["10h", "3s"],
//     ["2d", "3d"]
//   )
// );

// AWESOME (working) TEST CASES:
// console.log(showdown(["3s", "8d", "3d", "8c", "6s"], ["10h", "2s"], ["6c", "7d"], ["Ac", "10c"], ["9s", "5s"])); 2pair on board A kicker ex.
// console.log(showdown(["10d", "3c", "7d", "As", "Jh"], ["2s", "4s"],["4h", "6h"])); Hi card last kicker ex.
// console.log(
//   showdown(
//     ["5d", "4d", "4h", "9d", "3c"],
//     ["4c", "Kc"], // SET
//     ["9s", "3s"], // 2PAIR 9 & 4
//     ["Jc", "Js"], // 2PAIR J & 4
//     ["2h", "7d"], // 7DUECE
//     ["7s", "6c"], // STRAIGHT 7HI
//     ["Jd", "8d"] // FLUSH JHI
//   )
// );

// FIRST TEST BUG FIX TEST:
// console.log(
//   showdown(
//     ["10d", "Qc", "Jh", "8c", "Jd"],
//     ["Qh", "Ks"],
//     ["Kh", "Qd"],
//     ["10h", "3s"],
//     ["10s", "3d"]
//   )
// );

// console.log(
//   showdown(["Jh", "Qh", "10h", "2h", "2d"], ["Kh", "Ah"], ["2c", "2s"])
// ); // straight-flush (royal) / quads
// console.log(
//   showdown(
//     ["Kh", "Qh", "10h", "2h", "2d"],
//     ["Kc", "Kd"],
//     ["Jh", "Ah"],
//     ["2c", "2s"]
//   )
// ); // straight-flush (royal) / quads / full house
// console.log(
//   showdown(["Jh", "5h", "4h", "2h", "3h"], ["Qh", "Ah"], ["Kh", "6h"])
// ); // straight-flush (wheel edge case) / straight-flush (6-hi)
// console.log(
//   showdown(["Jh", "Qh", "10h", "9c", "9h"], ["Kh", "9d"], ["8h", "7h"])
// ); // straight-flush (K - hi) / straight-flush (Q - hi)
// console.log(
//   showdown(
//     ["2c", "2h", "3s", "3h", "2d"],
//     ["4d", "3d"],
//     ["7d", "2d"],
//     ["Ad", "Kd"]
//   )
// ); // four-of-a-kind / fh (3s/2s) / fh (2s/3s)
// console.log(
//   showdown(["2c", "2s", "2h", "7h", "Qd"], ["As", "Ad"], ["Kh", "Kc"])
// ); // full-house (2s/As) / fh (2s/Ks)
// console.log(
//   showdown(["2c", "2s", "2h", "Qh", "Qd"], ["As", "Ad"], ["Qc", "Kc"])
// ); // full-house (Qs/2s) / fh (2s/As)
// console.log(
//   showdown(["2c", "2s", "2h", "Ah", "Qd"], ["As", "Ad"], ["Kh", "Kc"])
// ); // full-house (edge case)
// console.log(
//   showdown(["Jh", "Qh", "9h", "2h", "3d"], ["Ks", "Ah"], ["Js", "Jc"])
// ); // full house / flush
// console.log(
//   showdown(["Jh", "Qh", "9h", "2h", "3d"], ["Ks", "Ah"], ["Js", "Jc"])
// ); // flush
// console.log(
//   showdown(["Jh", "Qh", "9h", "2h", "3d"], ["Ks", "Ah"], ["Kh", "As"])
// ); // flush (Ahi) / flush (Khi)
// console.log(
//   showdown(["Jh", "Ah", "9h", "2h", "3d"], ["Ks", "Qh"], ["Kh", "As"])
// ); // flush (Ahi - Kkick) / flush (Ahi - Qkick)
// console.log(
//   showdown(["Jh", "Qh", "10d", "3h", "2d"], ["Ks", "Ah"], ["Js", "Jd"])
// ); // straight (broadway)
// console.log(
//   showdown(["5d", "5h", "4d", "2h", "3d"], ["3s", "Ah"], ["As", "5s"])
// ); // straight (wheel)
// console.log(
//   showdown(["6c", "Jh", "3s", "3h", "2d"], ["7s", "3d"], ["3c", "4c"])
// ); // three-of-a-kind
// console.log(
//   showdown(["6c", "Jh", "3s", "3h", "2d"], ["7s", "3d"], ["3c", "7c"])
// ); // three-of-a-kind (draw)
// console.log(showdown(["Ac", "Jh", "3s", "3h", "2d"], ["7s", "2h"])); // two-pair
// console.log(
//   showdown(["Ac", "7h", "3s", "3h", "2d"], ["7s", "2h"], ["7c", "Jc"])
// ); // two-pair (draw)
// console.log(
//   showdown(["6c", "Jh", "3s", "3h", "2d"], ["7s", "Kd"], ["Ks", "4c"])
// ); // pair (last kicker)
// console.log(
//   showdown(["9c", "5h", "3s", "3h", "2d"], ["4s", "Kd"], ["Ks", "7c"])
// ); // pair (sec kicker)
// console.log(
//   showdown(["Jc", "Qh", "9h", "2c", "3d"], ["Ks", "Ad"], ["Kh", "8h"])
// ); // nothing
// console.log(
//   showdown(
//     ["Jc", "Qh", "9h", "2c", "3d"],
//     ["Ks", "Ad"],
//     ["Kh", "As"],
//     ["Kc", "Ac"],
//     ["Kd", "Ah"]
//   )
// ); // nothing
