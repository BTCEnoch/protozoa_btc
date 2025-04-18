/**
 * TraitDisplay Component
 *
 * Displays creature traits and attributes.
 */

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCreature } from '../../hooks/useCreature';
import { Role, Rarity } from '../../types/core';

/**
 * TraitDisplay Props
 */
interface TraitDisplayProps {
  creatureId: string;
  showDetails?: boolean;
  filterByRole?: string;
}

/**
 * TraitDisplay component
 */
const TraitDisplay: React.FC<TraitDisplayProps> = ({
  creatureId,
  showDetails = true,
  filterByRole
}) => {
  // State
  const [activeTab, setActiveTab] = useState<number>(0);

  // Hooks
  const { creature } = useCreature(creatureId);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Get color for role
  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.CORE:
        return '#00FFFF'; // Cyan
      case Role.ATTACK:
        return '#FF0000'; // Red
      case Role.DEFENSE:
        return '#0000FF'; // Blue
      case Role.CONTROL:
        return '#800080'; // Purple
      case Role.MOVEMENT:
        return '#00FF00'; // Green
      default:
        return '#FFFFFF'; // White
    }
  };

  // Get color for rarity
  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON:
        return '#AAAAAA'; // Gray
      case Rarity.UNCOMMON:
        return '#00AA00'; // Green
      case Rarity.RARE:
        return '#0000AA'; // Blue
      case Rarity.EPIC:
        return '#AA00AA'; // Purple
      case Rarity.LEGENDARY:
        return '#AAAA00'; // Gold
      case Rarity.MYTHIC:
        return '#AA0000'; // Red
      default:
        return '#FFFFFF'; // White
    }
  };

  // If no creature, show loading
  if (!creature) {
    return (
      <Container>
        <Typography variant="body1">
          Loading creature traits...
        </Typography>
      </Container>
    );
  }

  // Filter traits by role if specified
  const filteredTraits = filterByRole
    ? creature.traits.filter(trait => trait.role === filterByRole)
    : creature.traits;

  // Group traits by category
  const traitsByCategory = filteredTraits.reduce((acc, trait) => {
    if (!acc[trait.category]) {
      acc[trait.category] = [];
    }
    acc[trait.category].push(trait);
    return acc;
  }, {} as Record<string, typeof filteredTraits>);

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        Creature Traits
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="All" />
        <Tab label="Visual" />
        <Tab label="Formation" />
        <Tab label="Behavior" />
        <Tab label="Ability" />
      </Tabs>

      {Object.entries(traitsByCategory).map(([category, traits]) => (
        <Accordion key={category} defaultExpanded={activeTab === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {category} Traits ({traits.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {traits.map((trait, index) => (
              <TraitItem key={trait.id || index}>
                <Box>
                  <Typography variant="subtitle2">
                    {trait.name}
                  </Typography>
                  {showDetails && (
                    <Typography variant="body2" color="textSecondary">
                      {trait.description}
                    </Typography>
                  )}
                </Box>
                <Box display="flex" gap={1}>
                  <Chip
                    label={trait.role}
                    size="small"
                    sx={{
                      backgroundColor: getRoleColor(trait.role),
                      color: '#000000'
                    }}
                  />
                  <Chip
                    label={trait.rarity}
                    size="small"
                    sx={{
                      backgroundColor: getRarityColor(trait.rarity),
                      color: '#FFFFFF'
                    }}
                  />
                </Box>
              </TraitItem>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

// Styled components
const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const TraitItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

export default TraitDisplay;
