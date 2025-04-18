/**
 * EvolutionTracker Component
 *
 * Tracks and displays creature evolution based on confirmations.
 */

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { useEvolution } from '../../hooks/useEvolution';
import { useBitcoinData } from '../../hooks/useBitcoinData';

/**
 * EvolutionTracker Props
 */
interface EvolutionTrackerProps {
  creatureId: string;
  showHistory?: boolean;
}

/**
 * EvolutionTracker component
 */
const EvolutionTracker: React.FC<EvolutionTrackerProps> = ({
  creatureId,
  showHistory = false
}) => {
  // Hooks
  const { blockData } = useBitcoinData();
  const { evolutionHistory, nextMilestone, mutationChance } = useEvolution(creatureId);

  // Calculate progress to next milestone
  const calculateProgress = () => {
    if (!blockData || !nextMilestone) return 0;

    const confirmations = blockData.confirmations || 0;
    const previousMilestone = getPreviousMilestone(confirmations);

    if (previousMilestone === 0) {
      return (confirmations / nextMilestone) * 100;
    }

    return ((confirmations - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
  };

  // Get previous milestone
  const getPreviousMilestone = (confirmations: number) => {
    const milestones = [0, 10000, 50000, 100000, 250000, 500000, 1000000];
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (confirmations >= milestones[i]) {
        return milestones[i];
      }
    }
    return 0;
  };

  // Format confirmations
  const formatConfirmations = (confirmations: number) => {
    if (confirmations >= 1000000) {
      return `${(confirmations / 1000000).toFixed(1)}M`;
    }
    if (confirmations >= 1000) {
      return `${(confirmations / 1000).toFixed(1)}K`;
    }
    return confirmations.toString();
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        Evolution Tracker
      </Typography>

      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2">
            Confirmations: {blockData?.confirmations ? formatConfirmations(blockData.confirmations) : 'Unknown'}
          </Typography>
          <Typography variant="body2">
            Next Milestone: {nextMilestone ? formatConfirmations(nextMilestone) : 'Unknown'}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={calculateProgress()}
          sx={{ height: 10, borderRadius: 5 }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="body2">
            Mutation Chance: {mutationChance ? `${(mutationChance * 100).toFixed(1)}%` : 'Unknown'}
          </Typography>
        </Box>
      </Box>

      {showHistory && evolutionHistory && evolutionHistory.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Evolution History
          </Typography>

          {evolutionHistory.map((event, index) => (
            <HistoryItem key={index}>
              <Typography variant="body2">
                {event.confirmations} confirmations: {event.description}
              </Typography>
              <Chip
                label={event.mutationType}
                size="small"
                color={event.rarity === 'LEGENDARY' ? 'secondary' : 'primary'}
                variant={event.rarity === 'MYTHIC' ? 'filled' : 'outlined'}
              />
            </HistoryItem>
          ))}
        </Box>
      )}
    </Container>
  );
};

// Styled components
const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const HistoryItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

export default EvolutionTracker;
