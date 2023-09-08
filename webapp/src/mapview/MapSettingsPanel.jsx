import React from 'react';
import {
    Box,
    Button,
    Slider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import "../style/Toolbar.css"

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const MapSettingsPanel = () => {
    return (
        <Stack sx={{ backgroundColor: "rgba(0,0,0,0.9)", width: "250px", height: "calc(100vh - 70px)", pt: 1, px: 2, alignItems: "left" }}>
            <Typography sx={{ fontSize: 35, textAlign: "left", userSelect: "none" }}> Map Settings </Typography> 
            <Button className="settings-dropdown" disableRipple
                endIcon={<KeyboardArrowDownIcon />} onClick={(e) => {}}>
                <Typography sx={{ color: "white", fontSize: 25, userSelect: "none" }}> Preset: Custom </Typography>
            </Button>

            <Stack>
                <Stack direction="row" className="settings-text-field">
                    <Typography> Width: </Typography>
                    <TextField size="small"
                        value={50} onChange={(e) => { }} />
                </Stack>
                <Slider className="settings-slider" value={50} name="Floor Coverage" min={5} max={200}/>
            </Stack>
            <Stack>
                <Stack direction="row" className="settings-text-field">
                    <Typography> Height: </Typography>
                    <TextField size="small"
                       value={130} onChange={(e) => { }} />
                </Stack>
                <Slider className="settings-slider" value={130} name="Floor Coverage" min={5} max={200}/>
            </Stack>
            <Stack>
                <Stack direction="row" className="settings-text-field">
                    <Typography> Room Size: </Typography>
                    <TextField size="small"
                       value={7} onChange={(e) => { }} />
                </Stack>
                <Slider className="settings-slider" value={7} name="Floor Coverage" min={6} max={15}/>
            </Stack>
            <Stack>
                <Stack direction="row" className="settings-text-field">
                    <Typography> Room Density: </Typography>
                    <TextField size="small"
                       value={50} onChange={(e) => { }} />
                </Stack>
                <Slider className="settings-slider" value={50} name="Floor Coverage" min={0} max={100}/>
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            <Button disableRipple className="settings-button" sx={{ backgroundColor: "white", mb: 1, "&:hover": { backgroundColor: "#9B55C6" } }}> Load File </Button>
            <Button disableRipple className="settings-button" sx={{ backgroundColor: "#4C9553", mb: 2.5, color: "white", "&:hover": { backgroundColor: "#9B55C6" } }}> Generate </Button>
        </Stack>
    );
}

export default MapSettingsPanel;
