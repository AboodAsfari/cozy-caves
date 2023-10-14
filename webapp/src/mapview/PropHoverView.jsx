import React, { useState } from 'react';
import { Box, Typography, Stack, Fade } from '@mui/material';

import Triangle from '@mui/icons-material/PlayArrow';

// Mapping item categories to icons
const itemCategoryIcons = {
	"Potions and Elixirs": "resources/props/item_icons/potions-and-elixirs.png",
	"Scrolls": "resources/props/item_icons/scrolls.png",
	"Weapons and Armor": "resources/props/item_icons/weapons-and-armor.png",
	"Magical Items": "resources/props/item_icons/magical-items.png",
	"Traps and Tools": "resources/props/item_icons/traps-and-tools.png",
	"Treasure and Valuables": "resources/props/item_icons/treasure-and-valuables.png",
	"Key Items": "resources/props/item_icons/key-items.png",
	"Dungeoneering Supplies": "resources/props/item_icons/dungeoneering-supplies.png",
	"Cursed Items": "resources/props/item_icons/cursed-items.png",
	"Quest-related Items": "resources/props/item_icons/quest-related-items.png",
	"Epic and Legendary Items": "resources/props/item_icons/epic-and-legendary-items.png",
};

const PropHoverView = (props) => {
    const { 
        mouseX,
        mouseY,
        menuOpen,
        prop,
    } = props;

    const arrowSize = 50;
    const viewWidth = 200;
    const viewHeight = 250;

    const [renderingAbove, setRenderingAbove] = useState(true);
    const [propInfo, setPropInfo] = useState(null);

    React.useEffect(() => {
        if (mouseY - 70 <= viewHeight + arrowSize) setRenderingAbove(false);
        else setRenderingAbove(true);
    }, [mouseY]);

    React.useEffect(() => {
        if (prop) setPropInfo(prop);
    }, [prop]);

    const getTopPosition = () => {
        if (renderingAbove) return mouseY - viewHeight - arrowSize;
        else return mouseY + arrowSize;
    }

    const getPropRarity = () => propInfo.rarity.charAt(0).toUpperCase() + propInfo.rarity.slice(1);

    const getRarityColor = (rarity) => {
		if (!rarity) return "grey";
		switch (rarity) {
			case "Common": return "grey";
			case "Uncommon": return "#4C9553";
			case "Rare": return "#4b99cc";
			case "Epic": return "#9b59b6";
			case "Legendary": return "#ccbb4b";
			default: return "grey";
		}
	}

    return (
        <Fade in={ !!prop && !menuOpen } direction="right">
            <Box> { propInfo && 
                <Stack direction={renderingAbove ? "column-reverse" : "column"} sx={{ position: "absolute", top: getTopPosition(), left: mouseX - viewWidth / 2 - 10, pointerEvents: "none", alignItems: "center" }}>
                    <Triangle sx={{ fontSize: arrowSize, color: "black", transform: renderingAbove ? "rotate(90deg)" : "rotate(-90deg)", my: -2.5 }} />
                    <Stack sx={{backgroundColor: "black", width: viewWidth, height: viewHeight, p: "10px", alignItems: "left" }}>
                        <Stack direction="row">
                            <Typography sx={{ fontSize: 25, textAlign: "left", flexGrow: 1 }}> { propInfo.name } </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 15, textAlign: "left", mt: -1, color: getRarityColor(getPropRarity()), mb: 2 }}> { getPropRarity() } </Typography>
                        <Typography sx={{ fontSize: 15, textAlign: "left" }}> { propInfo.desc } </Typography>

                        { propInfo.getItems().length > 0 && <>
                            <Typography sx={{ fontSize: 20, textAlign: "left", mt: 2 }}> Contains: </Typography>
                            <Stack direction="row">
                                { propInfo.getItems().map((item, i) => (
                                    <img
                                    key={item.name + i}
                                    src={itemCategoryIcons[item.category]}
                                    alt={item.category}
                                    style={{ width: "35px", height: "35px", marginLeft: "5px" }}
                                    />
                                )) }
                            </Stack>
                        </> }
                    </Stack>
                </Stack>
            } </Box>
        </Fade>
    );
};

export default PropHoverView;
