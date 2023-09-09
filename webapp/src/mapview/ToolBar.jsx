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
import DungeonBuilder from '@cozy-caves/dungeon-generation';

export default function ToolBar(props) {
    const {
        zoom,
        dungeon,
        mapSettings,
        setMapSettings,
        setDungeon,
        stageRef
    } = props;

    const [open, setOpen] = React.useState(true);

    React.useEffect(() => {
        requestAnimationFrame(() => {
            let viewport = stageRef.current.mountNode.containerInfo.children[0];
            if (!viewport) return;
            viewport.fitHeight(viewport.maxY, true, true, true);
            viewport.moveCenter(viewport.worldScreenWidth * 2, viewport.maxY/2);
            viewport.animate({position: { x: viewport.maxX/2, y: viewport.maxY/2}, time: 500});
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dungeon]);

    const regenerateMap = () => {
        let viewport = stageRef.current.mountNode.containerInfo.children[0];

        function requestNewMap() {
            let newSeed = Math.random();
            let dungeonBuilder = new DungeonBuilder();
            let dungeon;
            if(mapSettings.preset !== "Custom") dungeon = dungeonBuilder.setPreset(mapSettings.preset).build();
            else {
                dungeon = dungeonBuilder
                    .setSeed(newSeed)
                    .setSize(Number(mapSettings.width), Number(mapSettings.height))
                    .setMinRoomSize(Number(mapSettings.roomSize))
                    .setTotalCoverage(Number(mapSettings.totalCoverage))
                    .build();
            }
            setDungeon(dungeon);

            setMapSettings(prev => ({...prev, seed: newSeed}));
        }

        viewport.animate({position: { x: -viewport.worldScreenWidth * 2, y: viewport.center.y}, time: 500, callbackOnComplete: requestNewMap});
    }
    
    const printMap = () => {
        let viewport = stageRef.current.mountNode.containerInfo.children[0];
        if (!viewport) return;
        if(viewport.maxX >= viewport.worldScreenWidth) viewport.fitWidth(viewport.maxX*1.01, true, true, true);
        else viewport.fitHeight(viewport.maxY*1.02, true, true, true);
        viewport.moveCenter(viewport.maxX/2, viewport.maxY/2);
        setTimeout(function(){
            let canvasImage = stageRef.current.app.renderer.plugins.extract.image(stageRef.current.app.stage);
            const WinPrint = window.open('', '', "left=0,top=0,width="+window.innerWidth+",height="+window.innerHeight+",toolbar=0,scrollbars=0,status=0");
            canvasImage.then((img) => {
                WinPrint.document.write('<img src="'+img.src+'"/>');
                WinPrint.document.close();  
                WinPrint.focus();
                WinPrint.print();
                WinPrint.close();
            });
        }, 500);
    }



    const tools = {
        regenerate: { name: "Regenerate", icon: <LoopIcon />, method: regenerateMap },
        info: { name: "Info", icon: <InfoOutlinedIcon />, method: () => { } },
        settings: { name: "Settings", icon: <TuneOutlinedIcon />, method: () => { } },
        share: { name: "Share", icon: <ShareOutlinedIcon />, method: () => { } },
        download: { name: "Download", icon: <FileDownloadOutlinedIcon />, method: () => { } },
        print: { name: "Print", icon: <PrintOutlinedIcon />, method: printMap },
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
                                <Button className="toolbar-button" disableRipple onClick={tool.method}> {tool.icon} </Button>
                            </Tooltip>
                        ))}
                    </Stack>
                </Collapse>}
            </TransitionGroup>
        </Stack>
    </>);
}