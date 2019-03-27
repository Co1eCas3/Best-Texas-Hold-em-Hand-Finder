// @params cards [Arr] -- concatenated array of shared community cards and one player's hole cards (lenght = 7)
// @return Best 5-card Hand out of 7: Object (handInfo)
//    @fields type: String
//            bestFive: Arr -- best 5-card hand
//            handRank: Num -- representative of type
//            hi1 - hi5: Num/Null -- each used for comparing like ranked hands
class HandFinder {
  constructor(cards) {
    this.cards = cards.sort((a, b) => b.val - a.val);
    this.ranks = {};

    // separate cards into sub-arrays based on rank (2 - 14[A])
    this.ranks.obj = this.cards.reduce((ranks, cur, i) => {
      if (i === 0 || !Array.isArray(ranks[cur.val])) {
        ranks[cur.val] = [cur];
      } else {
        ranks[cur.val].push(cur);
      }
      return ranks;
    }, {});

    // array of rank representations;
    // will be used firstly to direct the data flow and
    // subsequently in various arithmetic/comparison ops
    this.ranks.arr = Object.keys(this.ranks.obj).sort(
      (a, b) => parseInt(b) - parseInt(a)
    );

    // separate the cards into sub-arrays based on suits
    // for determining flush and consequently data flow
    this.suitsObj = this.cards.reduce((suits, card, i) => {
      if (i === 0 || Object.keys(suits).indexOf(card.suit) === -1) {
        suits[card.suit] = [card];
      } else {
        suits[card.suit].push(card);
      }
      return suits;
    }, {});

    // return object
    this.handInfo = {
      type: null,
      bestFive: null,
      handRank: null,
      hi1: null,
      hi2: null,
      hi3: null,
      hi4: null,
      hi5: null
    };
  }

  // Primary method/data-flow controller
  // best hand possibilities are determined by how many ranks are present, i.e.:

  //  Upper Tier Hands:
  //    2 ranks = quads
  //    3 ranks = quads, full house
  //    4 ranks = quads, full house, 2pair
  //  Lower Tier Hands: (Str/Fsh = straight-flush/royal-flush, flush, or straight)
  //    5 ranks = Str/Fsh, set, 2pair
  //    6 ranks = Str/Fsh, pair
  //    7 ranks = Str/Fsh, hi-card (nothing)

  // thusly, we can systematically rule out which (computationally expensive)
  // processes aren't necessary to determine the best hand

  // Hand-specific methods are listed in order they might be invoked
  bestHand() {
    if (this.ranks.arr.length <= 4) return this.upperTier();

    const flush = this.flush();
    if (flush) {
      const straightFlush = this.straight(flush);

      if (!straightFlush) {
        this.handInfo.type = "Flush";
        this.handInfo.bestFive = flush.slice(0, 5);
        this.handInfo.handRank = 5;
        this.handInfo.hi1 = flush[0].val; //  Two or more players can achieve
        this.handInfo.hi2 = flush[1].val; //  a flush, but only one player can
        this.handInfo.hi3 = flush[2].val; //  win in this instance, thus values
        this.handInfo.hi4 = flush[3].val; //  of all five cards must be
        this.handInfo.hi5 = flush[4].val; //  evaluated for comparison
        //  e.g. [[6h, 5h, 7h, Ah, 3c], [3h, Kc], [Js, 4h]]
        //  Player 2 wins
      } else {
        const hi = (straightFlush && straightFlush[0].val) || flush[0].val;
        this.handInfo.type = hi === 14 ? "Royal Flush" : "Straight Flush";
        this.handInfo.bestFive = straightFlush;
        this.handInfo.handRank = hi === 14 ? 9 : 8;
        this.handInfo.hi1 = hi;
      }

      return this.handInfo;
    }

    const straight = this.straight();
    if (straight) {
      this.handInfo.type = "Straight";
      this.handInfo.bestFive = straight;
      this.handInfo.handRank = 4;
      this.handInfo.hi1 = straight[0].val;

      return this.handInfo;
    }

    return this.lowerTier();
  }

