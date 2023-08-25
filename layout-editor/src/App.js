import { 
  AppBar,
  ThemeProvider, 
  Toolbar,
  Stack,
  Box,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import Test from "./Test";

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

    <Box sx={{ mt: 2.5 }}>
      {[...Array(8)].map((x, i) => 
        <Stack direction="row" key={i} sx={{ ml: 2, mt: "-4px" }} spacing="-4px">
          {[...Array(10)].map((x, i) => <Test key={i} /> )}
        </Stack>
      )}
    </Box>
    </>
  );
}

export default App;
