import {
  fromProduct,
  lookupBarcode,
  productFromOff,
  searchProducts,
  servingMacros,
  servingsFor,
} from './product';

/**
 * A real Open Food Facts response, captured 3 November 2026 from
 * `GET /api/v2/product/5449000000996.json` — Coca-Cola, the same lookup the
 * kitchen test ran. Trimmed to the fields the mapper reads; every value is as
 * the API returned it, so the assertions below check a real payload, not an
 * imagined one.
 */
const cocaCola = {
  code: '5449000000996',
  brands: 'COCA-COLA SERVICES SA/NV',
  product_name: 'Coca-Cola Original',
  nutriments: {
    'energy-kcal_100g': 42.4,
    proteins_100g: 0,
    carbohydrates_100g: 10.6,
    fat_100g: 0,
  },
};

describe('a product, read from an Open Food Facts response', () => {
  it('maps the barcode, name, brand and per-100 g macros a scan hands back', () => {
    expect(productFromOff(cocaCola)).toEqual({
      barcode: '5449000000996',
      name: 'Coca-Cola Original',
      brand: 'COCA-COLA SERVICES SA/NV',
      kcal: 42.4,
      proteinG: 0,
      carbsG: 10.6,
      fatG: 0,
    });
  });

  // Open Food Facts has entries that are a photo and a barcode and nothing
  // else — no energy means nothing to log, so it is no better than a miss.
  it('is undefined when the product carries no energy to log', () => {
    const noEnergy = {...cocaCola, nutriments: {proteins_100g: 0, carbohydrates_100g: 10.6, fat_100g: 0}};

    expect(productFromOff(noEnergy)).toBeUndefined();
  });

  // A nameless product cannot be shown on the serving sheet, so it is a miss too.
  it('is undefined when the product has no name to show', () => {
    const noName = {...cocaCola, product_name: ''};

    expect(productFromOff(noName)).toBeUndefined();
  });

  /**
   * A real Snickers response, captured 3 November 2026. It states a serving in
   * grams, which the weigh-or-per-100 model can offer as a second row.
   */
  const snickers = {
    code: '5000159461122',
    brands: 'Mars',
    product_name: 'Snickers',
    serving_size: '50 g',
    serving_quantity: 50,
    nutriments: {
      'energy-kcal_100g': 481,
      proteins_100g: 8.6,
      carbohydrates_100g: 60.5,
      fat_100g: 22.5,
      'energy-kcal_serving': 240,
    },
  };

  // Open Food Facts carries fibre as `fiber_100g`; the app tracks a fibre
  // target, so a scan has to bring it back (the almonds: 12.5 g per 100 g).
  it('reads fibre when Open Food Facts states it', () => {
    const almonds = {
      code: '4088600441689',
      product_name: 'Almonds',
      brands: 'The Foodie Market',
      nutriments: {
        'energy-kcal_100g': 597,
        proteins_100g: 21.2,
        carbohydrates_100g: 9.1,
        fat_100g: 49.9,
        fiber_100g: 12.5,
      },
    };

    expect(productFromOff(almonds)).toEqual(
      expect.objectContaining({fibreG: 12.5}),
    );
  });

  it('reads the pack serving when it is stated in grams', () => {
    expect(productFromOff(snickers)).toEqual({
      barcode: '5000159461122',
      name: 'Snickers',
      brand: 'Mars',
      kcal: 481,
      proteinG: 8.6,
      carbsG: 60.5,
      fatG: 22.5,
      serving: {grams: 50, kcal: 240},
    });
  });

  // Drinks state a serving in millilitres. That is not grams, and the app logs
  // grams, so it is left to the weigh path rather than guessed at.
  it('ignores a serving stated in millilitres', () => {
    const inMl = {
      ...cocaCola,
      serving_size: '1 portion (330 ml)',
      serving_quantity: 330,
      nutriments: {...cocaCola.nutriments, 'energy-kcal_serving': 140},
    };

    expect(productFromOff(inMl)?.serving).toBeUndefined();
  });
});

/** A fake `fetch` that answers once, so no test reaches the network. */
function fetchStub(status: number, body: unknown) {
  return () =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    });
}

