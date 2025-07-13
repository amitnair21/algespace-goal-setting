/**
 * FruitBox.tsx
 *
 * This component renders a box that can hold fruit icons for our equalization game.
 * Think of it like a small bucket on the side of a scale where fruit stickers can appear.
 */

import { ReactElement } from "react";
// ReactElement is the type we return from a React component in TypeScript.
// It represents a piece of UI (like a virtual DOM node).

import { DragSource } from "@/types/equalization/enums";
// DragSource is an enum defining where a draggable item comes from or can go to.
// We import it so our FruitBox knows which “zone” it belongs to.

import { GameError, GameErrorType } from "@/types/shared/error.ts";
// GameError and GameErrorType let us throw standardized errors when something goes wrong in the game logic.

import { EqualizationItem } from "@/types/shared/item";
// EqualizationItem is a type that describes an item in our game (e.g., a piece of fruit or a weight).

import DraggableImage from "@components/shared/DraggableImage";
// DraggableImage renders the fruit image itself when we are dragging.
// It’s like the picture on the sticker you pick up.

import DraggableItem from "@components/shared/DraggableItem";
// DraggableItem is a wrapper around DraggableImage plus the drag-and-drop behavior.
// It makes an element “pick-up-able” in our drag-and-drop system.

//
// Next, we import all the PNG image files for each fruit. In a real web app,
// these statements tell the build system to include those image assets and give us a URL.
// You can think of each import as “I want the URL for this fruit picture.”
//
import AppleDisplay from "@images/equalization/appleDisplay.png";
import AubergineDisplay from "@images/equalization/aubergineDisplay.png";
import BananaDisplay from "@images/equalization/bananaDisplay.png";
import CarrotDisplay from "@images/equalization/carrotDisplay.png";
import CoconutDisplay from "@images/equalization/coconutDisplay.png";
import LemonDisplay from "@images/equalization/lemonDisplay.png";
import LimeDisplay from "@images/equalization/limeDisplay.png";
import MelonDisplay from "@images/equalization/melonDisplay.png";
import PapayaDisplay from "@images/equalization/papayaDisplay.png";
import PearDisplay from "@images/equalization/pearDisplay.png";
import PineappleDisplay from "@images/equalization/pineappleDisplay.png";
import PumpkinDisplay from "@images/equalization/pumpkinDisplay.png";

//
// We create a Map that links fruit names (like "apple") to their image URLs.
// A Map is like a dictionary or a real-life map: you give it a key, it gives you a value.
// Here, the key is the fruit’s name, and the value is the image URL we imported above.
//
const displays: Map<string, string> = new Map<string, string>([
  ["apple", AppleDisplay],
  ["aubergine", AubergineDisplay],
  ["banana", BananaDisplay],
  ["carrot", CarrotDisplay],
  ["coconut", CoconutDisplay],
  ["lemon", LemonDisplay],
  ["lime", LimeDisplay],
  ["melon", MelonDisplay],
  ["papaya", PapayaDisplay],
  ["pear", PearDisplay],
  ["pineapple", PineappleDisplay],
  ["pumpkin", PumpkinDisplay]
]);

/**
 * getDisplayImageSourceByName
 *
 * Given the name of a fruit, return the corresponding image URL.
 * If the name isn’t found, we log an error and throw a GameError.
 *
 * @param name - the unique string key for the fruit (e.g., "apple")
 * @returns a string URL pointing to the appropriate fruit image
 * @throws GameError if the name does not exist in our `displays` map
 */
function getDisplayImageSourceByName(name: string): string {
  // Try to look up the image URL in our map
  const src: string | undefined = displays.get(name);

  // If the map returned undefined, that means we tried to display a fruit that doesn’t exist.
  if (src === undefined) {
    console.error(`The name ${name} of the display is not well defined.`);
    // We throw a GameError with the EXERCISE_ERROR type so our app can handle it gracefully.
    throw new GameError(GameErrorType.EXERCISE_ERROR);
  }

  // If everything is fine, return the URL.
  return src;
}

/**
 * FruitBox
 *
 * This React component renders a single box that may contain fruit.
 * If `containsItems` is false, it’s just an empty box.
 * If true, we show the fruit’s image as a CSS background and make it draggable.
 *
 * @param source       - The DragSource enum indicating where the draggable item belongs
 * @param item         - The EqualizationItem describing this fruit (with name, weight, etc.)
 * @param containsItems - A boolean flag: should we render the fruit inside this box?
 * @returns a ReactElement representing the UI for this fruit box
 */
export default function FruitBox({
  source,
  item,
  containsItems
}: {
  source: DragSource;
  item: EqualizationItem;
  containsItems: boolean;
}): ReactElement {
  // If there is at least one of this fruit to display, we render the box with the fruit image.
  if (containsItems) {
    return (
      <div
        className={"equalization__fruits-box"}
        // We set the backgroundImage style to the URL returned by our helper function.
        style={{
          backgroundImage: `url(${getDisplayImageSourceByName(item.name)})`
        }}
      >
        {/*
          DraggableItem wraps DraggableImage and provides the drag-and-drop logic.
          - source: tells the drag system which zone this item comes from
          - item: the metadata about this fruit
          - index: used for ordering when multiple items exist
          - className="--inherit": we pass a modifier class so it picks up the right CSS
          - children: DraggableImage itself, which actually renders the invisible image
            when not dragging (isVisible=false) and visible when dragging.
        */}
        <DraggableItem
          source={source}
          item={item}
          index={0}
          className="--inherit"
        >
          <DraggableImage
            isVisible={false}     // We don’t show the “floating sticker” unless the user starts dragging
            imageName={item.name} // Tells DraggableImage which asset to use
          />
        </DraggableItem>
      </div>
    );
  } else {
    // If `containsItems` is false, we render an empty box with just the CSS class.
    // This maintains the grid layout even when no fruit is present.
    return <div className={"equalization__fruits-box"}></div>;
  }
}