  // Only invoked if this.ranks.arr.length <= 4
  // Checking for quads, full house, or 2pair only
  upperTier() {
    let set = false,
      pair = false; // temp vars to store first found set/pair

    for (let i = 0; i < this.ranks.arr.length; i++) {
      let cur = this.ranks.obj[this.ranks.arr[i]];

      // quads = immediate return -- no higher
      // hand possible at this point
      if (this.quads(cur)) {
        const made = this.fill(this.quads(cur));

        this.handInfo.type = "Four-of-a-kind";
        this.handInfo.bestFive = made;
        this.handInfo.handRank = 7;
        this.handInfo.hi1 = made[0].val;
        this.handInfo.hi2 = made[4].val;

        return this.handInfo;
      }

      // for first iteration
      if (!set && !pair) {
        set = this.set(cur);
        pair = this.pair(cur);
        continue;
      }

      // a set (no quads) means full house
      if (set && (this.set(cur) || this.pair(cur))) {
        pair = this.set(cur) || this.pair(cur); // admittedly, 'pair' is a bit of a misnomer
        // in the case that this returns a set,
        // but for the sake of the return from boat(),
        // it makes more sense, as we only need two
        // of the three cards
        return this.boat(set, pair);
      } else if (pair) {
        // full house still possible
        if (this.ranks.arr.length === 3) {
          // 2pair only possible with length = 4
          if (this.set(cur)) {
            // -- wait for set to make full house
            return this.boat(this.set(cur), pair);
          } else {
            continue;
          }
        } else {
          if (this.set(cur)) return this.boat(this.set(cur), pair);
          if (this.pair(cur)) return this.twoPair(pair, this.pair(cur));
        }
      }
    }
  }

  // can't yet return the best hand in case of > 5-card flush occurring with
  // 'wheel' straight-flush -- top five determined in
  // bestHand method.
  flush() {
    for (let suit in this.suitsObj) {
      if (this.suitsObj[suit].length >= 5)
        return this.suitsObj[suit].sort((a, b) => b.val - a.val);
    }
    return false;
  }

  straight(flush = false) {
    // take the first value in a 5-card slice and determine
    // what the sum of all five cards SHOULD be
    const compareSum = val => {
      let start = val,
        sum = start,
        i = 1;

      while (i < 5) {
        sum += --start;
        i++;
      }
      return sum;
    };

    // determines if the last 4 values in this.ranks.arr are == 14
    // i.e. wheel draw
    const wheel = butt => butt.reduce((sum, val) => sum + val, 0) === 14;

    // compare the sum of values in a 5-card slice to value returned
    // from compareSum()
    const strFind = slice => {
      const sliceSum = slice.reduce((sum, val) => sum + val, 0);
      return sliceSum === compareSum(slice[0]) ? slice : false;
    };

    // if strFind() = true, map the ints to cards using card.val
    // (suits only matter in case of flush -- take from flush input)
    const findStrCards = ranks => {
      return ranks.map(
        rank =>
          (flush && flush.find(card => card.val === rank)) ||
          this.cards.find(card => card.val === rank)
      );
    };

    // so i don't have parseInt()/index vars all over this method
    const ranksToInts = flush
      ? flush.map(card => card.val)
      : this.ranks.arr.map(val => parseInt(val));

    // determine how many slices we need to evaluate
    let slicePos = ranksToInts.length - 5,
      // temporary storage of a straight found
      strFound = false;

    // backwards loop in order to avoid keeping track of index
    while (slicePos >= 0) {
      strFound = strFind(ranksToInts.slice(slicePos, slicePos + 5)) || strFound;
      slicePos--;
    }

    // if A present and no straight found, check for wheel
    if (!strFound && ranksToInts[0] === 14) {
      const butt = ranksToInts.slice(-4);
      if (wheel(butt)) {
        butt.push(ranksToInts.shift());
        return findStrCards(butt);
      }
    }

    return strFound && findStrCards(strFound);
  }

