import { Box, Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";

interface ActiveLocationsSelectorProps {
  activeLocations: Record<string, boolean>;
  toggleLocation: (location: string) => void;
  isToggleDisabled: boolean;
  locations: string[];
}

export function ActiveLocationsSelector({
  activeLocations,
  toggleLocation,
  isToggleDisabled,
  locations,
}: ActiveLocationsSelectorProps) {
  return (
    <Box sx={{ p: 1, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center" }}>
      <Stack direction="row" spacing={1}>
        {locations.map((location) => (
          <FormControlLabel
            key={location}
            control={
              <Checkbox
                checked={activeLocations[location] || false}
                onChange={() => toggleLocation(location)}
                disabled={isToggleDisabled}
                size="small"
              />
            }
            label={location}
            sx={{ mr: 0 }}
          />
        ))}
      </Stack>
    </Box>
  );
}

export default ActiveLocationsSelector;
