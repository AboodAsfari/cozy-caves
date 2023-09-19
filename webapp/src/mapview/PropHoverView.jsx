import React, { useState } from 'react';
import { Box, Typography, Stack, Fade } from '@mui/material';

import Triangle from '@mui/icons-material/PlayArrow';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';

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
        if (mouseY < document.body.clientHeight / 2) setRenderingAbove(false);
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

    return (
        <Fade in={ !!prop && !menuOpen } direction="right">
            <Box> { propInfo && 
                <Stack direction={renderingAbove ? "column-reverse" : "column"} sx={{ position: "absolute", top: getTopPosition(), left: mouseX - viewWidth / 2 - 10, pointerEvents: "none", alignItems: "center" }}>
                    <Triangle sx={{ fontSize: arrowSize, color: "black", transform: renderingAbove ? "rotate(90deg)" : "rotate(-90deg)", my: -2.5 }} />
                    <Stack sx={{backgroundColor: "black", width: viewWidth, height: viewHeight, p: "10px", alignItems: "left" }}>
                        <Stack direction="row">
                            <Typography sx={{ fontSize: 25, textAlign: "left", flexGrow: 1 }}> { propInfo.name } </Typography>
                            <InsertEmoticonIcon sx={{ mt: 0.5 }}/>
                        </Stack>
                        <Typography sx={{ fontSize: 15, textAlign: "left", mt: -1, color: "grey", mb: 2 }}> { getPropRarity() } </Typography>
                        <Typography sx={{ fontSize: 15, textAlign: "left" }}> { propInfo.desc } </Typography>

                        { propInfo.getItems().length > 0 && <>
                            <Typography sx={{ fontSize: 20, textAlign: "left", mt: 2 }}> Contains: </Typography>
                            <Stack direction="row">
                                { propInfo.getItems().map((item, i) => <InsertEmoticonIcon key={item.name + i} /> ) }
                            </Stack>
                        </> }
                    </Stack>
                </Stack>
            } </Box>
        </Fade>
    );
};

export default PropHoverView;
