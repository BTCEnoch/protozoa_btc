# Group Domain Testing

## Introduction

This document outlines the testing strategies and methodologies for the Group Domain in the Bitcoin Protozoa project. Comprehensive testing is essential to ensure the deterministic, consistent behavior of the Group Domain, which forms a foundational component of the creature system. The testing approach covers unit tests, integration tests, property-based tests, and performance tests, with a focus on validating the deterministic nature of the domain's operations.

## Testing Objectives

The primary objectives of Group Domain testing are:

1. **Validate Determinism**: Ensure that the same inputs (seeds, particle counts) always produce the same outputs (distributions, classes, traits).
2. **Verify Constraints**: Confirm that particle distributions adhere to defined constraints (total particles, min/max per role).
3. **Test Edge Cases**: Validate behavior at boundary conditions and with unusual inputs.
4. **Ensure Integration**: Verify correct interaction with other domains (Bitcoin, RNG, Traits, Creature).
5. **Measure Performance**: Assess computational efficiency and resource usage.

## Unit Testing

Unit tests focus on individual components and methods within the Group Domain:

### ParticleDistributionService Tests

```typescript
describe('ParticleDistributionService', () => {
  let service: ParticleDistributionService;
  
  beforeEach(() => {
    service = new ParticleDistributionService();
  });
  
  describe('distributeParticles', () => {
    it('should distribute exactly 500 particles', () => {
      const distribution = service.distributeParticles(500, 12345);
      const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
      expect(total).toBe(500);
    });
    
    it('should ensure each role has at least 43 particles', () => {
      const distribution = service.distributeParticles(500, 12345);
      for (const role of Object.keys(distribution) as Role[]) {
        expect(distribution[role]).toBeGreaterThanOrEqual(43);
      }
    });
    
    it('should ensure no role has more than 220 particles', () => {
      const distribution = service.distributeParticles(500, 12345);
      for (const role of Object.keys(distribution) as Role[]) {
        expect(distribution[role]).toBeLessThanOrEqual(220);
      }
    });
    
    it('should produce deterministic results for the same seed', () => {
      const distribution1 = service.distributeParticles(500, 12345);
      const distribution2 = service.distributeParticles(500, 12345);
      expect(distribution1).toEqual(distribution2);
    });
    
    it('should produce different results for different seeds', () => {
      const distribution1 = service.distributeParticles(500, 12345);
      const distribution2 = service.distributeParticles(500, 67890);
      expect(distribution1).not.toEqual(distribution2);
    });
  });
  
  describe('dirichletDistribution', () => {
    // Similar tests for the Dirichlet distribution method
  });
  
  describe('normalizedRandomSplit', () => {
    // Similar tests for the Normalized Random Split method
  });
});
```

### ClassAssignmentService Tests

```typescript
describe('ClassAssignmentService', () => {
  let service: ClassAssignmentService;
  
  beforeEach(() => {
    service = new ClassAssignmentService();
  });
  
  describe('getMainClass', () => {
    it('should return Healer for CORE dominant role', () => {
      expect(service.getMainClass(Role.CORE)).toBe(MainClass.HEALER);
    });
    
    // Similar tests for other roles
  });
  
  describe('getTier', () => {
    it('should return COMMON for 43-95 particles', () => {
      expect(service.getTier(43)).toBe(Tier.COMMON);
      expect(service.getTier(95)).toBe(Tier.COMMON);
    });
    
    // Similar tests for other tier ranges
  });
  
  describe('getSubclass', () => {
    it('should return hybrid subclass for Tiers 1-2', () => {
      const groups = createTestGroups({
        [Role.CORE]: 95,
        [Role.DEFENSE]: 90,
        [Role.ATTACK]: 85,
        [Role.CONTROL]: 80,
        [Role.MOVEMENT]: 150
      });
      
      const subclass = service.getSubclass(groups, Tier.COMMON);
      expect(subclass.name).toBe('Guardian Healer');
      expect(subclass.mainClass).toBe(MainClass.HEALER);
      expect(subclass.tier).toBe(Tier.COMMON);
    });
    
    it('should return specialized subclass for Tiers 3-6', () => {
      const groups = createTestGroups({
        [Role.CORE]: 120,
        [Role.DEFENSE]: 110,
        [Role.ATTACK]: 90,
        [Role.CONTROL]: 80,
        [Role.MOVEMENT]: 100
      });
      
      const subclass = service.getSubclass(groups, Tier.RARE);
      expect(subclass.specializedPath).toBeDefined();
      expect(subclass.tier).toBe(Tier.RARE);
    });
  });
});
```

### TraitAssignmentService Tests

