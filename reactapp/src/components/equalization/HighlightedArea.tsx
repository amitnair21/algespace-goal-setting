/**
 * HighlightedArea.tsx
 *
 * This component draws semi-transparent overlays on:
 * 1) the left and right pans of the scale
 * 2) the corresponding parts of the system image (two equations)
 *
 * Its goal is to visually link each equation to the part of the scale
 * where those quantities appear.
 */

// We import React itself plus TypeScript types for CSS styles and React elements.
import React, { CSSProperties, ReactElement } from "react";

// EqualizationExercise holds all data about the algebra exercise:
// the two equations, isolated/second‐variable counts, etc.
import { EqualizationExercise } from "@/types/equalization/equalizationExercise.ts";

// EqualizationGameState stores the current items on each pan of the scale,
// so we can tell how many second variables ended up on each side.
import { EqualizationGameState } from "@/types/equalization/equalizationGameState.ts";

// GameError is our custom error class, with typed error codes for consistent handling.
import { GameError, GameErrorType } from "@/types/shared/error.ts";

// Utility to count “second variable” items in a list of scale items.
import { countSecondVariable } from "@utils/utils.ts";

interface HighlightedAreaProps {
  // Bounding box of the scale container in the DOM (needed for positioning).
  scaleRect: DOMRect | undefined;
  // Bounding box of the system image container (two-equation view).
  systemRect: DOMRect | undefined;
  // Current game state (which items on each pan).
  gameState: EqualizationGameState;
  // The static exercise data (equations, expected counts, etc.).
  exercise: EqualizationExercise;
}

