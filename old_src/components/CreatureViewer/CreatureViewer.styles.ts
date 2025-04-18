/**
 * CreatureViewer Styles
 */

import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const ViewerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  backgroundColor: '#000',
  '&:fullscreen': {
    width: '100vw !important',
    height: '100vh !important',
  }
}));

export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  minHeight: 300,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

export const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  minHeight: 300,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
}));

export const ControlsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
}));

export const InfoOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  color: theme.palette.common.white,
}));