```typescript
describe('TraitAssignmentService', () => {
  let service: TraitAssignmentService;
  let mockTraitsService: jest.Mocked<ITraitsService>;
  
  beforeEach(() => {
    mockTraitsService = {
      getTraitPool: jest.fn()
    } as any;
    
    service = new TraitAssignmentService(mockTraitsService);
  });
  
  describe('assignTraits', () => {
    it('should assign traits based on main class, subclass, and tier', () => {
      // Setup mock trait pool
      mockTraitsService.getTraitPool.mockReturnValue({
        formations: [{ id: 'f1', name: 'Test Formation' }],
        behaviors: [{ id: 'b1', name: 'Test Behavior' }],
        abilities: [{ id: 'a1', name: 'Test Ability' }]
      });
      
      const groups = createTestGroups();
      const mainClass = MainClass.HEALER;
      const subclass = { name: 'Guardian Healer', mainClass, tier: Tier.COMMON };
      
      const traits = service.assignTraits(groups, mainClass, subclass, Tier.COMMON);
      
      expect(traits.formation).toBeDefined();
      expect(traits.behaviors.length).toBeGreaterThan(0);
      expect(traits.abilities.length).toBeGreaterThan(0);
      
      expect(mockTraitsService.getTraitPool).toHaveBeenCalledWith(
        mainClass, subclass, Tier.COMMON
      );
    });
    
    it('should produce deterministic results for the same seed', () => {
      // Setup mock trait pool
      mockTraitsService.getTraitPool.mockReturnValue({
        formations: [
          { id: 'f1', name: 'Formation 1' },
          { id: 'f2', name: 'Formation 2' }
        ],
        behaviors: [
          { id: 'b1', name: 'Behavior 1' },
          { id: 'b2', name: 'Behavior 2' }
        ],
        abilities: [
          { id: 'a1', name: 'Ability 1' },
          { id: 'a2', name: 'Ability 2' }
        ]
      });
      
      const groups = createTestGroups();
      const mainClass = MainClass.HEALER;
      const subclass = { name: 'Guardian Healer', mainClass, tier: Tier.COMMON };
      
      // Use the same seed for both calls
      const seed = 12345;
      const traits1 = service.assignTraits(groups, mainClass, subclass, Tier.COMMON, seed);
      const traits2 = service.assignTraits(groups, mainClass, subclass, Tier.COMMON, seed);
      
      expect(traits1).toEqual(traits2);
    });
  });
});
```

## Integration Testing

Integration tests verify the interaction between the Group Domain and other domains:

### Group Domain and RNG Domain Integration

```typescript
describe('Group Domain and RNG Domain Integration', () => {
  let groupService: GroupService;
  let rngService: RNGService;
  
  beforeEach(() => {
    rngService = new RNGService();
    groupService = new GroupService(rngService);
  });
  
  it('should use RNG service for particle distribution', () => {
    const spy = jest.spyOn(rngService, 'createRNG');
    
    groupService.createGroups(500, 12345);
    
    expect(spy).toHaveBeenCalledWith(12345);
  });
});
```

### Group Domain and Traits Domain Integration

```typescript
describe('Group Domain and Traits Domain Integration', () => {
  let groupService: GroupService;
  let traitsService: TraitsService;
  
  beforeEach(() => {
    traitsService = new TraitsService();
    groupService = new GroupService(null, traitsService);
  });
  
  it('should fetch trait pools from Traits service', () => {
    const spy = jest.spyOn(traitsService, 'getTraitPool');
    
    const groups = groupService.createGroups(500, 12345);
    groupService.assignTraits(groups);
    
    expect(spy).toHaveBeenCalled();
  });
});
```

### Group Domain and Creature Domain Integration

```typescript
describe('Group Domain and Creature Domain Integration', () => {
  let groupService: GroupService;
  let creatureService: CreatureService;
  
  beforeEach(() => {
    creatureService = new CreatureService();
    groupService = new GroupService();
    
    // Setup event subscriptions
    eventBus.subscribe(CreatureDomainEventType.CREATURE_CREATED, (payload) => {
      const groups = groupService.createGroups(500, 12345);
      creatureService.setGroups(payload.creatureId, groups);
    });
  });
  
  it('should assign groups to creature on creation', () => {
    const spy = jest.spyOn(creatureService, 'setGroups');
    
    // Trigger creature creation
    eventBus.publish(CreatureDomainEventType.CREATURE_CREATED, { creatureId: 'test-creature' });
    
    expect(spy).toHaveBeenCalledWith('test-creature', expect.any(Object));
  });
});
```

## Property-Based Testing

Property-based testing uses randomized inputs to verify that certain properties hold true:

```typescript
describe('Property-Based Testing', () => {
  let service: ParticleDistributionService;
  
  beforeEach(() => {
    service = new ParticleDistributionService();
  });
  
  it('should maintain total particle count for any seed', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const distribution = service.distributeParticles(500, seed);
        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        return total === 500;
      })
    );
  });
  
  it('should maintain min/max constraints for any seed', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const distribution = service.distributeParticles(500, seed);
        return Object.values(distribution).every(count => count >= 43 && count <= 220);
      })
    );
  });
  
  it('should produce the same distribution for the same seed', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const distribution1 = service.distributeParticles(500, seed);
        const distribution2 = service.distributeParticles(500, seed);
        return JSON.stringify(distribution1) === JSON.stringify(distribution2);
      })
    );
  });
});
```

## Performance Testing

Performance tests assess the computational efficiency of the Group Domain:

