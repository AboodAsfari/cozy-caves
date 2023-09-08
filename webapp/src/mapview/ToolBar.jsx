import React from 'react';
import {
    Button,
    Collapse,
    Stack,
} from "@mui/material";
import "../style/Toolbar.css"

import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import LoopIcon from '@mui/icons-material/Loop';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';

export default function ToolBar() {
    const [open, setOpen] = React.useState(false);
    const tools = {
        regenerate: { name: "Regenerate", icon: <LoopIcon />, method: () => { } },
        info: { name: "Info", icon: <InfoOutlinedIcon />, method: () => { } },
        settings: { name: "Settings", icon: <TuneOutlinedIcon />, method: () => { } },
        share: { name: "Share", icon: <ShareOutlinedIcon />, method: () => { } },
        download: { name: "Download", icon: <FileDownloadOutlinedIcon />, method: () => { } },
        print: { name: "Print", icon: <PrintOutlinedIcon />, method: () => { } },
    }

    return (
        <div style={{ position: 'absolute', top: '90px', right: '25px' }}>
            <Button className="toolbar-toggle" disableRipple onClick={() => setOpen(!open)}>
                <ArrowDropDownOutlinedIcon className={open ? "toggle-icon open" : "toggle-icon"} />
            </Button>
            <Collapse in={open}>
                <Stack className="toolbar">
                    {Object.values(tools).map((tool) => (
                        <Button className="toolbar-button" disableRipple >
                            {tool.icon}
                        </Button>
                    ))}
                </Stack>
            </Collapse>
        </div>
    );
}