import {memoryStore} from './memory';
import {kyel, kyelsGoal} from '../fixtures/profile';

/**
 * The gate, not the store. ADR-0007's point is that the flag matters more than
 * where it is kept, so these walk the contract every store has to honour — the
 * in-memory one today, whatever Kyel picks tomorrow.
 */
describe('the setup store', () => {
  it('has nothing to say before anyone has been through setup', async () => {
    const store = memoryStore();
    await expect(store.read()).resolves.toBeNull();
  });

  it('gives back the setup it was handed', async () => {
    const store = memoryStore();

    await store.write({profile: kyel, goal: kyelsGoal});

    await expect(store.read()).resolves.toEqual({
      profile: kyel,
      goal: kyelsGoal,
    });
  });

  it('starts over when it is cleared', async () => {
    const store = memoryStore();
    await store.write({profile: kyel, goal: kyelsGoal});

    await store.clear();

    await expect(store.read()).resolves.toBeNull();
  });

  it('keeps a copy, so editing what was passed in cannot change what was saved', async () => {
    const store = memoryStore();
    const profile = {...kyel};

    await store.write({profile, goal: kyelsGoal});
    profile.weightKg = 99;

    const saved = await store.read();
    expect(saved?.profile.weightKg).toBe(83);
  });

  it('reads as not set up when the stored setup is unusable', async () => {
    // A store handed something that is not a setup — a half-written record, an
    // older shape, a bad parse. Asking again beats opening Today on nonsense.
    const store = memoryStore({profile: {weightKg: 83}} as never);

    await expect(store.read()).resolves.toBeNull();
  });
});
