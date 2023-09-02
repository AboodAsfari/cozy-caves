import React from "react";
import {
    AppBar,
    Box,
    Button,
    Collapse,
    Divider,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import BrushSelector from "./BrushSelector";
import ToolbarButton from "./ToolbarButton";
import { TransitionGroup } from 'react-transition-group';

import iconMap from "../PartitionIcons";
import Tools from "../Tools";

import "../styles/MenuBar.css";

import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const MenuBar = (props) => {
    const {
        brushInfo,
        currTool,
        handleNewPartition,
        layout,
        setBrushInfo,
        setCurrTool,
        updateActivePartition
    } = props;

    const [defaultPartitionAnchorEl, setDefaultPartitionAnchorEl] = React.useState(null);
    const [fileMenuAnchorEl, setFileMenuAnchorEl] = React.useState(null);

    const swapBrushes = () => {
        setBrushInfo(prev => ({
            ...prev,
            primaryBrush: prev.secondaryBrush,
            secondaryBrush: prev.primaryBrush
        }));
    }

    const setPrimaryBrush = (brush) => {
        setBrushInfo(prev => ({
            ...prev,
            primaryBrush: brush
        }));
    }

    const setSecondaryBrush = (brush) => {
        setBrushInfo(prev => ({
            ...prev,
            secondaryBrush: brush
        }));
    }

    const setFillBrush = (brush) => {
        setBrushInfo(prev => ({
            ...prev,
            fillBrush: brush
        }));
    }

    const getToolbarItems = () => {
        let ret = [];

        ret.push(<ToolbarButton key={0} iconName="stylus" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.PEN} />);
        if (currTool === Tools.PEN) {
            let primaryIcon = <BrushSelector key={0.1} size={20} brush={brushInfo.primaryBrush} setBrush={setPrimaryBrush} />;
            let secondaryIcon = <BrushSelector key={0.2} size={15} mr={2} brush={brushInfo.secondaryBrush} setBrush={setSecondaryBrush} />;
            let brushSwapper = <SwapHorizIcon key={0.3} className="ToolIcon" sx={{ fontSize: 30, mt: 0.5, mr: 1 }} onClick={swapBrushes} />

            ret.push(primaryIcon);
            ret.push(brushSwapper);
            ret.push(secondaryIcon);
        }

        ret.push(<ToolbarButton key={1} iconName="ink_eraser" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.ERASER} />);
        ret.push(<ToolbarButton key={2} iconName="arrow_selector_tool" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.SELECTOR} />);
        ret.push(<ToolbarButton key={3} iconName="colorize" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.PICKER} />);

        ret.push(<ToolbarButton key={4} iconName="colors" currTool={currTool} setCurrTool={setCurrTool} desiredTool={Tools.FILL} />);
        if (currTool === Tools.FILL) {
            let selector = <BrushSelector key={4.1} size={20} brush={brushInfo.fillBrush} setBrush={setFillBrush} />;
            ret.push(selector);
        }

        if (currTool === Tools.PEN || currTool === Tools.FILL) {
            ret.push(<Typography key={5} className="NavText" sx={{ textWrap: "nowrap" }}> Default Partition: </Typography>);
            ret.push(<>
                <Button key={6} className="NavButton" sx={{ textTransform: "none", textWrap: "nowrap" }} disableRipple
                    endIcon={<KeyboardArrowDownIcon />} onClick={(e) => setDefaultPartitionAnchorEl(e.currentTarget)}>
                    <Box sx={{ "& .icon": { color: layout.getPartitionDisplayInfo()[brushInfo.defaultPartition + 2].color, mr: 1, mt: 0.7 } }}> {iconMap[layout.getPartitionDisplayInfo()[brushInfo.defaultPartition + 2].icon]} </Box>
                    {layout.getPartitionDisplayInfo()[brushInfo.defaultPartition + 2].name}
                </Button>
                <Menu anchorEl={defaultPartitionAnchorEl} open={!!defaultPartitionAnchorEl} onClose={() => setDefaultPartitionAnchorEl(null)}
                    sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#7d7a7a" }, mt: 1 }}>
                    {layout.getPartitionDisplayInfo().map((info, i) =>
                        <MenuItem key={info.name + i} onClick={() => { updateActivePartition(i - 2); setBrushInfo(prev => ({ ...prev, defaultPartition: i - 2 })); setDefaultPartitionAnchorEl(null); }}
                            className="MenuItem" sx={{ minWidth: 140 }} disableRipple>
                            <Box sx={{ color: info.color, display: "flex", alignItems: "center", mt: 0.2 }}> {iconMap[info.icon]} </Box>
                            <Typography sx={{ ml: 1.2, mr: 2, mt: 0.5 }}> {info.name} </Typography>
                            {brushInfo.defaultPartition === i - 2 && <CheckIcon />}
                        </MenuItem>
                    )}
                    <MenuItem onClick={() => { handleNewPartition(); setDefaultPartitionAnchorEl(null); }} className="MenuItem" sx={{ minWidth: 140 }} disableRipple>
                        <AddIcon />
                        <Typography sx={{ ml: 1.2, mr: 2, mt: 0.5 }}> Create new partition </Typography>
                    </MenuItem>
                </Menu>
            </>);
        }

        return ret;
    }

    const handleOpen = () => {

    }

    const handleSave = () => {

    }

    const handleSaveAs = () => {
        setFileMenuAnchorEl(null);
        
        let options = {
            suggestedName: "layout.json",
            types: [
                {
                    description: "JSON",
                    accept: { "application/json": [".json"] }
                }
            ]
        };

        window.showSaveFilePicker(options).then((fileHandle) => {
            fileHandle.createWritable().then((file) => {
                file.write(JSON.stringify(layout.getSerializableLayout()));
                file.close();
            });
        }).catch(() => { });
    }

    return (
        <>
        <AppBar position="sticky" component="nav">
            <Toolbar className="Toolbar">
                <Stack direction={"row"} sx={{ alignItems: "center" }}>
                    <Button disableRipple className="NavButton" onClick={(e) => setFileMenuAnchorEl(e.currentTarget)}> File </Button>
                    <Button disableRipple className="NavButton"> View </Button>
                    <Divider variant="middle" sx={{ ml: 4, mr: 3.8, borderWidth: 1, borderColor: "white", height: "35px" }} />
                    <TransitionGroup style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        {getToolbarItems().map((item, i) =>
                            <Collapse orientation="horizontal" key={item.key}>
                                {item}
                            </Collapse>
                        )}
                    </TransitionGroup>
                </Stack>
            </Toolbar>
        </AppBar>

        <Menu anchorEl={fileMenuAnchorEl} open={!!fileMenuAnchorEl} onClose={() => setFileMenuAnchorEl(null)}
            sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#7d7a7a" }, mt: 1 }}>
            <MenuItem onClick={handleOpen} className="MenuItem" disableRipple>
                <Typography> Open </Typography>
            </MenuItem>
            <MenuItem onClick={handleSave} className="MenuItem" disableRipple>
                <Typography> Save </Typography>
                {/* sx={{ ml: 1.2, mr: 2, mt: 0.5 }} */}
            </MenuItem>
            <MenuItem onClick={handleSaveAs} className="MenuItem" disableRipple>
                <Typography> Save As </Typography>
            </MenuItem>
        </Menu>
        </>
    );
}

export default MenuBar;
