/**
 * Loader Component
 * 
 * Loading indicator component.
 */

import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Loader Props
 */
interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

/**
 * Loader component
 */
const Loader: React.FC<LoaderProps> = ({
  size = 'medium',
  color,
  text
}) => {
  // Map size to pixel value
  const getSize = (): number => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 40;
      case 'large':
        return 56;
      default:
        return 40;
    }
  };
  
  return (
    <Container>
      <CircularProgress size={getSize()} color="primary" sx={{ color }} />
      {text && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {text}
        </Typography>
      )}
    </Container>
  );
};

// Styled components
const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

export default Loader;
