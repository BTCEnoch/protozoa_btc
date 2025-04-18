import { createRNGFromBlockNonce, type RNGStream } from '../rngSystem';
import { getBitcoinService } from '../../services/bitcoin';
import type { BlockData } from '../../types/bitcoin/bitcoin';

describe('RNGSystem', () => {
  let blockData: BlockData;

  beforeAll(async () => {
    const bitcoinService = getBitcoinService();
    blockData = await bitcoinService.fetchBlockData(800000);
  });

  describe('determinism', () => {
    it('should produce same sequence for same block nonce', () => {
      const rng1 = createRNGFromBlockNonce(blockData.nonce);
      const rng2 = createRNGFromBlockNonce(blockData.nonce);

      const stream1 = rng1.getStream('traits');
      const stream2 = rng2.getStream('traits');

      expect(stream1.next()).toBe(stream2.next());
      expect(stream1.next()).toBe(stream2.next());
      expect(stream1.next()).toBe(stream2.next());
    });

    it('should produce different sequences for different streams', () => {
      const rng = createRNGFromBlockNonce(blockData.nonce);

      const traitsStream = rng.getStream('traits');
      const physicsStream = rng.getStream('physics');

      expect(traitsStream.next()).not.toBe(physicsStream.next());
    });
  });

  describe('range validation', () => {
    let stream: RNGStream;

    beforeEach(() => {
      const rng = createRNGFromBlockNonce(blockData.nonce);
      stream = rng.getStream('traits');
    });

    it('should produce integers within specified range', () => {
      const min = 10;
      const max = 20;
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const value = stream.nextInt(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

    it('should respect probability in nextBool', () => {
      const iterations = 10000;
      const probability = 0.3;
      let trueCount = 0;

      for (let i = 0; i < iterations; i++) {
        if (stream.nextBool(probability)) {
          trueCount++;
        }
      }

      const actualProbability = trueCount / iterations;
      expect(actualProbability).toBeCloseTo(probability, 1);
    });
  });

  describe('array operations', () => {
    let stream: RNGStream;

    beforeEach(() => {
      const rng = createRNGFromBlockNonce(blockData.nonce);
      stream = rng.getStream('traits');
    });

    it('should maintain array integrity when shuffling', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = stream.shuffle([...original]);

      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should select valid items from array', () => {
      const array = ['a', 'b', 'c', 'd'];
      const selected = stream.nextItem(array);

      expect(array).toContain(selected);
    });

    it('should return correct number of unique items', () => {
      const array = [1, 2, 3, 4, 5];
      const count = 3;
      const selected = stream.nextItems(array, count);

      expect(selected).toHaveLength(count);
      expect(new Set(selected).size).toBe(count);
      selected.forEach(item => expect(array).toContain(item));
    });
  });

  describe('deterministic shuffling', () => {
    it('should produce identical shuffles with same block nonce and stream name', () => {
      const rng1 = createRNGFromBlockNonce(blockData.nonce);
      const rng2 = createRNGFromBlockNonce(blockData.nonce);
      
      const original = [1, 2, 3, 4, 5];
      const shuffle1 = rng1.shuffle(original, 'creature_1_traits');
      const shuffle2 = rng2.shuffle(original, 'creature_1_traits');
      
      expect(shuffle1).toEqual(shuffle2);
    });

    it('should produce different but deterministic shuffles for different stream names', () => {
      const rng = createRNGFromBlockNonce(blockData.nonce);
      
      const original = [1, 2, 3, 4, 5];
      const shuffle1 = rng.shuffle(original, 'creature_1_traits');
      const shuffle2 = rng.shuffle(original, 'creature_2_traits');
      
      expect(shuffle1).not.toEqual(shuffle2);
      
      // Verify determinism by recreating the same shuffles
      const verifyRng = createRNGFromBlockNonce(blockData.nonce);
      expect(shuffle1).toEqual(verifyRng.shuffle(original, 'creature_1_traits'));
      expect(shuffle2).toEqual(verifyRng.shuffle(original, 'creature_2_traits'));
    });
  });
});


