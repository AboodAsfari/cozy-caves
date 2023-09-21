import React from 'react';
import { Typography, Dialog, Stack, DialogContent, Modal, Box } from "@mui/material";

import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import CloseIcon from '@mui/icons-material/Close';

const Popup = (props) => {
	const {
		prop,
		onClose
	} = props;

	const [propInfo, setPropInfo] = React.useState(null);
	const [selectedItem, setSelectedItem] = React.useState(null);

	const getPropRarity = () => !propInfo ? "" : propInfo.rarity.charAt(0).toUpperCase() + propInfo.rarity.slice(1);

	React.useEffect(() => {
		if (prop) {
			setPropInfo(prop);
			if (prop.getItems().length > 0) setSelectedItem(prop.getItems()[0]);
		}
	}, [prop]);

	const handleClose = () => {
		onClose();
		setSelectedItem(null);
		setPropInfo(null)
	}

	return ( <>
		<Modal open={!!prop} onClose={handleClose}>
			<Box sx={{ width: "100%", height: "100%", pointerEvents: "none" }}>
				<Stack direction="row" sx={{ height: "100%", alignItems: "center", justifyContent: "center" }} spacing={3} >
					<Stack sx={{ position: "relative", width: "450px", height: "30%", backgroundColor: "black", pointerEvents: "all", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16))", p: "10px", alignItems: "left" }}>
						<CloseIcon sx={{ position: "absolute", top: "10px", right: "10px", "&:hover": { color: "#4C9553", cursor: "pointer" } }} onClick={handleClose} />
						<Stack direction="row">
							<Typography sx={{ fontSize: 35, textAlign: "left" }}> {propInfo && propInfo.name} </Typography>
							<InsertEmoticonIcon sx={{ mt: 0.8, ml: 1, fontSize: 35 }} />
						</Stack>
						<Typography sx={{ fontSize: 20, textAlign: "left", mt: -1, color: "grey", mb: 2 }}> {getPropRarity()} </Typography>
						<Typography sx={{ fontSize: 20, textAlign: "left" }}> {propInfo && propInfo.desc} </Typography>

						{propInfo && propInfo.getItems().length > 0 && <>
							<Typography sx={{ fontSize: 30, textAlign: "left", mt: 2 }}> Contains: </Typography>
							<Stack direction="row">
								{propInfo.getItems().map((item, i) => <InsertEmoticonIcon key={item.name + i} onClick={() => setSelectedItem(item)}
									sx={{ color: item === selectedItem ? "#4C9553" : "white", fontSize: 35, "&:hover": { color: "#4C9553", cursor: "pointer" } }} />)}
							</Stack>
						</>}
					</Stack>

					{ propInfo && propInfo.getItems().length > 0 &&
						<Stack sx={{ minWidth: "290px", height: "30%", backgroundColor: "black", pointerEvents: "all", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16))", p: "10px", alignItems: "left" }}>
							<Stack direction="row">
								<Typography sx={{ fontSize: 35, textAlign: "left" }}> { selectedItem.name } </Typography>
								<InsertEmoticonIcon sx={{ mt: 0.8, ml: 1, fontSize: 35 }} />
							</Stack>
							<Typography sx={{ fontSize: 20, textAlign: "left", mt: -1, color: "grey", mb: 2 }}> {getPropRarity()} </Typography>
							<Typography sx={{ minWidth: "100%", width: 0, fontSize: 20, textAlign: "left" }}> {propInfo && propInfo.desc} </Typography>
						</Stack>
					}
				</Stack>
			</Box>
		</Modal>
	</> );
};

export default Popup;
