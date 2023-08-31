import {
    Box,
    Typography,
} from "@mui/material";
import "./styles/GridTile.css";
import Tools from "./Tools";
import { Point } from "@cozy-caves/utils";
import PenAction from "./actions/penAction";
import SelectAction from "./actions/selectAction";

import iconMap from "./PartitionIcons";

const Tile = require("@cozy-caves/room-generation").Tile;

const GridTile = (props) => {
    const {
        pos,
        currTool,
        setCurrTool,
        layout,
        mouseInfo,
        setMouseInfo,
        brushInfo,
        setBrushInfo,
        gridSize,
        tileMap,
        setTileMap,
        isInSelection,
        getOverlayMap,
        undoStack,
        redoStack,
        partitionAssigner,
        setPartitionAssigner,
        setCurrPartition
    } = props;

    const getOutlineClasses = () => {
        let extraClasses = "";
        if (currTool === Tools.PICKER) extraClasses += " ColorPickable";
        if (currTool === Tools.ERASER) extraClasses += " Erasable";
        if (currTool === Tools.FILL) extraClasses += " Fillable";
        if (currTool === Tools.SELECTOR && isInSelection(pos)) {
            extraClasses += " SelectedTileOutline";
            if (mouseInfo.dragButton === -1 || mouseInfo.selectDragStart.toString() !== "-1,-1") extraClasses += " Draggable";
        }
        return extraClasses;
    }

    const getTileClasses = () => {
        let extraClasses = "";
        let overlayValue = getOverlayMap()[pos.toString()];
        if ((overlayValue !== null) && (!!tileMap[pos] || overlayValue !== undefined)) extraClasses += " FilledTile";
        if (currTool === Tools.SELECTOR && isInSelection(pos)) extraClasses += " SelectedTile";
        return extraClasses;
    }

    const getLabel = () => {
        let overlayValue = getOverlayMap()[pos.toString()];
        if (overlayValue === null || (overlayValue === undefined && !tileMap[pos.toString()])) return "";

        let tileType;
        if (overlayValue !== undefined) tileType = overlayValue.getTileType();
        else tileType = tileMap[pos.toString()].getTileType();
        return tileType === "wall" ? "W" : "F";
    }

    const getPartitionIcon = () => {
        let overlayValue = getOverlayMap()[pos.toString()];
        if (overlayValue === null || (overlayValue === undefined && !tileMap[pos.toString()])) return null;

        let tile;
        if (overlayValue !== undefined) tile = overlayValue;
        else tile = tileMap[pos.toString()];

        let partitionInfo = layout.getPartitionDisplayInfo()[tile.getPartitionNum() + 2];
        return <Box sx={{ position: "absolute", fontSize: 20, color: partitionInfo.color, top: 1, right: 1 }}> {iconMap[partitionInfo.icon]} </Box>
    }

    const handleMouseOver = (e) => {
        let syntheticEvent = { ...e, button: mouseInfo.dragButton, synthetic: true };
        if (mouseInfo.dragButton !== -1) handleMouseDown(syntheticEvent);
    }

    const handlePen = (e) => {
        if (e.button !== 0) return;

        let lastAction = undoStack[undoStack.length - 1];
        let swappedBrushes = !lastAction ? false : (lastAction.isPrimary && e.altKey) || (!lastAction.isPrimary && !e.altKey);
        if (mouseInfo.dragButton === -1 || swappedBrushes) {
            undoStack.push(new PenAction(!e.altKey, Tools.PEN));
            redoStack.splice(0, redoStack.length);
        } else if (undoStack[undoStack.length - 1].encounteredPos.includes(pos.toString())) return;

        undoStack[undoStack.length - 1].oldTiles.push({ pos, tile: tileMap[pos.toString()] });
        undoStack[undoStack.length - 1].encounteredPos.push(pos.toString());

        if ((!e.altKey && brushInfo.primaryBrush === "none") || (e.altKey && brushInfo.secondaryBrush === "none")) {
            layout.removeTile(pos);
            setTileMap(prev => ({ ...prev, [pos.toString()]: undefined }));
            undoStack[undoStack.length - 1].newTiles.push({ pos, tile: undefined });
            setMouseInfo(prev => ({ ...prev, dragButton: e.button }));
            return;
        };
        let newTileType = !e.altKey ? brushInfo.primaryBrush : brushInfo.secondaryBrush;
        let newTile = new Tile(newTileType, pos, brushInfo.defaultPartition);
        layout.addTile(newTile);
        setTileMap(prev => ({ ...prev, [pos.toString()]: newTile }));
        undoStack[undoStack.length - 1].newTiles.push({ pos, tile: newTile });
    }

    const handleEraser = (e) => {
        if (mouseInfo.dragButton === -1) {
            undoStack.push(new PenAction(false, Tools.ERASER));
            redoStack.splice(0, redoStack.length);
        } else if (undoStack[undoStack.length - 1].encounteredPos.includes(pos.toString())) return;

        undoStack[undoStack.length - 1].oldTiles.push({ pos, tile: tileMap[pos.toString()] });
        undoStack[undoStack.length - 1].newTiles.push({ pos, tile: undefined });
        undoStack[undoStack.length - 1].encounteredPos.push(pos.toString());

        layout.removeTile(pos);
        setTileMap(prev => ({ ...prev, [pos.toString()]: undefined }));
    }

    const handleSelector = (e) => {
        if (e.button !== 0) return;
        if (isInSelection(pos) && mouseInfo.dragButton === -1) {
            setMouseInfo(prev => ({
                ...prev,
                selectDragStart: pos,
                selectDragEnd: pos
            }));
        } else if (mouseInfo.dragButton !== -1 && mouseInfo.selectDragStart.toString() !== new Point(-1, -1).toString()) {
            setMouseInfo(prev => ({ ...prev, selectDragEnd: pos }));
        } else {
            if (mouseInfo.dragButton === -1) {
                undoStack.push(new SelectAction(mouseInfo.selectStart, mouseInfo.selectEnd));
                redoStack.splice(0, redoStack.length);
                setMouseInfo(prev => ({
                    ...prev,
                    selectStart: pos,
                    selectDragStart: new Point(-1, -1),
                    selectDragEnd: new Point(-1, -1)
                }));
            }

            setMouseInfo(prev => ({ ...prev, selectEnd: pos }));
        }
    }

    const handlePicker = (e) => {
        let tileType = !!tileMap[pos.toString()] ? tileMap[pos.toString()].getTileType() : "none";
        if (e.button === 0) {
            if (!e.altKey) setBrushInfo(prev => ({ ...prev, primaryBrush: tileType }));
            else setBrushInfo(prev => ({ ...prev, secondaryBrush: tileType }));
            setCurrTool(Tools.PEN);
        } else if (e.button === 1 && tileType !== "none") {
            let partitionNum = tileMap[pos.toString()].getPartitionNum();
            setBrushInfo(prev => ({ ...prev, defaultPartition: partitionNum }));
            setCurrPartition(partitionNum);
            if (e.altKey) setCurrTool(Tools.FILL);
            else setCurrTool(Tools.PEN)

        } else if (e.button === 2) {
            setBrushInfo(prev => ({ ...prev, fillBrush: tileType }));
            setCurrTool(Tools.FILL);
        }
    }

    const handleFill = (e) => {
        if (e.synthetic) return;

        undoStack.push(new PenAction(false, Tools.FILL));
        redoStack.splice(0, redoStack.length);

        let typeToFill = !!tileMap[pos.toString()] ? tileMap[pos.toString()].getTileType() : "none";
        let partitionToFill = !!tileMap[pos.toString()] ? tileMap[pos.toString()].getPartitionNum() : -1;
        let toFill = [pos];
        let added = [];
        while (toFill.length > 0) {
            let curr = toFill.pop(0);
            added.push(curr.toString());

            let oldTile = typeToFill === "none" ? undefined : tileMap[curr.toString()];
            undoStack[undoStack.length - 1].oldTiles.push({ pos: curr, tile: oldTile });

            let newTile = new Tile(brushInfo.fillBrush, curr, brushInfo.defaultPartition);
            if (brushInfo.fillBrush === "none") {
                layout.removeTile(curr);
                setTileMap(prev => ({ ...prev, [curr.toString()]: undefined }));
                undoStack[undoStack.length - 1].newTiles.push({ pos: curr, tile: undefined });
            } else {
                layout.addTile(newTile);
                setTileMap(prev => ({ ...prev, [curr.toString()]: newTile }));
                undoStack[undoStack.length - 1].newTiles.push({ pos: curr, tile: newTile });
            }

            let directions = [new Point(-1, 0), new Point(1, 0), new Point(0, -1), new Point(0, 1)];
            for (let dir of directions) {
                let newPos = curr.add(dir);
                if (newPos.getX() < 0 || newPos.getX() >= gridSize.getX() || newPos.getY() < 0 || newPos.getY() >= gridSize.getY()) continue;

                let skipPoint = false;
                for (let point of toFill) if (point.toString() === newPos.toString()) skipPoint = true;
                if (skipPoint) continue;

                let tile = tileMap[newPos.toString()];
                if (!added.includes(newPos.toString()) && ((typeToFill === "none" && !tile) || (!!tile && tile.getTileType() === typeToFill
                    && tile.getPartitionNum() == partitionToFill))) toFill.push(newPos);
            }
        }
    }

    const handleMouseDown = (e) => {
        if (partitionAssigner !== null) return;
        switch (currTool) {
            case Tools.PEN:
                handlePen(e);
                break;
            case Tools.ERASER:
                handleEraser(e);
                break;
            case Tools.SELECTOR:
                handleSelector(e);
                break;
            case Tools.PICKER:
                handlePicker(e);
                break;
            case Tools.FILL:
                handleFill(e);
                break;
            default:
                break;
        }

        setMouseInfo(prev => ({ ...prev, dragButton: e.button }));
    }

    const handleContextMenu = (e) => {
        e.preventDefault();
        let isDragging = (mouseInfo.selectDragStart.toString() !== "-1,-1" || mouseInfo.selectDragEnd.toString() !== "-1,-1");
        if (!tileMap[pos.toString()] || (currTool !== Tools.PEN && (currTool !== Tools.SELECTOR || isDragging))) return;
        setPartitionAssigner({ mouseX: e.clientX, mouseY: e.clientY, pos: pos });
    }

    return (
        <Box className={"GridTileOutline " + getOutlineClasses()} onMouseDown={handleMouseDown} onMouseOver={handleMouseOver}
            onDragStart={e => e.preventDefault()} onContextMenu={handleContextMenu} onMouseUp={() => setMouseInfo(prev => ({ ...prev, dragButton: -1 }))}>
            <Box className={"GridTile " + getTileClasses()} onContextMenu={(e) => e.preventDefault()}>
                <Typography sx={{ fontSize: 40, textAlign: "center", pointerEvents: "none", position: "absolute", zIndex: 1 }} >
                    {getLabel()}
                </Typography>
                {getPartitionIcon()}
            </Box>
        </Box>
    );
}

export default GridTile;
