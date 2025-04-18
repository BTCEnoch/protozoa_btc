/**
 * Card Component
 * 
 * Card component for displaying content in a contained manner.
 */

import React from 'react';
import { styled } from '@mui/material/styles';
import { Card as MuiCard, CardContent, CardHeader, CardProps as MuiCardProps } from '@mui/material';

/**
 * Card Props
 */
interface CardProps extends MuiCardProps {
  title?: string;
  elevation?: number;
}

/**
 * Card component
 */
const Card: React.FC<CardProps> = ({
  title,
  elevation = 1,
  children,
  ...props
}) => {
  return (
    <StyledCard elevation={elevation} {...props}>
      {title && <CardHeader title={title} />}
      <CardContent>
        {children}
      </CardContent>
    </StyledCard>
  );
};

// Styled components
const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

export default Card;