// The main component function
export default function HighlightedArea({
  scaleRect,
  systemRect,
  gameState,
  exercise
}: HighlightedAreaProps): ReactElement {
  // If either rectangle is missing, we cannot position overlays correctly.
  // We log and throw so the app can catch this as a logic error.
  if (scaleRect === undefined || systemRect === undefined) {
    console.error(
      "HighlightedArea: scaleRect or systemRect is undefined. Cannot render highlights."
    );
    throw new GameError(GameErrorType.GAME_LOGIC_ERROR);
  }

  // Convert pixel measurements to rem units by dividing by the root font-size.
  // getComputedStyle(document.documentElement).fontSize might return "16px", so we parseFloat it.
  const fontSize: number = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );

  // Compute how tall the scale‐tray highlight should be in rem:
  // scaleRect.height is in px; divide by fontSize to get rem; subtract 8rem of border/margin space.
  const scaleRectHeight: number =
    scaleRect.height / fontSize - 8;

  // Inline CSS for the left scale tray highlight.
  // left: distance from viewport left (in rem)
  // width: fixed 15.5rem
  // height: computed above
  const stylePlateLeft: CSSProperties = {
    left: `${scaleRect.left / fontSize}rem`,
    width: "15.5rem",
    height: `${scaleRectHeight}rem`
  };

  // Inline CSS for the right scale tray highlight.
  // We take scaleRect.right (px from left edge) convert to rem,
  // then subtract the width of the highlight box (15.5rem)
  const stylePlateRight: CSSProperties = {
    left: `${scaleRect.right / fontSize - 15.5}rem`,
    width: "15.5rem",
    height: `${scaleRectHeight}rem`
  };

  // Determine the height of the system-image highlight (for equations).
  // Similar conversion px→rem, then subtract different pixel/rem values
  // depending on window width to account for margins/gaps.
  const systemRectHeight: number =
    systemRect.height / fontSize - (window.innerWidth < 1800 ? 5 : 8);

  // Count how many second-variable items ended up on the left pan.
  const countLeft: number = countSecondVariable(gameState.leftItems);

  // If both equations have the same number of isolated variables,
  // we use a multiplier of 1. Otherwise, use that isolated count.
  const isolatedCountsAreEqual: boolean =
    exercise.firstEquation.isolatedVariableCount ===
    exercise.secondEquation.isolatedVariableCount;

  const firstEquationMultiplier: number = isolatedCountsAreEqual
    ? 1
    : exercise.firstEquation.isolatedVariableCount;

  const secondEquationMultiplier: number = isolatedCountsAreEqual
    ? 1
    : exercise.secondEquation.isolatedVariableCount;

  // Render multiple <div>s for overlays. A React.Fragment groups them without adding an extra DOM node.
  return (
    <React.Fragment>
      {/*
        Overlay for left scale tray.
        Positioned/sized by stylePlateLeft.
      */}
      <div
        className={"scale-highlighted-area-left"}
        style={stylePlateLeft}
      ></div>

      {/*
        Overlay for right scale tray.
      */}
      <div
        className={"scale-highlighted-area-right"}
        style={stylePlateRight}
      ></div>

      {/*
        Overlay for the first equation in the system image.
        We choose left/right offset via getDistanceLeft(true,…).
        We pick a blue border if the second-variable count matches countLeft.
      */}
      {exercise.firstEquation.leftIsolated ? (
        <div
          className={"system-highlighted-area"}
          style={getSystemRect(
            systemRectHeight,
            getDistanceLeft(
              /* isFirstScale */ true,
              /* isFirst */ false
            ),
            /* colorBlue? */
            exercise.firstEquation.secondVariableCount *
              secondEquationMultiplier ===
              countLeft
          )}
        ></div>
      ) : (
        <div
          className={"system-highlighted-area"}
          style={getSystemRect(
            systemRectHeight,
            getDistanceLeft(
              /* isFirstScale */ true,
              /* isFirst */ true
            ),
            /* colorBlue? */
            exercise.firstEquation.secondVariableCount *
              secondEquationMultiplier ===
              countLeft
          )}
        ></div>
      )}

      {/*
        Overlay for the second equation (lower one).
        getDistanceLeft(false,…) places it further down.
      */}
      {exercise.secondEquation.leftIsolated ? (
        <div
          className={"system-highlighted-area"}
          style={getSystemRect(
            systemRectHeight,
            getDistanceLeft(
              /* isFirstScale */ false,
              /* isFirst */ false
            ),
            /* colorBlue? */
            exercise.secondEquation.secondVariableCount *
              firstEquationMultiplier ===
              countLeft
          )}
        ></div>
      ) : (
        <div
          className={"system-highlighted-area"}
          style={getSystemRect(
            systemRectHeight,
            getDistanceLeft(
              /* isFirstScale */ false,
              /* isFirst */ true
            ),
            /* colorBlue? */
            exercise.secondEquation.secondVariableCount *
              firstEquationMultiplier ===
              countLeft
          )}
        ></div>
      )}
    </React.Fragment>
  );
}

/**
 * getSystemRect
 *
 * Returns an inline style object for a system‐equation highlight box.
 * @param height   - height of highlight in rem
 * @param leftOffset - horizontal offset in rem
 * @param colorBlue  - if true, borderColor is primary blue; else secondary orange
 */
function getSystemRect(
  height: number,
  leftOffset: number,
  colorBlue: boolean
): CSSProperties {
  return {
    left: `${leftOffset}rem`,
    width: window.innerWidth < 1800 ? "7.25rem" : "10.25rem",
    height: `${height}rem`,
    borderColor: colorBlue
      ? "var(--primary-blue)"
      : "var(--secondary-orange)"
  };
}

/**
 * getDistanceLeft
 *
 * Calculates the horizontal offset (in rem units) from the window’s left edge
 * for highlighting the system‐image box.
 *
 * @param isFirstScale - true for the first (upper) equation; false for the second (lower)
 * @param isFirst      - true if the isolated variable part is on the left side of that equation
 * @returns a number in rem units
 */
function getDistanceLeft(
  isFirstScale: boolean,
  isFirst: boolean
): number {
  if (isFirstScale) {
    // For the top equation…
    if (isFirst) {
      // isolated variable on left side
      return 2.5;
    }
    // isolated variable on right side
    return window.innerWidth < 1800 ? 11 : 14.75;
  }

  // For the bottom equation…
  if (isFirst) {
    // left side
    return window.innerWidth < 1800 ? 18.25 : 25;
  }
  // right side
  return window.innerWidth < 1800 ? 26.75 : 37.25;
}
