import {
    Box,
    Typography
} from "@mui/material";

import iconMap from "./PartitionIcons";
import { Point } from "@cozy-caves/utils";
import Tools from "./Tools";

import PenAction from "./actions/penAction";
import SelectAction from "./actions/selectAction";

import "./styles/GridTile.css";

const Tile = require("@cozy-caves/room-generation").Tile;

const GridTile = (props) => {
    const {
        brushInfo,
        currTool,
        gridSize,
        getOverlayMap,
        isInSelection,
        layout,
        mouseInfo,
        partitionAssigner,
        pos,
        redoStack,
        setBrushInfo,
        setCurrPartition,
        setCurrTool,
        setFileEdited,
        setMouseInfo,
        setPartitionAssigner,
        setTileMap,
        tileMap,
        undoStack
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
        // return tileType === "wall" ? "W" : "F";
        return ""
    }

    const getPartitionIcon = () => {
        let overlayValue = getOverlayMap()[pos.toString()];
        if (overlayValue === null || (overlayValue === undefined && !tileMap[pos.toString()])) return null;

        let tile;
        if (overlayValue !== undefined) tile = overlayValue;
        else tile = tileMap[pos.toString()];

        let partitionInfo = layout.getPartitionDisplayInfo()[tile.getPartitionNum() + 2];
        return <Box sx={{ position: "absolute", fontSize: 20, color: partitionInfo.color, top: 5, right: 5 }}> {iconMap[partitionInfo.icon]} </Box>
    }

    const getTileImage = () => {
        let overlayValue = getOverlayMap()[pos.toString()];
        if (overlayValue === null || (overlayValue === undefined && !tileMap[pos.toString()])) return null;
        let tile = overlayValue === undefined ? tileMap[pos.toString()] : overlayValue;
        if (tile.getTileType() === "wall") {
            let rightNeighbor = getNeighbor(pos.add(new Point(1, 0)));
            let leftNeighbor = getNeighbor(pos.add(new Point(-1, 0)));
            let topNeighbor = getNeighbor(pos.add(new Point(0, -1)));
            let bottomNeighbor = getNeighbor(pos.add(new Point(0, 1)));
            let topRightNeighbor = getNeighbor(pos.add(new Point(1, -1)));
            let topLeftNeighbor = getNeighbor(pos.add(new Point(-1, -1)));
            let bottomRightNeighbor = getNeighbor(pos.add(new Point(1, 1)));
            let bottomLeftNeighbor = getNeighbor(pos.add(new Point(-1, 1)));

            if ((isWall(rightNeighbor) && isWall(topNeighbor) && isFloor(bottomLeftNeighbor)) || (isWall(rightNeighbor) && isWall(bottomNeighbor) && isFloor(topLeftNeighbor)) || 
                (isWall(leftNeighbor) && isWall(topNeighbor) && isFloor(bottomRightNeighbor)) || (isWall(leftNeighbor) && isWall(bottomNeighbor) && isFloor(topRightNeighbor))) return "./resources/tileSprites/OUTER_CORNER_WALL.png";
            if ((isWall(rightNeighbor) && isWall(topNeighbor)) || (isWall(rightNeighbor) && isWall(bottomNeighbor)) || 
                (isWall(leftNeighbor) && isWall(topNeighbor)) || (isWall(leftNeighbor) && isWall(bottomNeighbor))) return "./resources/tileSprites/CORNER_WALL.png";
            return "./resources/tileSprites/EDGE_WALL.png";
        }
        if (tile.getTileType() === "floor") return "./resources/tileSprites/FLOOR.png";
        return null;
    }

    const getImageTransform = () => {
        let overlayValue = getOverlayMap()[pos.toString()];
        if (overlayValue === null || (overlayValue === undefined && !tileMap[pos.toString()])) return "";
        let tile = overlayValue === undefined ? tileMap[pos.toString()] : overlayValue;
        if (tile.getTileType() === "floor") return "";

        if (tile.getTileType() === "wall") {
            let rightNeighbor = getNeighbor(pos.add(new Point(1, 0)));
            let leftNeighbor = getNeighbor(pos.add(new Point(-1, 0)));
            let topNeighbor = getNeighbor(pos.add(new Point(0, -1)));
            let bottomNeighbor = getNeighbor(pos.add(new Point(0, 1)));
            let topRightNeighbor = getNeighbor(pos.add(new Point(1, -1)));

            // if (isWall(rightNeighbor) && isWall(topNeighbor)) return "rotate(270deg)";
            // if (isWall(rightNeighbor) && isWall(bottomNeighbor)) return "";
            // if (isWall(leftNeighbor) && isWall(topNeighbor)) return "rotate(180deg)";
            if (isWall(leftNeighbor) && isWall(bottomNeighbor) && isFloor(topRightNeighbor)) return "rotate(90deg)";

            if (isWall(rightNeighbor) && isWall(topNeighbor)) return "rotate(270deg)";
            if (isWall(rightNeighbor) && isWall(bottomNeighbor)) return "";
            if (isWall(leftNeighbor) && isWall(topNeighbor)) return "rotate(180deg)";
            if (isWall(leftNeighbor) && isWall(bottomNeighbor)) return "rotate(90deg)";

            // EDGES HERE
            if (!rightNeighbor && !isWall(leftNeighbor)) return "rotate(180deg)";
            if (!leftNeighbor && !isWall(rightNeighbor)) return "";
            if (!topNeighbor && !isWall(bottomNeighbor)) return "rotate(90deg)";
            if (!isWall(topNeighbor)) return "rotate(-90deg)";

        }
        
        return "";
    }

    const getNeighbor = (neighborPos) => {
        let overlayValue = getOverlayMap()[neighborPos.toString()];
        if (overlayValue === null || (overlayValue === undefined && !tileMap[neighborPos.toString()])) return null;
        return overlayValue === undefined ? tileMap[neighborPos.toString()] : overlayValue;
    }

    const isWall = (tile) => tile && tile.getTileType() === "wall";
    const isFloor = (tile) => tile && tile.getTileType() === "floor";

    const handleMouseOver = (e) => {
        let syntheticEvent = { ...e, button: mouseInfo.dragButton, synthetic: true };
        if (mouseInfo.dragButton !== -1) handleMouseDown(syntheticEvent);
    }

    const handlePen = (e) => {
        if (e.button !== 0) return;

        setFileEdited(true);

        if (mouseInfo.dragButton === -1) {
            undoStack.push(new PenAction(!e.altKey, Tools.PEN));
            redoStack.splice(0, redoStack.length);
        } else if (undoStack[undoStack.length - 1].encounteredPos.includes(pos.toString())) return;

        let action = undoStack[undoStack.length - 1];
        action.oldTiles.push({ pos, tile: tileMap[pos.toString()] });
        action.encounteredPos.push(pos.toString());

        layout.removeTile(pos);
        if ((action.isPrimary && brushInfo.primaryBrush === "none") || (!action.isPrimary && brushInfo.secondaryBrush === "none")) {
            setTileMap(prev => ({ ...prev, [pos.toString()]: undefined }));
            action.newTiles.push({ pos, tile: undefined });
            setMouseInfo(prev => ({ ...prev, dragButton: e.button }));
            return;
        };
        let newTileType = action.isPrimary ? brushInfo.primaryBrush : brushInfo.secondaryBrush;
        let newTile = new Tile(newTileType, pos, brushInfo.defaultPartition);
        layout.addTile(newTile);
        setTileMap(prev => ({ ...prev, [pos.toString()]: newTile }));
        action.newTiles.push({ pos, tile: newTile });
    }

    const handleEraser = (e) => {
        setFileEdited(true);
        
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

        setFileEdited(true);

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
            layout.removeTile(curr);
            if (brushInfo.fillBrush === "none") {
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
                    && tile.getPartitionNum() === partitionToFill))) toFill.push(newPos);
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
                {getTileImage() && <img src={getTileImage()} alt="tile source" style={{ transform: getImageTransform() }} />}
                {getPartitionIcon()}
            </Box>
        </Box>
    );
}

export default GridTile;
