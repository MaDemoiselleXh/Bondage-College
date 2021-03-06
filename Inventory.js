var PlayerInventory = [];
var PlayerInventoryName = 0;
var PlayerInventoryQuantity = 1;
var PlayerLockedInventory = [];
var PlayerSavedInventory = [];

// Set up the player clothes or costume
function PlayerClothes(NewCloth) {
	if ((NewCloth != "Clothed") && (NewCloth != "Underwear") && (NewCloth != "Naked")) Common_PlayerCostume = NewCloth;
	else Common_PlayerCostume = "";	
	Common_PlayerUnderwear = (NewCloth == "Underwear");
	Common_PlayerNaked = (NewCloth == "Naked");
	Common_PlayerClothed = (!Common_PlayerUnderwear && !Common_PlayerNaked);
}

// Set the restrained and gagged common variables, used by many scenes
function LoadRestrainStatus() {
	Common_PlayerRestrained = (PlayerHasLockedInventory("Cuffs") || PlayerHasLockedInventory("Rope"));
	Common_PlayerGagged = (PlayerHasLockedInventory("BallGag") || PlayerHasLockedInventory("TapeGag") || PlayerHasLockedInventory("ClothGag") || PlayerHasLockedInventory("DoubleOpenGag"));
	Common_PlayerChaste = PlayerHasLockedInventory("ChastityBelt");
	Common_PlayerNotRestrained = !Common_PlayerRestrained;
	Common_PlayerNotGagged = !Common_PlayerGagged;
}

// Save the current full inventory for the player
function PlayerSaveAllInventory() {
	PlayerSavedInventory = PlayerInventory.slice();
}

// Restore the full saved inventory for the player, one item by item
function PlayerRestoreAllInventory() {
	for (var I = 0; I < PlayerSavedInventory.length; I++)
		PlayerAddInventory(PlayerSavedInventory[I][PlayerInventoryName], PlayerSavedInventory[I][PlayerInventoryQuantity]);
	PlayerSavedInventory = [];
}

// Add a new item to the locked inventory
function PlayerLockInventory(NewInventory) {

	// Check if the item is already locked before adding it
	for (var I = 0; I < PlayerLockedInventory.length; I++)
		if (PlayerLockedInventory[I] == NewInventory)
			return;		
	PlayerLockedInventory.push(NewInventory);
	LoadRestrainStatus();

}

// Remove an item from the locked inventory
function PlayerUnlockInventory(UnlockedInventory) {

	// Check if the item is already locked before adding it
	for (var I = 0; I < PlayerLockedInventory.length; I++)
		if (PlayerLockedInventory[I] == UnlockedInventory)
			PlayerLockedInventory.splice(I, 1);
	LoadRestrainStatus();

}

// Remove all items from the locked inventory except the egg, collar and chastity belt
function PlayerUnlockAllInventory(UnlockedInventory) {
	var HadCollar = PlayerHasLockedInventory("Collar");
	var HadEgg = PlayerHasLockedInventory("VibratingEgg");
	var HadBelt = PlayerHasLockedInventory("ChastityBelt");
	while (PlayerLockedInventory.length > 0)
		PlayerLockedInventory.splice(0, 1);
	if (HadCollar) PlayerLockInventory("Collar");
	if (HadEgg) PlayerLockInventory("VibratingEgg");
	if (HadBelt) PlayerLockInventory("ChastityBelt");
	LoadRestrainStatus();
}

// Returns true if the player has the locked inventory
function PlayerHasLockedInventory(QueryInventory) {
	
	// Returns true if we find the locked inventory item
	for (var I = 0; I < PlayerLockedInventory.length; I++)
		if (QueryInventory == PlayerLockedInventory[I])
			return true;
	return false;
	
}

// Add a new item to the inventory if it's not already there
function PlayerAddInventory(NewInventory, NewQuantity) {

	// If inventory already exists, we add 1 quantity
	for (var I = 0; I < PlayerInventory.length; I++)
		if (NewInventory == PlayerInventory[I][PlayerInventoryName]) {
			PlayerInventory[I][PlayerInventoryQuantity] = PlayerInventory[I][PlayerInventoryQuantity] + NewQuantity;
			return;
		}
		
	// If not, we create the new inventory data
	PlayerInventory[PlayerInventory.length] = [NewInventory, NewQuantity];
	
}

// Remove an item from the player inventory
function PlayerRemoveInventory(RemInventory, RemQuantity) {
	
	// Search for current inventory and remove the item
	for (var I = 0; I < PlayerInventory.length; I++)
		if (RemInventory == PlayerInventory[I][PlayerInventoryName])
			if (RemQuantity >= PlayerInventory[I][PlayerInventoryQuantity])
				PlayerInventory.splice(I, 1);
			else
				PlayerInventory[I][PlayerInventoryQuantity] = PlayerInventory[I][PlayerInventoryQuantity] - RemQuantity;

}

// Remove all inventory from the player
function PlayerRemoveAllInventory() {
	while (PlayerInventory.length > 0)
		PlayerInventory.splice(0, 1);
}

// Remove half of the inventory from the player (rounded up)
function PlayerRemoveHalfInventory() {
	for (var I = 0; I < PlayerInventory.length; I++) {
		if (PlayerInventory[I][PlayerInventoryQuantity] <= 1) {
			PlayerInventory.splice(I, 1);
			I--;
		} else PlayerInventory[I][PlayerInventoryQuantity] = Math.floor(PlayerInventory[I][PlayerInventoryQuantity] / 2);
	}
}

