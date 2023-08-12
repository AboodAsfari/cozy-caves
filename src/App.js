import { 
  AppBar,
  ThemeProvider, 
  Toolbar,
  Stack,
  Box,
  Typography,
} from "@mui/material";

import defaultTheme from "./themes/DarkTheme";
import Homepage from "./Homepage";


function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <AppBar position="fixed" component="nav">
        <Toolbar>
          <Stack direction={"row"} sx={{ position: "fixed" }}>
            <Box sx={{ ml: 2, mt: 0 }}>
              <Typography variant="h6" component="div" style={{fontFamily: "frijole"}}>
                  Cozy Caves: Map Generator
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 8.5 }}>
        <Homepage />
      </Box>

    </ThemeProvider>
  );
}

export default App;
