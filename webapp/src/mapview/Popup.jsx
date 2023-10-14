import React from 'react';
import { Typography, Stack, Modal, Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

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

const Popup = (props) => {
	const {
		prop,
		onClose
	} = props;

	const [propInfo, setPropInfo] = React.useState(null);
	const [selectedItem, setSelectedItem] = React.useState(null);

	const getPropRarity = () => !propInfo ? "" : (propInfo.rarity || "").charAt(0).toUpperCase() + (propInfo.rarity || "").slice(1);
	const getSelectedItemRarity = () => !selectedItem ? "" : (selectedItem.rarity || "").charAt(0).toUpperCase() + (selectedItem.rarity || "").slice(1);

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
				<Stack direction="row" sx={{ height: "100%", alignItems: "center", justifyContent: "center" }} >
					<Stack direction="row" spacing={3} sx={{ height: "40%" }} >
						<Stack sx={{ position: "relative", width: "450px", height: "70%", backgroundColor: "black", pointerEvents: "all", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16))", p: "10px", alignItems: "left" }}>
							<CloseIcon sx={{ position: "absolute", top: "10px", right: "10px", "&:hover": { color: "#4C9553", cursor: "pointer" } }} onClick={handleClose} />
							<Stack direction="row">
								<Typography sx={{ fontSize: 35, textAlign: "left" }}> {propInfo && propInfo.name} </Typography>
							</Stack>
							<Typography sx={{ fontSize: 20, textAlign: "left", mt: -1, color: getRarityColor(getPropRarity()), mb: 2 }}> {getPropRarity()} </Typography>
							<Typography sx={{ fontSize: 20, textAlign: "left" }}> {propInfo && propInfo.desc} </Typography>

							{propInfo && propInfo.getItems().length > 0 && <>
								<Typography sx={{ fontSize: 30, textAlign: "left", mt: 2 }}> Contains: </Typography>
								<Stack direction="row">
									{propInfo.getItems().map((item, i) => (
										<img
										key={item.name + i}
										src={itemCategoryIcons[item.category]}
										alt={item.name}
										style={{
										  width: "35px",
										  height: "35px",
										  marginRight: "8px",
										  border: item === selectedItem ? "2px solid #4C9553" : "2px solid transparent",
										  borderRadius: "50%",
										  padding: "2px",
										  cursor: "pointer",
										}}
										onClick={() => setSelectedItem(item)}
									  />
									))}
								</Stack>
							</>}
						</Stack>

						{ selectedItem && (
							<Stack sx={{ minWidth: "290px", height: "100%", backgroundColor: "black", pointerEvents: "all", backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.16))", p: "10px", alignItems: "left" }}>
								<Stack direction="row">
									<Typography sx={{ fontSize: 35, textAlign: "left" }}> { selectedItem.name } </Typography>
									<img
										src={itemCategoryIcons[selectedItem.category]}
										alt={selectedItem.name}
										style={{ width: "35px", height: "35px", marginLeft: "8px", marginTop: "5px" }}
									/>
								</Stack>
								<Typography sx={{ fontSize: 20, textAlign: "left", mt: -1, color: getRarityColor(getSelectedItemRarity()), mb: 2 }}> {getSelectedItemRarity()} </Typography>
								<Typography sx={{ minWidth: "100%", width: 0, fontSize: 20, textAlign: "left" }}> {selectedItem.desc} </Typography>
								<Typography sx={{ minWidth: "100%", width: 0, fontSize: 20, textAlign: "left", mt: 2 }}> {selectedItem.properties} </Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Box>
		</Modal>
	</> );
};

export default Popup;
