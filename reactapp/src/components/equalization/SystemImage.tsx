/**
 * SystemImage.tsx
 *
 * This file renders the “system” view of our equalization game:
 * two miniature scales (one for each equation) plus the algebraic equations themselves.
 * We annotate each part so someone completely new to React and web development can follow along.
 */

import { TranslationNamespaces } from "@/i18n.ts";
// TranslationNamespaces groups our translation keys.
// We’ll use the “Equalization” namespace for system‐related labels.

import React, { CSSProperties, ReactElement } from "react";
// ReactElement is the type returned by a React component.
// CSSProperties types our inline style objects (JavaScript representation of CSS).

import { useTranslation } from "react-i18next";
// useTranslation gives us the `t()` function to look up translated strings.

import { Weight } from "@/types/equalization/enums";
// Weight enum keys match the names of weight items in our game (e.g., "oneGram", "fiveGram").

import { EqualizationConstants } from "@/types/equalization/equalizationConstants.ts";
// Constants for the game, such as predefined sizes for weight images.

import { EqualizationEquation } from "@/types/equalization/equalizationEquation";
// EqualizationEquation describes one equation in the system:
// - leftItems: items on left pan
// - rightItems: items on right pan
// - equation: the algebraic string representation

import { EqualizationExercise } from "@/types/equalization/equalizationExercise";
// EqualizationExercise holds both equations (first & second), plus variable definitions, etc.

import { EqualizationTranslations } from "@/types/equalization/equalizationTranslations.ts";
// Translation keys specific to the equalization game UI.

import { EqualizationItem } from "@/types/shared/item";
// EqualizationItem represents any draggable item (fruit or weight) with name, amount, etc.

import ImageEquation from "@components/math/conceptual-knowledge/ImageEquation.tsx";
// ImageEquation renders an algebraic equation as styled text or image.

import { getImageSourceByName } from "@utils/itemImageLoader.ts";
// Utility that returns the URL of an image given its item name.

/**
 * SystemImage
 *
 * Renders the full “system” panel on the left side of the game:
 * two mini‐scales (firstEquation & secondEquation) side by side,
 * plus a clamp label at the bottom.
 */
export default function SystemImage({
  exercise
}: {
  exercise: EqualizationExercise;
}): ReactElement {
  // Pull the translation function for the “Equalization” namespace
  const { t } = useTranslation(TranslationNamespaces.Equalization);

  return (
    <div className="system-image__container">
      {/*
        Background wrapper for the two mini‐scales.
      */}
      <div className="system-image__background">
        {/*
          Render the top mini‐scale for the first equation
        */}
        <SystemScale equalizationEquation={exercise.firstEquation} />

        {/*
          Render the bottom mini‐scale for the second equation
        */}
        <SystemScale equalizationEquation={exercise.secondEquation} />
      </div>

      {/*
        The “clamp” at the bottom holds a label like a binder clip
        showing the system sign (e.g., { or another symbol).
      */}
      <div className="system-image__clamp">
        <p>{t(EqualizationTranslations.SYSTEM_SIGN)}</p>
      </div>
    </div>
  );
}

/**
 * SystemScale
 *
 * Renders one miniature scale plus its corresponding equation text.
 * Props:
 *  - equalizationEquation: the data for one equation
 */
function SystemScale({
  equalizationEquation
}: {
  equalizationEquation: EqualizationEquation;
}): ReactElement {
  return (
    <div className="system-image__scale">
      {/*
        A container holding two “plates” for left and right items.
      */}
      <div className="system-image__scale-plates">
        {/*
          Show left side of this mini‐scale
        */}
        <SystemPlate items={equalizationEquation.leftItems} />

        {/*
          Show right side of this mini‐scale
        */}
        <SystemPlate items={equalizationEquation.rightItems} />
      </div>

      {/*
        Below the mini‐scale, render the algebraic equation itself
        via the ImageEquation component.
      */}
      <div className="system-image__scale-equation">
        <ImageEquation
          equation={equalizationEquation.equation}
          style={{ color: "var(--dark-text)" }}
        />
      </div>
    </div>
  );
}

/**
 * SystemPlate
 *
 * Renders a single plate (left or right) of the mini‐scale:
 * a horizontal row of images for each item.
 * Props:
 *  - items: array of EqualizationItem to display
 */
function SystemPlate({
  items
}: {
  items: EqualizationItem[];
}): ReactElement {
  return (
    <div className="system-image__scale-plate">
      {/*
        Map over each item on this plate.
        We use `index` as key because these items are in fixed order per equation.
      */}
      {items.map((item: EqualizationItem, index: number) => {
        // Look up the base size (in rem) for this weight’s image.
        // If missing, fallback to undefined and handle below.
        const width: number | undefined =
          EqualizationConstants.WEIGHT_SIZES.get(item.name as Weight);

        // Build inline style for the container div:
        // - width: half or two-thirds of the base size depending on window width
        // - height: auto to preserve aspect ratio
        // - marginTop: auto to push it down into the plate
        // - display: flex to center contents if needed
        const containerSize: CSSProperties = {
          width:
            window.innerWidth < 1800
              ? `${width ? width / 2 : 1.5}rem`
              : `${width ? width / 1.5 : 2}rem`,
          height: "auto",
          marginTop: "auto",
          display: "flex"
        };

        return (
          <div key={index} style={containerSize}>
            {/*
              The actual <img> for this item.
              We use getImageSourceByName to resolve the URL.
              className "draggable-item__image" ensures same sizing
              as draggable counterparts.
            */}
            <img
              className="draggable-item__image"
              src={getImageSourceByName(item.name)}
              alt={item.name}
            />
          </div>
        );
      })}
    </div>
  );
}