  // only invoked if:
  //    1) this.ranks.arr.length > 4
  //    2) no flush found
  //    3) no straight found
  // this.ranks.arr.length == 7 => MUST be hi-card
  // this.ranks.arr.length == 6 => MUST be a pair
  // this.ranks.arr.lenght == 5 => MUST be either 2pair OR set
  lowerTier() {
    let made; // temp var, so as to avoid multiple computations of same method(s)

    switch (this.ranks.arr.length) {
      case 6:
        for (let i = 0; i < 6; i++) {
          let cur = this.ranks.obj[this.ranks.arr[i]];

          if (this.pair(cur)) {
            // again, only looking for a pair here
            made = this.fill(this.pair(cur));

            this.handInfo.type = "Pair";
            this.handInfo.bestFive = made;
            this.handInfo.handRank = 1;
            this.handInfo.hi1 = made[0].val;
            this.handInfo.hi2 = made[2].val;
            this.handInfo.hi3 = made[3].val;
            this.handInfo.hi4 = made[4].val;

            return this.handInfo;
          }
        }
      case 5:
        let pair = false; // temp var to hold first pair found (in case of 2pair only)

        for (let i = 0; i < 5; i++) {
          let cur = this.ranks.obj[this.ranks.arr[i]];

          if (pair && this.pair(cur)) {
            // if we've found a pair all we're looking
            return this.twoPair(pair, this.pair(cur)); // for is another pair
          } else if (this.set(cur)) {
            // otherwise, check for a set
            made = this.fill(this.set(cur));

            this.handInfo.type = "Three-of-a-kind";
            this.handInfo.bestFive = made;
            this.handInfo.handRank = 3;
            this.handInfo.hi1 = made[0].val;
            this.handInfo.hi2 = made[3].val;
            this.handInfo.hi3 = made[4].val;

            return this.handInfo;
          } else if (!pair) {
            // otherwise, keep checking for a pair
            pair = this.pair(cur); // (if no pair already found)
          }
        }
      default:
        made = this.cards.slice(0, 5);

        this.handInfo.type = "High Card";
        this.handInfo.bestFive = made;
        this.handInfo.handRank = 0;
        this.handInfo.hi1 = made[0].val;
        this.handInfo.hi2 = made[1].val;
        this.handInfo.hi3 = made[2].val;
        this.handInfo.hi4 = made[3].val;
        this.handInfo.hi5 = made[4].val;

        return this.handInfo;
    }
  }

  // unique hand determinators (not flush and/or straight)
  // each requires a sub-array of this.cards found in
  // this.ranks.obj
  quads(rankSet) {
    return rankSet.length === 4 ? rankSet : false;
  }

  boat(set, pair) {
    const made = set.concat(pair);

    this.handInfo.type = "Full House";
    this.handInfo.bestFive = made.slice(0, 5);
    this.handInfo.handRank = 6;
    this.handInfo.hi1 = made[0].val;
    this.handInfo.hi2 = made[3].val;

    return this.handInfo;
  }

  set(rankSet) {
    return rankSet.length === 3 ? rankSet : false;
  }

  twoPair(pair1, pair2) {
    const made = this.fill(pair1.concat(pair2));

    this.handInfo.type = "Two Pair";
    this.handInfo.bestFive = made;
    this.handInfo.handRank = 2;
    this.handInfo.hi1 = made[0].val;
    this.handInfo.hi2 = made[2].val;
    this.handInfo.hi3 = made[4].val;

    return this.handInfo;
  }

  pair(rankSet) {
    return rankSet.length === 2 ? rankSet : false;
  }

  // fill in the next highest card(s) when best hand qualifier
  // is not of length 5, i.e. not full house, flush, straight or hi card
  fill(made) {
    while (made.length < 5) {
      made.push(
        this.cards.find(playerCard =>
          made.every(madeCard => madeCard.display !== playerCard.display)
        )
      );
    }

    return made;
  }
}
