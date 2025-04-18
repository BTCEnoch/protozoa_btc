/**
 * BlockSelector Component
 *
 * Allows selection of Bitcoin blocks to generate creatures.
 * Follows the Bitcoin implementation rules and RNG requirements.
 */

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, TextField, Button, Typography, CircularProgress, Tooltip, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * BlockSelector Props
 */
interface BlockSelectorProps {
  onBlockSelect: (blockNumber: number) => void;
  initialBlock?: number;
  maxBlockHeight?: number; // Maximum allowed block height (defaults to current approximate height)
  loading?: boolean; // Whether the component is in a loading state
  onError?: (error: string) => void; // Callback for error handling
}

/**
 * BlockSelector component
 */
const BlockSelector: React.FC<BlockSelectorProps> = ({
  onBlockSelect,
  initialBlock = 0,
  maxBlockHeight = 800000, // Current approximate block height as of 2023
  loading = false,
  onError
}) => {
  // State
  const [blockNumber, setBlockNumber] = useState<string>(initialBlock.toString());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize with block 0 if no initial block is provided
  useEffect(() => {
    if (initialBlock === 0) {
      onBlockSelect(0);
    }
  }, [initialBlock, onBlockSelect]);

  // Handle block number input change
  const handleBlockNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if ((/^\d*$/).test(value)) {
      setBlockNumber(value);
      setError(null);
    }
  };

  // Handle block selection
  const handleSelectBlock = () => {
    if (!blockNumber) {
      const errorMsg = 'Please enter a block number';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    const blockNum = parseInt(blockNumber, 10);
    if (isNaN(blockNum)) {
      const errorMsg = 'Invalid block number';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // Validate block number against realistic ranges
    if (blockNum < 0) {
      const errorMsg = 'Block number must be non-negative';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    if (blockNum > maxBlockHeight) {
      const errorMsg = `Block number exceeds current height (${maxBlockHeight})`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // Set submitting state
    setIsSubmitting(true);

    // Call the onBlockSelect callback
    try {
      onBlockSelect(blockNum);
    } catch (err) {
      const errorMsg = `Error selecting block: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle key press (Enter)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSelectBlock();
    }
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        Select Bitcoin Block
      </Typography>

      <InputContainer>
        <TextField
          label="Block Number"
          variant="outlined"
          fullWidth
          value={blockNumber}
          onChange={handleBlockNumberChange}
          onKeyDown={handleKeyPress}
          error={!!error}
          helperText={error}
          disabled={loading || isSubmitting}
          aria-label="Bitcoin block number"
          aria-describedby="block-number-helper-text"
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={handleSelectBlock}
                size="small"
                disabled={loading || isSubmitting}
                aria-label="Select block"
              >
                <SearchIcon />
              </IconButton>
            )
          }}
        />

        <Tooltip title="Select this block">
          <span> {/* Wrapper needed for disabled button tooltip */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSelectBlock}
              disabled={loading || isSubmitting}
              sx={{ ml: 1 }}
              aria-label="Select Bitcoin block"
            >
              {loading || isSubmitting ? <CircularProgress size={24} /> : 'Select'}
            </Button>
          </span>
        </Tooltip>
      </InputContainer>
    </Container>
  );
};

// Styled components
const Container = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const InputContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}));

export default BlockSelector;

