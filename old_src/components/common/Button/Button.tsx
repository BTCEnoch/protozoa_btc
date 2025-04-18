/**
 * Button Component
 * 
 * Custom button component with various styles and states.
 */

import React from 'react';
import { styled } from '@mui/material/styles';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

/**
 * Button Props
 */
interface ButtonProps extends MuiButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Button component
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  ...props
}) => {
  // Map custom variants to MUI variants
  const getMuiVariant = (): MuiButtonProps['variant'] => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };
  
  return (
    <StyledButton
      variant={getMuiVariant()}
      size={size}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

// Styled components
const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 600,
}));

export default Button;
