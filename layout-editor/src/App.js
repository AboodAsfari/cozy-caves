import { 
  AppBar,
  ThemeProvider, 
  Toolbar,
  Stack,
  Box,
  Typography,
} from "@mui/material";

const App = () => {
  return (
    <>
    <AppBar position="sticky" component="nav">
      <Toolbar>
        <Stack direction={"row"}>
          <Typography variant="h6" component="div">
            Ignore this :) for now
          </Typography>
        </Stack>
      </Toolbar>
    </AppBar>

    <Box >
      <Typography> hi </Typography>
    </Box>
    </>
  );
}

export default App;
