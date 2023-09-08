import React from 'react';
import {
    Box,
    Button,
    Collapse,
    Stack,
    Tooltip,
} from "@mui/material";
import "../style/Toolbar.css"

import Hamburger from 'hamburger-react'
import { TransitionGroup } from 'react-transition-group';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LoopIcon from '@mui/icons-material/Loop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';

export default function ToolBar(props) {
    const {
        zoom,
        mapSettings
    } = props;

    const [open, setOpen] = React.useState(true);
    const tools = {
        regenerate: { name: "Regenerate", icon: <LoopIcon />, method: () => { } },
        info: { name: "Info", icon: <InfoOutlinedIcon />, method: () => { } },
        settings: { name: "Settings", icon: <TuneOutlinedIcon />, method: () => { } },
        share: { name: "Share", icon: <ShareOutlinedIcon />, method: () => { } },
        download: { name: "Download", icon: <FileDownloadOutlinedIcon />, method: () => { } },
        print: { name: "Print", icon: <PrintOutlinedIcon />, method: () => { } },
    }

    return (<>
        <Box id="toolbar-toggle"> <Hamburger size={25} toggled={open} toggle={setOpen} direction="right" /> </Box>
        <Stack direction="row" sx={{ position: 'absolute', top: '70px ', right: '0', height: "100vh" }}>
            <TransitionGroup component={null} >
                <Collapse direction="left" sx={{ position: "relative"}}>
                    <RemoveIcon className="zoom-button" sx={{ right: "60px !important" }} onClick={() => zoom(2/3)} />
                    <AddIcon className="zoom-button" onClick={() => zoom(1.5)} />   
                </Collapse>

                {open && <Collapse orientation='horizontal'>
                    <Stack className="toolbar">
                        {Object.values(tools).map((tool) => (
                            <Tooltip key={tool.name} title={tool.name} placement="left" className="toolbar-tooltip">
                                <Button className="toolbar-button" disableRipple >
                                    {tool.icon}
                                </Button>
                            </Tooltip>
                        ))}
                    </Stack>
                </Collapse>}
            </TransitionGroup>
        </Stack>
    </>);
}