describe('looking a barcode up in Open Food Facts', () => {
  it('returns the product when the barcode is found', async () => {
    const fetcher = fetchStub(200, {status: 1, product: cocaCola});

    await expect(lookupBarcode('5449000000996', fetcher)).resolves.toEqual({
      status: 'found',
      product: {
        barcode: '5449000000996',
        name: 'Coca-Cola Original',
        brand: 'COCA-COLA SERVICES SA/NV',
        kcal: 42.4,
        proteinG: 0,
        carbsG: 10.6,
        fatG: 0,
      },
    });
  });

  // Open Food Facts answers 200 with status 0 and no product for a barcode it
  // does not know — a real miss, which the Add-a-food path catches.
  it('is a miss when the barcode is not in the database', async () => {
    const fetcher = fetchStub(200, {status: 0, status_verbose: 'product not found'});

    await expect(lookupBarcode('0000000000000', fetcher)).resolves.toEqual({
      status: 'not-found',
    });
  });

  // 429 is the rate limit. It is a failure to reach the data, not a miss, so it
  // must be told apart — the screen says "try again", not "add this food".
  it('is an error when the rate limit is hit', async () => {
    const fetcher = fetchStub(429, {});

    await expect(lookupBarcode('5449000000996', fetcher)).resolves.toEqual({
      status: 'error',
    });
  });

  it('is an error when the network cannot be reached', async () => {
    const offline = () => Promise.reject(new Error('Network request failed'));

    await expect(lookupBarcode('5449000000996', offline)).resolves.toEqual({
      status: 'error',
    });
  });

  // Open Food Facts asks every request to name itself with a reachable contact,
  // and blocks anonymous traffic. This is that header (ADR-0010).
  it('names itself to Open Food Facts with a reachable contact', async () => {
    let seen: {url?: string; headers?: Record<string, string>} = {};
    const capture = (url: string, init?: {headers?: Record<string, string>}) => {
      seen = {url, headers: init?.headers};
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            status: 1,
            product: {product_name: 'X', nutriments: {'energy-kcal_100g': 1}},
          }),
      });
    };

    await lookupBarcode('5449000000996', capture);

    expect(seen.url).toContain('/product/5449000000996.json');
    expect(seen.headers?.['User-Agent']).toBe(
      'Scranly/0.1 (ezekielayikoe9@gmail.com)',
    );
  });
});

describe('the servings a scanned product offers', () => {
  const coke = {
    barcode: '5449000000996',
    name: 'Coca-Cola Original',
    brand: 'Coca-Cola',
    kcal: 42.4,
    proteinG: 0,
    carbsG: 10.6,
    fatG: 0,
  };

  // Open Food Facts carries per-100 g for every product, so that is the one
  // serving a scan can always offer. The pack's own servings (a slice, a whole
  // pack) are not in the data, so they are not invented here — ADR-0010.
  it('offers per 100 g, which every product carries', () => {
    expect(servingsFor(coke)).toEqual([
      {id: 'per-100', label: 'Per 100 g', grams: 100, kcal: 42.4},
    ]);
  });

  // When the pack states a gram serving, it is offered as a second row — the
  // amount most people actually eat, next to per 100 g.
  it('adds the pack serving as a second row when there is one', () => {
    const snickers = {...coke, kcal: 481, serving: {grams: 50, kcal: 240}};

    expect(servingsFor(snickers)).toEqual([
      {id: 'per-100', label: 'Per 100 g', grams: 100, kcal: 481},
      {id: 'per-serving', label: 'Per serving (50 g)', grams: 50, kcal: 240},
    ]);
  });
});