```typescript
describe('Performance Testing', () => {
  let service: GroupService;
  
  beforeEach(() => {
    service = new GroupService();
  });
  
  it('should create groups efficiently', () => {
    const iterations = 1000;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      service.createGroups(500, i);
    }
    
    const endTime = performance.now();
    const averageTime = (endTime - startTime) / iterations;
    
    console.log(`Average time to create groups: ${averageTime.toFixed(2)}ms`);
    expect(averageTime).toBeLessThan(10); // Should take less than 10ms on average
  });
  
  it('should handle large batch operations', () => {
    const batchSize = 100;
    const groups = Array(batchSize).fill(0).map((_, i) => service.createGroups(500, i));
    
    const startTime = performance.now();
    
    for (const g of groups) {
      service.assignTraits(g);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    console.log(`Time to assign traits to ${batchSize} groups: ${totalTime.toFixed(2)}ms`);
    expect(totalTime).toBeLessThan(1000); // Should take less than 1 second for 100 groups
  });
});
```

## Edge Case Testing

Edge case tests verify behavior at boundary conditions:

```typescript
describe('Edge Case Testing', () => {
  let service: ParticleDistributionService;
  
  beforeEach(() => {
    service = new ParticleDistributionService();
  });
  
  it('should handle minimum total particles (215)', () => {
    // 215 is the minimum (43 * 5)
    const distribution = service.distributeParticles(215, 12345);
    expect(Object.values(distribution)).toEqual([43, 43, 43, 43, 43]);
  });
  
  it('should handle maximum possible particles (1100)', () => {
    // 1100 is the maximum (220 * 5)
    const distribution = service.distributeParticles(1100, 12345);
    expect(Object.values(distribution)).toEqual([220, 220, 220, 220, 220]);
  });
  
  it('should handle extremely skewed RNG values', () => {
    // Mock RNG to return extremely skewed values
    const mockRNG = {
      nextFloat: jest.fn()
        .mockReturnValueOnce(0.999) // Almost all to first role
        .mockReturnValueOnce(0.0001)
        .mockReturnValueOnce(0.0001)
        .mockReturnValueOnce(0.0001)
        .mockReturnValueOnce(0.0001)
    };
    
    jest.spyOn(service as any, 'createRNG').mockReturnValue(mockRNG);
    
    const distribution = service.distributeParticles(500, 12345);
    
    // Even with skewed RNG, constraints should be maintained
    expect(Object.values(distribution).every(count => count >= 43 && count <= 220)).toBe(true);
    expect(Object.values(distribution).reduce((sum, count) => sum + count, 0)).toBe(500);
  });
});
```

## Test Coverage

The Group Domain testing aims for comprehensive coverage:

1. **Line Coverage**: >90% of all code lines
2. **Branch Coverage**: >85% of all conditional branches
3. **Function Coverage**: 100% of public methods

Coverage is measured using Jest's built-in coverage tools:

```bash
jest --coverage --collectCoverageFrom="src/domains/group/**/*.ts"
```

## Continuous Integration

Group Domain tests are integrated into the CI/CD pipeline:

1. **Pre-commit Hooks**: Run unit tests before allowing commits
2. **Pull Request Validation**: Run all tests on PR creation
3. **Nightly Builds**: Run performance and property-based tests

## Test Data Generation

Helper functions for generating test data:

```typescript
function createTestGroups(
  distribution: Partial<Record<Role, number>> = {}
): ParticleGroups {
  const defaultDistribution: Record<Role, number> = {
    [Role.CORE]: 100,
    [Role.CONTROL]: 100,
    [Role.MOVEMENT]: 100,
    [Role.DEFENSE]: 100,
    [Role.ATTACK]: 100
  };
  
  const finalDistribution = { ...defaultDistribution, ...distribution };
  
  return {
    [Role.CORE]: {
      role: Role.CORE,
      particleCount: finalDistribution[Role.CORE],
      attributes: createTestAttributes()
    },
    [Role.CONTROL]: {
      role: Role.CONTROL,
      particleCount: finalDistribution[Role.CONTROL],
      attributes: createTestAttributes()
    },
    [Role.MOVEMENT]: {
      role: Role.MOVEMENT,
      particleCount: finalDistribution[Role.MOVEMENT],
      attributes: createTestAttributes()
    },
    [Role.DEFENSE]: {
      role: Role.DEFENSE,
      particleCount: finalDistribution[Role.DEFENSE],
      attributes: createTestAttributes()
    },
    [Role.ATTACK]: {
      role: Role.ATTACK,
      particleCount: finalDistribution[Role.ATTACK],
      attributes: createTestAttributes()
    },
    totalParticles: Object.values(finalDistribution).reduce((sum, count) => sum + count, 0)
  };
}

function createTestAttributes(): GroupAttributes {
  return {
    strength: 10,
    agility: 10,
    intelligence: 10,
    vitality: 10,
    resilience: 10
  };
}
```

## Conclusion

The Group Domain testing strategy ensures that the domain functions correctly, deterministically, and efficiently. By combining unit tests, integration tests, property-based tests, and performance tests, we can verify that the Group Domain meets its requirements and integrates properly with other domains. The focus on determinism validation is particularly important for the Bitcoin Protozoa project, where consistent, reproducible behavior is a core principle.
