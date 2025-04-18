
# Mutation Evolution Paths

## Purpose
This document outlines how mutation traits evolve over time in Bitcoin Protozoa, tied to confirmation milestones or other triggers. It provides a single source of truth for understanding mutation dynamics, aiding in long-term creature design and ensuring consistency across implementations.

## Location
`docs/traits/mutation_evolution_paths.md`

## Mutation Triggers and Conditions
Mutations in Bitcoin Protozoa are triggered when creatures reach specific Bitcoin block confirmation milestones. The probability of a mutation occurring increases with higher confirmation counts, governed by deterministic rules.

### Confirmation Milestones and Mutation Probabilities
| Confirmations | Mutation Probability |
|---------------|----------------------|
| 10,000        | 1%                   |
| 50,000        | 5%                   |
| 100,000       | 10%                  |
| 250,000       | 25%                  |
| 500,000       | 50%                  |
| 1,000,000     | 100%                 |

- **Trigger Mechanism**: At each milestone, a seeded random number generator (RNG) based on the block nonce determines if a mutation occurs, ensuring deterministic outcomes.
- **Conditions**: A mutation only occurs if the creature hasn’t mutated at that milestone yet and the RNG check exceeds the probability threshold.

## Examples of Evolution Paths
Mutation traits follow predefined evolution paths, where traits evolve into enhanced versions, offering strategic progression.

### Example 1: Glow Evolution
1. **Trait A**: "Minor Glow"  
   - Visual: Slight glow  
   - Effect: No stat change  
2. **Trait B**: "Radiant Glow"  
   - Visual: Stronger glow  
   - Effect: +5% visibility  
3. **Trait C**: "Blinding Light"  
   - Visual: Intense glow  
   - Effect: +10% visibility, +5% evasion  

### Example 2: Reflex Evolution
1. **Trait X**: "Quick Reflexes"  
   - Behavior: +10% dodge chance  
2. **Trait Y**: "Agile Movement"  
   - Behavior: +15% dodge chance, +5% movement speed  

## Effects of Mutations
Mutations can affect creatures in multiple ways:
- **Stats**: Modify attributes like health, speed, or attack power (e.g., +10% attack power).
- **Visuals**: Alter appearance, such as color or particle effects (e.g., blue to red particles).
- **Behaviors**: Change actions or reactions (e.g., increased aggression or defensive tendencies).

## Why This Matters
Mapping out mutation evolution paths is essential for:
- **Long-Term Design**: Enabling planned creature growth and strategic depth.
- **Balance**: Ensuring mutations remain fair and not overpowered.
- **Player Engagement**: Offering meaningful progression and replayability.

This document establishes a clear, modular framework for mutation evolution, enhancing the dynamic creature development system in Bitcoin Protozoa.
