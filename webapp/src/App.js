import { 
  AppBar,
  ThemeProvider, 
  Toolbar,
  Stack,
  Box,
  Typography,
} from "@mui/material";

import defaultTheme from "./themes/DarkTheme";
import Homepage from "./home/Homepage";
import MapPage from "./mapview/MapPage";




function App() {

  const getPage = () => {
    return <MapPage />;
  }

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

      <Box >
        {getPage()}
      </Box>

    </ThemeProvider>
  );
}

export default App;
