/**
 * ScaleDropzone.tsx
 *
 * This component renders one “pan” drop zone on our scale.
 * It handles:
 *  - Highlighting when you drag an item over it
 *  - Displaying any weight items already on that pan
 *  - Showing a warning message if you exceed the pan’s capacity
 */

import { TranslationNamespaces } from "@/i18n.ts";
// TranslationNamespaces groups our translation keys so we only load the “Equalization” dictionary here.

import { useDroppable } from "@dnd-kit/core";
// useDroppable is a hook from dnd-kit that makes an area able to receive dragged items.
// It gives us `isOver` (true when something is hovering) and `setNodeRef` (a ref callback).

import React, { CSSProperties, ReactElement } from "react";
// ReactElement is the type returned by a React component.
// CSSProperties types our inline `style` objects.

import { useTranslation } from "react-i18next";
// useTranslation gives us `t()` for looking up translated strings.

import { DragSource, Weight } from "@/types/equalization/enums";
// DragSource enum identifies which zone an item comes from or can go to.
// Weight enum keys match our weights’ names (e.g., "oneGram", "fiveGram").

import { EqualizationConstants } from "@/types/equalization/equalizationConstants.ts";
// Constants for the game: e.g., predefined sizes for weight images.

import { EqualizationTranslations } from "@/types/equalization/equalizationTranslations.ts";
// Translation keys specific to the equalization game.

import { EqualizationItem } from "@/types/shared/item";
// EqualizationItem describes an item we can drag: name, weight, count, etc.

import DraggableImage from "@components/shared/DraggableImage";
// Renders the image for a draggable item.

import DraggableItem from "@components/shared/DraggableItem";
// Wraps DraggableImage with the drag-and-drop logic.

/**
 * Props for ScaleDropzone:
 * - items: list of weight items currently on this pan
 * - margin: CSS margin-bottom value to space multiple drop zones
 * - source: which DragSource this drop zone represents
 * - isValidDropzone: function that tells us if dropping here is allowed right now
 * - maxCapacity: maximum number of items this pan can hold
 */
export default function ScaleDropzone({
  items,
  margin,
  source,
  isValidDropzone,
  maxCapacity
}: {
  items: EqualizationItem[];
  margin: string;
  source: DragSource;
  isValidDropzone: (target: DragSource) => boolean;
  maxCapacity: number;
}): ReactElement {
  // t() looks up translations in the “Equalization” namespace
  const { t } = useTranslation(TranslationNamespaces.Equalization);

  // Initialize this area as a droppable zone
  // - id must be unique: we include the source enum name
  // - data.target tells the drag system “if you drop here, your target = source”
  const { isOver, setNodeRef } = useDroppable({
    id: `dropzone-${source}`,
    data: { target: source }
  });

  // True if we’ve already placed exactly maxCapacity items on this pan
  const hasMaxItems: boolean = items.length === maxCapacity;

  // True if an item is hovering here AND this is a valid drop target
  const over: boolean = isOver && isValidDropzone(source);

  // Inline styles for our drop zone container:
  // - marginBottom spaces it in the vertical stack
  // - backgroundColor changes when an item hovers:
  //    • red transparent if it’s full (error state)
  //    • grey transparent if it can accept more
  //    • transparent otherwise
  const style: CSSProperties = {
    marginBottom: margin,
    backgroundColor: over
      ? hasMaxItems
        ? "rgba(255,0,0,0.5)"
        : "rgba(98,128,136,0.5)"
      : "transparent"
  };

  /**
   * Build the dropzone UI once, then optionally wrap it in an error banner.
   * This lets us avoid duplicating the mapping logic below.
   */
  const dropzone: ReactElement = (
    <div
      className="scale__dropzone"
      // Attach our droppable ref so dnd-kit can detect hovers and drops here
      ref={setNodeRef}
      style={style}
    >
      {items.map((item: EqualizationItem, index: number) => {
        // Look up the width for each weight image in rem units.
        // If we don’t have a size for this weight, default to 3rem.
        const width: number =
          EqualizationConstants.WEIGHT_SIZES.get(item.name as Weight) ?? 3;

        return (
          <div
            key={index}
            style={{
              width: `${width}rem`,
              height: "auto",
              marginTop: "auto"
            }}
          >
            {/*
              DraggableItem wraps DraggableImage so the user can drag this weight off the pan.
              - source: tells the drag system “I came from this dropzone”
              - item & index identify which specific item this is
              - className="--inherit" lets our CSS inherit some sizing rules
              - children: the actual image we show
            */}
            <DraggableItem
              source={source}
              item={item}
              index={index}
              className="--inherit"
            >
              <DraggableImage
                isVisible={true}
                imageName={item.name}
              />
            </DraggableItem>
          </div>
        );
      })}
    </div>
  );

  // Finally, return either:
  // - A wrapper showing a “max capacity” warning plus the dropzone
  // - Or just the dropzone by itself
  return (
    <React.Fragment>
      {over && hasMaxItems ? (
        <div className="scale__dropzone-error">
          {/* Show a translated warning if the pan is full and you’re hovering */}
          <p>{t(EqualizationTranslations.WARNING_MAX_CAPACITY)}</p>
          {dropzone}
        </div>
      ) : (
        dropzone
      )}
    </React.Fragment>
  );
}
