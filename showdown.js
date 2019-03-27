function showdown(communityCards, ...holeCards) {
  const Deck = deck();

  const removeKnownCard = givenCard =>
    Deck.splice(Deck.findIndex(dCard => dCard.display === givenCard), 1)[0];

  const cCards = communityCards.map(cCard => removeKnownCard(cCard));
  const players = holeCards
    .map((playerCards, i) => {
      const player = { P: i + 1 };
      player.cards = playerCards.map(hCardStr => removeKnownCard(hCardStr));
      return player;
    })
    .map(player => {
      let find = new HandFinder(player.cards.concat(cCards));
      return { ...player, ...find.bestHand() };
    })
    .sort((p1, p2) => {
      return (
        p2.handRank - p1.handRank ||
        p2.hi1 - p1.hi1 ||
        p2.hi2 - p1.hi2 ||
        p2.hi3 - p1.hi3 ||
        p2.hi4 - p1.hi4 ||
        p2.hi5 - p1.hi5
      );
    });

  const draw = (p1, p2) => {
    return (
      p2 &&
      p1.handRank === p2.handRank &&
      p1.hi1 === p2.hi1 &&
      p1.hi2 === p2.hi2 &&
      p1.hi3 === p2.hi3 &&
      p1.hi4 === p2.hi4 &&
      p1.hi5 === p2.hi5
    );
  };

  const pVp = {};

  for (let i = 0; i < players.length; i++) {
    let p1 = players[i],
      p2 = players[i + 1];
    if (draw(p1, p2)) {
      pVp[`${p1.P}VS${p2.P}`] = "draw";
    } else if (p2) {
      pVp[`${p1.P}VS${p2.P}`] = p1;
    }
  }

  const splitPotStatement = idiots => {
    if (!idiots.length) return false;
    const playersString = idiots.reduce(
      (pIds, p, i, idiots) =>
        i < idiots.length - 1
          ? (pIds += "Player" + p.P + ", ")
          : (pIds += "Player" + p.P),
      ""
    );

    const playersHands = idiots.map(
      idiot =>
        `  Player ${idiot.P}: ${idiot.type}, ${idiot.bestFive
          .map(card => card.display)
          .join(" ")}`
    );

    return `Split Pot: ${playersString}\nHands:\n${playersHands.reduce(
      (str, pStr) => (str += pStr + "\n"),
      ""
    )}  `;
  };

  const winnerStatement = winner => {
    return (
      winner &&
      `Winner: Player ${winner.P}\nHand: ${winner.type}, ${winner.bestFive
        .map(card => card.display)
        .join(" ")}`
    );
  };

  const shwdns = Object.keys(pVp),
    idiots = [];
  let winner;

  shwdns.forEach((key, i) => {
    if (typeof winner === "object") return;
    const pExtracts = key.match(/\d/g);
    const betterAndWorse = pExtracts.map(pRep =>
      players.find(p => p.P === parseInt(pRep))
    );

    if (i === 0) {
      if (pVp[key] !== "draw") {
        winner = betterAndWorse[0];
      } else {
        betterAndWorse.forEach(p => idiots.push(p));
      }
    } else {
      if (pVp[key] === "draw" && winner === undefined) {
        idiots.push(betterAndWorse[1]);
      } else {
        winner = false;
      }
    }
  });

  return winnerStatement(winner) || splitPotStatement(idiots);
}