describe('searching Open Food Facts by name', () => {
  const usable = (name: string, code: string) => ({
    code,
    product_name: name,
    brands: 'Mars',
    nutriments: {'energy-kcal_100g': 489, proteins_100g: 8, carbohydrates_100g: 60, fat_100g: 24},
  });

  it('returns the usable products a search found', async () => {
    const fetcher = fetchStub(200, {
      products: [usable('Snickers', '1'), usable('Snickers Duo', '2')],
    });

    const result = await searchProducts('snickers', fetcher);

    expect(result).toEqual({
      status: 'ok',
      products: [
        expect.objectContaining({name: 'Snickers', barcode: '1'}),
        expect.objectContaining({name: 'Snickers Duo', barcode: '2'}),
      ],
    });
  });

  // Search throws up nameless, dataless entries; they are dropped, not shown.
  it('drops results with nothing to show or log', async () => {
    const fetcher = fetchStub(200, {
      products: [usable('Snickers', '1'), {brands: 'Snickers', nutriments: {}}],
    });

    const result = await searchProducts('snickers', fetcher);

    expect(result.status === 'ok' && result.products).toHaveLength(1);
  });

  it('is an error when the rate limit is hit', async () => {
    await expect(searchProducts('snickers', fetchStub(429, {}))).resolves.toEqual({
      status: 'error',
    });
  });

  it('is an error when the network cannot be reached', async () => {
    const offline = () => Promise.reject(new Error('Network request failed'));

    await expect(searchProducts('snickers', offline)).resolves.toEqual({status: 'error'});
  });
});

describe('a scanned product, as a food the diary can log', () => {
  const coke = {
    barcode: '5449000000996',
    name: 'Coca-Cola Original',
    brand: 'Coca-Cola',
    kcal: 42.4,
    proteinG: 0,
    carbsG: 10.6,
    fatG: 0,
  };

  it('becomes a loggable food at the chosen serving', () => {
    const item = fromProduct(coke, {
      id: 'per-100',
      label: 'Per 100 g',
      grams: 100,
      kcal: 42.4,
    });

    expect(item).toEqual(
      expect.objectContaining({
        name: 'Coca-Cola Original',
        brand: 'Coca-Cola',
        portion: '100 g',
        kcal: 42.4,
        proteinG: 0,
        carbsG: 10.6,
        fatG: 0,
        yours: true,
      }),
    );
  });
});

describe("a serving's macros, scaled from per 100 g", () => {
  // Independent truth: at per 100 g the serving carries the product's own
  // energy, so the macros are the product's own, unscaled.
  it('are the product’s own when the serving is per 100 g', () => {
    expect(
      servingMacros(
        {kcal: 481, proteinG: 8.6, carbsG: 60.5, fatG: 22.5, fibreG: 12.5},
        {kcal: 481},
      ),
    ).toEqual({proteinG: 8.6, carbsG: 60.5, fatG: 22.5, fibreG: 12.5});
  });

  // Independent truth: half the energy is half the food, so half the macros.
  it('halve when the serving carries half the energy', () => {
    expect(
      servingMacros(
        {kcal: 200, proteinG: 10, carbsG: 20, fatG: 8, fibreG: 6},
        {kcal: 100},
      ),
    ).toEqual({proteinG: 5, carbsG: 10, fatG: 4, fibreG: 3});
  });
});

/**
 * The three units together: a raw Open Food Facts response goes in, and the
 * product with the servings a scan would offer comes out — the whole of what
 * `Scan.tsx` leans on, from the wire to the sheet, with the network stubbed.
 */
describe('a scan, from the response to the servings it offers', () => {
  it('reads the Snickers response into a product and its two servings', async () => {
    const fetcher = fetchStub(200, {
      status: 1,
      product: {
        code: '5000159461122',
        brands: 'Mars',
        product_name: 'Snickers',
        serving_size: '50 g',
        nutriments: {
          'energy-kcal_100g': 481,
          proteins_100g: 8.6,
          carbohydrates_100g: 60.5,
          fat_100g: 22.5,
          'energy-kcal_serving': 240,
        },
      },
    });

    const result = await lookupBarcode('5000159461122', fetcher);

    expect(result.status).toBe('found');
    if (result.status !== 'found') {
      return;
    }
    expect(result.product.serving).toEqual({grams: 50, kcal: 240});
    expect(servingsFor(result.product)).toEqual([
      {id: 'per-100', label: 'Per 100 g', grams: 100, kcal: 481},
      {id: 'per-serving', label: 'Per serving (50 g)', grams: 50, kcal: 240},
    ]);
  });
});

/**
 * A filled-in entry, with everything the detail screen draws.
 *
 * The figures are the almonds this project has already checked against the
 * pack: 597 kcal, 49.9 g fat, 9.1 g carbohydrate, 21.2 g protein, 12.5 g fibre
 * per 100 g. The mapper read five of those and dropped the rest of the panel
 * on the floor.
 */
