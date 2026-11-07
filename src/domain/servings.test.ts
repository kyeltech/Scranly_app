import {SERVING_CARDS, cardFor, caveatFor} from './servings';

/**
 * The serving guide's cards.
 *
 * A pack that states no serving leaves you holding a bag and guessing. UK
 * guidance answers that in hands rather than cups and tennis balls — the
 * British Nutrition Foundation's "Find your balance" — and a hand is the one
 * measure you always have with you.
 */
describe('the cards', () => {
  it('covers the sixteen groups the guide was drawn with', () => {
    expect(SERVING_CARDS).toHaveLength(16);
  });

  it('gives every card a group, a measure in words and what it comes to', () => {
    for (const card of SERVING_CARDS) {
      expect(card.group).not.toBe('');
      expect(card.measure).not.toBe('');
      expect(card.amount.value).not.toBe('');
    }
  });

  it('carries the weight the button will set, where there is one to set', () => {
    const nuts = SERVING_CARDS.find(c => c.id === 'nuts');

    expect(nuts?.measure).toBe('What fits in your palm');
    expect(nuts?.grams).toBe(20);
    expect(nuts?.kcal).toBe('113–137 kcal');
  });

  /**
   * Milk is stated in millilitres, and 200 ml is not 200 g. The app logs
   * grams, so this card tells you the measure and sets nothing — the same
   * refusal `gramsOf` makes, in the same situation.
   */
  it('sets no weight for a card measured in millilitres', () => {
    const milk = SERVING_CARDS.find(c => c.id === 'milk');

    expect(milk?.amount).toEqual({value: '200', unit: 'ml'});
    expect(milk?.grams).toBeUndefined();
  });

  it('keeps the one object measure the guidance actually uses', () => {
    const spaghetti = SERVING_CARDS.find(c => c.id === 'spaghetti');

    expect(spaghetti?.measure).toBe('A bunch the width of a £1 coin');
    expect(spaghetti?.grams).toBe(75);
  });
});

/**
 * Which card to open on. Open Food Facts gives a category, so the sheet can
 * open on the food's own group rather than making someone swipe sixteen times
 * to reach it.
 */
describe('the card a food opens on', () => {
  it('opens on nuts for the almonds that started this', () => {
    expect(cardFor('Whole almonds')?.id).toBe('nuts');
  });

  it('reads the category however it is worded', () => {
    expect(cardFor('Nuts and their products')?.id).toBe('nuts');
    expect(cardFor('SUNFLOWER SEEDS')?.id).toBe('nuts');
  });

  it('tells spaghetti from the rest of the pasta, which is measured differently', () => {
    expect(cardFor('Spaghetti')?.id).toBe('spaghetti');
    expect(cardFor('Fusilli pasta')?.id).toBe('pasta');
  });

  it('matches the other groups a shop sells', () => {
    expect(cardFor('Cheddar cheese')?.id).toBe('cheese');
    expect(cardFor('Greek yogurt')?.id).toBe('yoghurt');
    expect(cardFor('Breakfast cereals')?.id).toBe('cereal');
    expect(cardFor('Chicken breasts')?.id).toBe('chicken');
    expect(cardFor('Canned chickpeas')?.id).toBe('pulses');
    expect(cardFor('Olive oil')?.id).toBe('oil');
  });

  it('says nothing for a category it does not know, rather than guessing one', () => {
    // A guess here would be worse than none: it would put a number in front of
    // somebody with a hand gesture to match it to.
    expect(cardFor('Christmas pudding')).toBeUndefined();
    expect(cardFor(undefined)).toBeUndefined();
  });
});

/**
 * The caveat under the card.
 *
 * One fixed line said that a hand is a measure you always have with you and
 * that it scales with the person. True of ten of these cards; nonsense on the
 * six measured with a spoon, a glass or a coin, where nothing about the
 * measure scales with the hand holding it.
 */
describe('the caveat each card carries', () => {
  it('gives every card a drawing and something true to say under it', () => {
    for (const card of SERVING_CARDS) {
      expect(card.glyph).toBeTruthy();
      expect(caveatFor(card)).not.toBe('');
    }
  });

  it('names where the measures come from, on all of them', () => {
    for (const card of SERVING_CARDS) {
      expect(caveatFor(card)).toContain('British Nutrition Foundation');
    }
  });

  it('says the hand scales, on the cards measured with a hand', () => {
    const nuts = SERVING_CARDS.find(c => c.id === 'nuts')!;
    const pasta = SERVING_CARDS.find(c => c.id === 'pasta')!;

    expect(caveatFor(nuts)).toContain('bigger hands');
    // Two cupped hands is still hands, so the general caveat is the right one.
    expect(caveatFor(pasta)).toContain('bigger hands');
  });

  it('does not claim a spoonful scales with the size of your hand', () => {
    const pulses = SERVING_CARDS.find(c => c.id === 'pulses')!;

    expect(caveatFor(pulses)).not.toContain('bigger hands');
    // What it says instead is the thing the source is careful about.
    expect(caveatFor(pulses)).toContain('10 ml');
  });

  it('tells a serving spoon from a tablespoon, because the source does', () => {
    const veg = SERVING_CARDS.find(c => c.id === 'veg')!;

    expect(caveatFor(veg)).toContain('serving spoon');
    expect(caveatFor(veg)).not.toContain('10 ml');
  });

  it('explains on the milk card why nothing is set', () => {
    const milk = SERVING_CARDS.find(c => c.id === 'milk')!;

    expect(caveatFor(milk)).toContain('not grams');
  });

  it('says the spaghetti weight is the dry one', () => {
    const spaghetti = SERVING_CARDS.find(c => c.id === 'spaghetti')!;

    expect(caveatFor(spaghetti)).toContain('Dried');
  });

  it('says a teaspoon of oil is a thin scrape, which is what the source assumes', () => {
    const oil = SERVING_CARDS.find(c => c.id === 'oil')!;

    expect(caveatFor(oil)).toContain('thinly');
  });
});

/**
 * Cooked pasta and dried spaghetti are the same food either side of a pan, so
 * each card points at the other: the board put the pointer on pasta, and the
 * spaghetti card's own caveat points back.
 */
describe('the pointer between the two pasta cards', () => {
  it('sends you from cooked pasta to the coin, which is how spaghetti is measured', () => {
    const pasta = SERVING_CARDS.find(c => c.id === 'pasta')!;

    expect(pasta.tip?.glyph).toBe('coin');
    expect(pasta.tip?.text).toContain('£1 coin');
  });

  it('sends you back the other way from spaghetti', () => {
    const spaghetti = SERVING_CARDS.find(c => c.id === 'spaghetti')!;

    expect(caveatFor(spaghetti)).toContain('cooked pasta');
  });

  it('leaves every other card without one, because they have nowhere to point', () => {
    const pointing = SERVING_CARDS.filter(c => c.tip);

    expect(pointing.map(c => c.id)).toEqual(['pasta']);
  });
});