// Returns true if the player has the queried inventory
function PlayerHasInventory(QueryInventory) {
	
	// Returns true if we find the inventory item
	for (var I = 0; I < PlayerInventory.length; I++)
		if (QueryInventory == PlayerInventory[I][PlayerInventoryName])
			return true;
	return false;
	
}

// Restrains the player randomly from her inventory
function PlayerRandomBondage() {
	
	// Selects the restrain type
	var R = "";
	if (!Common_PlayerRestrained) {
		if (PlayerHasInventory("Rope") && PlayerHasInventory("Cuffs")) { if (Math.floor(Math.random() * 2) == 1) R = "Rope"; else R = "Cuffs"; }
		if (PlayerHasInventory("Rope") && !PlayerHasInventory("Cuffs")) { R = "Rope"; }
		if (!PlayerHasInventory("Rope") && PlayerHasInventory("Cuffs")) { R = "Cuffs"; }
	}

	// Selects the gag type
	var G = "";
	if (!Common_PlayerGagged) {
		var GT = [];
		if (PlayerHasInventory("BallGag")) GT.push("BallGag");
		if (PlayerHasInventory("TapeGag")) GT.push("TapeGag");
		if (PlayerHasInventory("ClothGag")) GT.push("ClothGag");
		if (GT.length > 0) G = GT[Math.floor(Math.random() * GT.length)];
	}

	// Applies them on the player
	if (R != "") { PlayerRemoveInventory(R, 1); PlayerLockInventory(R); }
	if (G != "") { PlayerRemoveInventory(G, 1); PlayerLockInventory(G); }
	
	// If the player has rope, she must at least be in her underwear
	if (PlayerHasLockedInventory("Rope") && Common_PlayerClothed) PlayerClothes("Underwear");

}

// Release the player from bondage and restore it's inventory
function PlayerReleaseBondage() {
	if (PlayerHasLockedInventory("Cuffs")) { PlayerUnlockInventory("Cuffs"); PlayerAddInventory("Cuffs", 1); }
	if (PlayerHasLockedInventory("Rope")) { PlayerUnlockInventory("Rope"); PlayerAddInventory("Rope", 1); }
	PlayerUngag();
}

// Ungag the player and restore it's inventory
function PlayerUngag() {
	if (PlayerHasLockedInventory("BallGag")) { PlayerUnlockInventory("BallGag"); PlayerAddInventory("BallGag", 1); }
	if (PlayerHasLockedInventory("ClothGag")) { PlayerUnlockInventory("ClothGag"); PlayerAddInventory("ClothGag", 1); }
	if (PlayerHasLockedInventory("TapeGag")) { PlayerUnlockInventory("TapeGag"); }
}

// Add a random item in the player inventory
function PlayerAddRandomItem() {
	var ItemList = ["BallGag", "TapeGag", "ClothGag", "Cuffs", "Rope", "ChastityBelt", "VibratingEgg", "Crop", "Collar", "SleepingPill"];
	var Item = ItemList[Math.floor(Math.random() * 10)];
	PlayerAddInventory(Item, 1);
	if (Item == "TapeGag") PlayerAddInventory(Item, 7); // For tape gag, add a bonus + 7 quantity
	if ((Item == "Cuffs") && (Math.floor(Math.random() * 2) == 1)) PlayerAddInventory("CuffsKey", 1); // For cuffs, can randomly add keys
}

// Returns the total quantity of items that the player has
function PlayerInventoryTotalQuantity() {
	var TotalQuantity = 0;
	for (var I = 0; I < PlayerInventory.length; I++)
		TotalQuantity = TotalQuantity + PlayerInventory[I][PlayerInventoryQuantity];
	return TotalQuantity;
}

// Returns the name of the inventory item that was clicked in the bottom menu
function GetClickedInventory() {
	
	// Returns the item name based on the position of the mouse
	var Inv = "";
	if ((MouseX <= 975) && (MouseY >= 601) && (MouseY <= 674)) {

		// Check if the player icon was clicked
		if ((MouseX >= 1) && (MouseX <= 74))
			Inv = "Player";
	
		// Check in the regular inventory
		var I;
		if (Inv == "")
			for (I = 0; I < PlayerInventory.length; I++)	
				if ((MouseX >= 1 + (I + 1) * 75) && (MouseX <= 74 + (I + 1) * 75))
					Inv = PlayerInventory[I][PlayerInventoryName];
			
		// Check in the locked inventory
		if (Inv == "")
			for (var L = 0; L < PlayerLockedInventory.length; L++)	
				if (!PlayerHasInventory(PlayerLockedInventory[L])) {
					if ((MouseX >= 1 + (I + 1) * 75) && (MouseX <= 74 + (I + 1) * 75))
						Inv = "Locked_" + PlayerLockedInventory[L];
					I++;
				}

	}

	// Returns the inventory found
	return Inv;

}

// Regular event for inventory clicks, set the common scene for the item
function InventoryClick(Inv, LChapter, LScreen) {
	if (Inv != "") {
		SetScene("C999_Common", Inv.replace("Locked_", ""));
		LeaveChapter = LChapter;
		LeaveScreen = LScreen;
	}
}