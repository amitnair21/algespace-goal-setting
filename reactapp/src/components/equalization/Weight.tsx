/**
 * Weight.tsx
 *
 * This component renders a draggable weight icon (or stack of weights)
 * for the equalization game. It shows a single weight if amount === 1,
 * or mimics a small stack behind the front weight when amount > 1.
 */

import { CSSProperties, ReactElement } from "react";
// ReactElement is the return type for a React component.
// CSSProperties types our inline style objects (JavaScript representation of CSS).

import { DragSource, Weight as WeightProps } from "@/types/equalization/enums";
// DragSource enum says “this item comes from the weights shelf”.
// WeightProps enum maps weight names (e.g., "oneGram", "fiveGram") to allow lookup.

import { EqualizationConstants } from "@/types/equalization/equalizationConstants.ts";
// EqualizationConstants.WEIGHT_SIZES is a Map<string, number> defining
// the base width (in rem) for each weight image.

import { EqualizationItem } from "@/types/shared/item";
// EqualizationItem describes a draggable item: name, itemType, amount, weight.

import DraggableImage from "@components/shared/DraggableImage";
// DraggableImage renders the actual image when dragging or static dropzones.

import DraggableItem from "@components/shared/DraggableItem";
// DraggableItem wraps DraggableImage with drag-and-drop behavior.

import { getImageSourceByName } from "@utils/itemImageLoader.ts";
// Utility that returns the image URL given an item name.

/**
 * Weight component props:
 * - index: position index of this weight in the list (used by drag system)
 * - weightItem: the item data, including .name and .amount
 */
export default function Weight({
  index,
  weightItem
}: {
  index: number;
  weightItem: EqualizationItem;
}): ReactElement {
  // Look up the width for this weight’s image (in rem).
  // If it’s not defined in the map, fall back to 3rem.
  const width: number =
    EqualizationConstants.WEIGHT_SIZES.get(
      weightItem.name as WeightProps
    ) ?? 3;

  // Base style for a single weight image container:
  // - width: `${width}rem`
  // - height: "100%" so it fills its parent’s height
  const weightSize: CSSProperties = {
    width: `${width}rem`,
    height: "100%"
  };

  // If there’s exactly one of this weight, render it simply.
  if (weightItem.amount === 1) {
    return (
      <div style={weightSize}>
        {/*
          DraggableItem makes the weight draggable.
          - source: identifies which drag zone it came from
          - item: metadata about this weight
          - index: its index among weights
          - className="--inherit": applies CSS sizing from parent
          - children: DraggableImage shows the visible image
        */}
        <DraggableItem
          source={DragSource.Weights}
          item={weightItem}
          index={index}
          className="--inherit"
        >
          <DraggableImage
            isVisible={true}
            imageName={weightItem.name}
          />
        </DraggableItem>
      </div>
    );
  } else {
    // If there are multiple of this weight, we show a small “stack”:
    // a background image behind the front-most draggable weight.
    return (
      <div
        className="equalization__weight"
        style={{
          // Slightly wider than the base width so the behind image peeks out
          width: `${width + 0.25}rem`,
          height: "100%",
          // Set the background image to the same weight sprite
          backgroundImage: `url(${getImageSourceByName(
            weightItem.name
          )})`,
          // Scale the background slightly smaller so it appears behind
          backgroundSize: `${width - 0.1}rem auto`
        }}
      >
        {/*
          Inside the stack container, render the front-most draggable weight
          with the same base weightSize style.
        */}
        <div style={weightSize}>
          <DraggableItem
            source={DragSource.Weights}
            item={weightItem}
            index={index}
            className="--inherit"
          >
            <DraggableImage
              isVisible={true}
              imageName={weightItem.name}
            />
          </DraggableItem>
        </div>
      </div>
    );
  }
}