const almondsOff = {
  code: '4088600441689',
  product_name: 'Almonds',
  brands: 'The Foodie Market',
  categories: 'Plant-based foods, Nuts and their products, Whole almonds',
  ingredients_text: 'Almonds (100%)',
  image_front_small_url: 'https://images.openfoodfacts.org/almonds.200.jpg',
  nutriscore_grade: 'a',
  nova_group: 1,
  nutriments: {
    'energy-kcal_100g': 597,
    'energy-kj_100g': 2491,
    proteins_100g: 21.2,
    carbohydrates_100g: 9.1,
    fat_100g: 49.9,
    'saturated-fat_100g': 3.84,
    sugars_100g: 4.4,
    'added-sugars_100g': 0,
    fiber_100g: 12.5,
    salt_100g: 0.01,
    sodium_100g: 0.004,
  },
};

describe('the rest of the panel, which the mapper used to drop', () => {
  it('reads every nutrient the entry states, not only the five we totalled', () => {
    expect(productFromOff(almondsOff)).toEqual(
      expect.objectContaining({
        kJ: 2491,
        satFatG: 3.84,
        sugarsG: 4.4,
        addedSugarsG: 0,
        saltG: 0.01,
        sodiumG: 0.004,
        fibreG: 12.5,
      }),
    );
  });

  it('leaves out what the entry is silent about, rather than calling it zero', () => {
    const thin = productFromOff(cocaCola);

    expect(thin).not.toHaveProperty('satFatG');
    expect(thin).not.toHaveProperty('saltG');
    expect(thin).not.toHaveProperty('kJ');
  });

  it('keeps a stated zero, which is a different thing from silence', () => {
    // Almonds really do have no added sugar, and the entry says so.
    expect(productFromOff(almondsOff)?.addedSugarsG).toBe(0);
  });

  it('carries the pack photo, the scores and the words', () => {
    expect(productFromOff(almondsOff)).toEqual(
      expect.objectContaining({
        imageUrl: 'https://images.openfoodfacts.org/almonds.200.jpg',
        nutriScore: 'A',
        novaGroup: 1,
        ingredients: 'Almonds (100%)',
      }),
    );
  });

  it('takes the most specific category, which is the one worth printing', () => {
    // 'Plant-based foods' is true of half the database; 'Whole almonds' is the
    // one that tells you anything, and it is the one that picks the serving
    // guide's card.
    expect(productFromOff(almondsOff)?.category).toBe('Whole almonds');
  });

  it('grades in the case the badge shows, so no screen has to remember', () => {
    expect(productFromOff({...almondsOff, nutriscore_grade: 'c'})?.nutriScore).toBe('C');
  });

  it('passes over a grade the entry could not work out', () => {
    // Open Food Facts answers 'unknown' or 'not-applicable' for entries it
    // cannot grade, and neither is a letter to put in a badge.
    expect(productFromOff({...almondsOff, nutriscore_grade: 'unknown'})?.nutriScore).toBeUndefined();
    expect(productFromOff({...almondsOff, nutriscore_grade: 'not-applicable'})?.nutriScore).toBeUndefined();
  });
});

describe('a scanned product, as a food with its whole panel', () => {
  const product = productFromOff(almondsOff)!;

  it('hands the detail screen everything the entry gave', () => {
    const logged = fromProduct(product, {id: 'per-100', label: 'Per 100 g', grams: 100, kcal: 597});

    expect(logged.more).toEqual({
      kJ: 2491,
      satFatG: 3.84,
      sugarsG: 4.4,
      addedSugarsG: 0,
      saltG: 0.01,
      sodiumG: 0.004,
    });
    expect(logged.source).toEqual({
      from: 'Open Food Facts',
      barcode: '4088600441689',
      imageUrl: 'https://images.openfoodfacts.org/almonds.200.jpg',
      nutriScore: 'A',
      novaGroup: 1,
      category: 'Whole almonds',
      ingredients: 'Almonds (100%)',
    });
  });

  it('knows what the portion weighs, so the amount can be changed', () => {
    const logged = fromProduct(product, {id: 'per-100', label: 'Per 100 g', grams: 100, kcal: 597});

    expect(logged.portionG).toBe(100);
  });
})
