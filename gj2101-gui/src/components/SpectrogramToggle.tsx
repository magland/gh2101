import { Box, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface SpectrogramToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

const SpectrogramToggle: React.FC<SpectrogramToggleProps> = ({
  isVisible,
  onToggle
}) => {
  return (
    <Box>
      <IconButton onClick={onToggle} size="small">
        {isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
      </IconButton>
    </Box>
  );
};

export default SpectrogramToggle;
