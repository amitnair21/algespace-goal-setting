/**
 * EqualizationGame.tsx
 *
 * This file contains a React component that renders an interactive "equalization game".
 * Think of this like a digital balancing puzzle for learning algebra concepts.
 */

// We start by importing other pieces (modules) that this component needs to work.
// In JavaScript/TypeScript we use `import` to bring in functionality from other files or libraries.

// DraggableImage is a small component used to render an image that users can drag around.
// Imagine a sticker that you can pick up and move on a digital whiteboard.
import DraggableImage from "@/components/shared/DraggableImage";

// useAuth is a custom Hook that gives us access to authentication information (like who is logged in).
// A "hook" is just a special function in React that lets us tap into React features like state or context.
import { useAuth } from "@/contexts/AuthProvider.tsx";

// TranslationNamespaces is an enum listing parts of our translation files—like chapters in a dictionary for multiple languages.
import { TranslationNamespaces } from "@/i18n.ts";

// DndContext and related imports come from @dnd-kit/core, a library that makes drag-and-drop easier.
// Think of DndContext as the playground where drag-and-drop happens, and MouseSensor/TouchSensor detect when you try to drag.
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";

// snapCenterToCursor is a little helper that makes sure the dragged item stays under your cursor/finger.
// Without it, the item might jump off to the side when you start dragging.
import { snapCenterToCursor } from "@dnd-kit/modifiers";

// These imports let us use nice icons (like check marks or rotate arrows) from FontAwesome.
import { faCheck, faRotateLeft, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// immer is a library for working with immutable state in an easier way.
// We use `produce` to create a new state object based on the old one,
// without accidentally modifying the original (like making a copy when baking a cake).
import { produce } from "immer";

// React is the core library for building our UI components.
// We pull in hooks like useRef (for referencing DOM elements), useState (for state), and useTranslation (for i18n).
import React, { ReactElement, ReactNode, useRef, useState } from "react";

// Trans and useTranslation come from react-i18next, which is our internationalization library.
// Trans is a component that helps insert translated text into JSX.
import { Trans, useTranslation } from "react-i18next";

// useNavigate is a React Router hook that lets us programmatically navigate to different pages in our app.
// Think of it like a GPS directing you to another view.
import { useNavigate } from "react-router-dom";

// useImmer is a more ergonomic way to work with Immer and React state.
// It's like `useState`, but built around Immer's idea of immutable updates.
import { useImmer } from "use-immer";

// We bring in various enums and types that represent the rules and phases of our game.
import {
  DragSource,
  EqualizationGamePhase,
  EqualizationItemType,
  InstructionType
} from "@/types/equalization/enums";

// Constants for the game, such as maximum items allowed on a scale.
import { EqualizationConstants } from "@/types/equalization/equalizationConstants.ts";

// Type definitions for the exercise data, the game state, and translations.
import { EqualizationExercise } from "@/types/equalization/equalizationExercise";
import { EqualizationGameState } from "@/types/equalization/equalizationGameState.ts";
import { EqualizationTranslations } from "@/types/equalization/equalizationTranslations.ts";

// A "Goal" object encapsulates what we expect the user to achieve at each phase.
import { Goal } from "@/types/equalization/goal";

// GameError and GameErrorType let us throw controlled errors (for instance, if something goes wrong).
import { GameError, GameErrorType } from "@/types/shared/error.ts";

// Some shared translation keys.
import { GeneralTranslations } from "@/types/shared/generalTranslations.ts";

// A generic "item" type used for both weights and variables in the game.
import { EqualizationItem } from "@/types/shared/item";

// Interpolation variables for translating dynamic feedback messages.
import { TranslationInterpolation } from "@/types/shared/translationInterpolation.ts";

// CKExerciseType is for tracking user progress in a larger study/exercise flow.
import { CKExerciseType, EqualizationPhase } from "@/types/studies/enums.ts";

// IUser represents our authenticated user object.
import { IUser } from "@/types/studies/user.ts";

// HighlightedArea draws a visual hint area around the scales and system image when explaining relationships.
import HighlightedArea from "@components/equalization/HighlightedArea.tsx";

// HintPopover is a little widget that shows hints when the user clicks a question mark.
import HintPopover from "@components/shared/HintPopover.tsx";

// Paths holds route constants so we don't hard-code URLs all over the code.
import { Paths } from "@routes/paths.ts";

// Hooks for tracking analytics or study progress (e.g., which buttons the user clicked).
import useCKTracker from "@hooks/useCKTracker.ts";

// Utility functions for saving progress to local storage.
import { setCKExerciseCompleted, setCKStudyExerciseCompleted } from "@utils/storageUtils.ts";

// Helper functions: summing weights, counting variables, displaying feedback messages.
import { countSecondVariable, displayFeedBack, sumWeightOfItems } from "@utils/utils";

// Components for rendering the balance scale and digital scale visuals.
import BalanceScale from "./BalanceScale";
import DigitalScale from "./DigitalScale.tsx";

// FruitBox shows a container of drag‐ready fruit icons.
import FruitBox from "./FruitBox";

// Instruction wraps each instruction text block with styling and optional children (buttons, inputs).
import Instruction, {
  InstructionForContinuingWithSimplification,
  InstructionForDeterminingIsolatedVariable,
  InstructionForScaleAndSystemRelation,
  InstructionForSecondVariableInput,
  InstructionForSolution
} from "./Instruction.tsx";

// SystemImage shows the algebraic system as images/text on one side of the screen.
import SystemImage from "./SystemImage";

// Weight renders a draggable weight icon you can put on a scale.
import Weight from "./Weight";

/**
 * The main component definition.
 *
 * We use a named function wrapped in React default export,
 * so that other parts of our app can import and render <EqualizationGame />.
 */
export default function EqualizationGame({
  exercise,            // Data for this particular exercise (variables, weights, goal, etc.)
  actionOverlay,       // Optional overlay component shown when exercise completes
  isStudy = false,     // Flag: are we in a research "study" flow?
  studyId,             // Identifier of the study, if applicable
  collectData = true   // Should we track analytics data for this session?
}: {
  exercise: EqualizationExercise;
  actionOverlay?: ReactNode;
  isStudy?: boolean;
  studyId?: number;
  collectData?: boolean;
}): ReactElement {
  // useTranslation gives us `t()`, a function to look up translated strings by key.
  const { t } = useTranslation([
    TranslationNamespaces.General,
    TranslationNamespaces.Equalization,
    TranslationNamespaces.Variables
  ]);

  // useNavigate returns a function we can call to change the browser URL programmatically.
  const navigate = useNavigate();

  // Sensors define how drag-and-drop listens for user input: mouse vs touch, with activation constraints.
  // Activation constraints add a slight delay & require a small movement before treating as drag,
  // to avoid accidental drags when you just click or tap.
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,   // You must move the mouse by at least 8 pixels
        delay: 10,     // ...and hold for 10ms
        tolerance: 5   // This helps prevent jitter
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
        delay: 10,
        tolerance: 5
      }
    })
  );

  // Pull the current user object out of our auth context.
  const { user } = useAuth();

  // If we're in study mode, we require the user to exist and a studyId to be passed in.
  if (isStudy) {
    if (user === undefined) {
      // If no user is logged in, we throw a controlled GameError.
      throw new GameError(GameErrorType.AUTH_ERROR);
    }
    if (studyId === undefined) {
      throw new GameError(GameErrorType.STUDY_ID_ERROR);
    }
  }

  // Hooks to track analytics / study events across different phases of the exercise.
  const {
    trackActionInPhase,
    trackHintInPhase,
    trackErrorInPhase,
    setNextTrackingPhase,
    endTrackingPhase,
    endTracking
  } = useCKTracker(
    isStudy && collectData,   // only track if both flags are true
    user as IUser,
    CKExerciseType.Equalization,
    studyId as number,
    exercise.id,
    performance.now()
  );

  // The game history is a list of all past game states, so we can undo/redo.
  // We initialize with a single state created from our exercise data.
  const [gameHistory, setGameHistory] = useImmer<EqualizationGameState[]>([
    EqualizationGameState.initializeGameState(exercise)
  ]);

  // currentStep is an index into gameHistory pointing to which state we display.
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Convenience variable: the game state at the current step.
  const currentGameState: EqualizationGameState = gameHistory[currentStep];

  // A "Goal" describes what's expected in the current game phase (e.g. equalize, simplify, solve).
  const [goal, setGoal] = useState<Goal>(Goal.getEqualizationGoal(exercise));

  // What instruction we should show (first, relation, simplification, solution, etc.).
  const [instructionType, setInstructionType] = useState<InstructionType>(
    InstructionType.FirstInstruction
  );

  // When this is true, we grey out the UI so the user can't interact (e.g. after a correct step).
  const [showTransparentOverlay, setShowTransparentOverlay] = useState<boolean>(false);

  // State for the currently dragged item: [imageName, sourceZone]
  const [draggedItem, setDraggedItem] = useState<[string | null, DragSource | null]>([
    null,
    null
  ]);

  // Feedback flag & message: [visible, content]
  const [feedback, setFeedback] = useState<[boolean, string | ReactNode]>([false, ""]);

  // Hints array and whether the hint button is enabled.
  const [hints, setHints] = useState<TranslationInterpolation[]>(
    EqualizationTranslations.getEqualizationHints(exercise)
  );
  const [showHints, setShowHints] = useState<boolean>(true);

  // Should we highlight the relation between the scale and the system image?
  const [showScaleSystemRelation, setShowScaleSystemRelation] = useState<boolean>(false);

  // References to DOM elements so we can measure their position (for highlighting).
  const scaleRef = useRef<HTMLInputElement>(null);
  const systemRef = useRef<HTMLInputElement>(null);

  // Do we show the actionOverlay component? This appears at the very end.
  const [showActionOverlay, setShowActionOverlay] = useState<boolean>(false);

  /**
   * Based on the current instructionType, pick which Instruction component to render.
   * We wrap each with translation text and pass children like buttons or form inputs.
   */
  let instruction;
  switch (instructionType) {
    case InstructionType.FirstInstruction: {
      instruction = (
        <Instruction translation={EqualizationTranslations.getFirstInstruction(exercise)} />
      );
      break;
    }

    case InstructionType.ScaleAndSystemRelation: {
      instruction = (
        <Instruction translation={EqualizationTranslations.getInstructionForRelation()}>
          <InstructionForScaleAndSystemRelation
            onContinue={loadSimplificationPhase}
            onExplain={explainScaleAndSystemRelation}
            trackAction={trackActionInPhase}
          />
        </Instruction>
      );
      break;
    }

    case InstructionType.RelationReason: {
      instruction = (
        <Instruction translation={EqualizationTranslations.getInstructionForRelationReason()}>
          <InstructionForContinuingWithSimplification
            handleClick={loadSimplificationPhase}
          />
        </Instruction>
      );
      break;
    }

    case InstructionType.Simplification: {
      instruction = (
        <Instruction translation={EqualizationTranslations.getInstructionForSimplification()} />
      );
      break;
    }

    case InstructionType.DeterminingSecondVariable: {
      instruction = (
        <Instruction
          translation={EqualizationTranslations.getInstructionForDeterminingSecondVariable(
            exercise
          )}
        >
          <InstructionForSecondVariableInput
            key={"unique"} // React uses this to track this child
            exercise={exercise}
            handleCorrectSolution={loadSolutionPhase}
            trackAction={trackActionInPhase}
            trackError={trackErrorInPhase}
          />
        </Instruction>
      );
      break;
    }

    case InstructionType.DeterminingIsolatedVariable: {
      instruction = (
        <Instruction
          translation={EqualizationTranslations.getInstructionForDeterminingIsolatedVariable(
            exercise
          )}
        >
          <InstructionForDeterminingIsolatedVariable exercise={exercise} />
        </Instruction>
      );
      break;
    }

    case InstructionType.Solution: {
      instruction = (
        <Instruction translation={EqualizationTranslations.getSolutionInstruction()}>
          <InstructionForSolution
            exercise={exercise}
            handleClick={() => {
              // When done, record completion and navigate away
              if (isStudy) {
                if (collectData) {
                  setCKStudyExerciseCompleted(studyId as number, "equalization", exercise.id);
                }
                navigate(Paths.CKStudyPath + studyId);
              } else {
                setCKExerciseCompleted(exercise.id, "equalization");
                setShowActionOverlay(true);
              }
            }}
          />
        </Instruction>
      );
      break;
    }
  }

  // The return statement builds the actual UI using JSX.
  // JSX looks like HTML but is really JavaScript objects under the hood.
  return (
    <React.Fragment>
      {/* If showActionOverlay is true, render the overlay passed in via props. */}
      {showActionOverlay && actionOverlay}

      {/* Main container with CSS class for styling */}
      <div className={"equalization"}>
        {/* This div holds the system image (equations, fruits, etc.) */}
        <div className={"system-image"} ref={systemRef}>
          <SystemImage exercise={exercise} />
        </div>

        {/* Render whichever instruction component is active */}
        {instruction}

        {/* Grey-out overlay to block interactions */}
        {showTransparentOverlay && <div className={"equalization__overlay"}></div>}

        {/* DndContext is the drag-and-drop playground */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[snapCenterToCursor]}
        >
          <div className={"equalization__table"}>
            {/* Left panel: shelf with weights & fruit boxes */}
            <div className={"equalization__shelf"}>
              <div className={"equalization__weights"}>
                {/* Map over weight items in state, rendering a <Weight /> for each */}
                {currentGameState.weights.map((value: EqualizationItem, index: number) => {
                  return <Weight key={index} index={index} weightItem={value} />;
                })}
              </div>
              <div className={"equalization__fruits-background"}>
                <div className={"equalization__fruits-boxes"}>
                  {/* FruitBox for isolated variable on the left */}
                  <FruitBox
                    source={DragSource.FruitsLeft}
                    item={exercise.isolatedVariable.toItem(
                      EqualizationItemType.IsolatedVariable
                    )}
                    containsItems={currentGameState.isolatedVariableCount > 0}
                  />
                  {/* FruitBox for second variable on the right */}
                  <FruitBox
                    source={DragSource.FruitsRight}
                    item={exercise.secondVariable.toItem(
                      EqualizationItemType.SecondVariable
                    )}
                    containsItems={currentGameState.secondVariableCount > 0}
                  />
                </div>
              </div>
            </div>

            {/* Right panel: the scale area */}
            <div className={"scale-container"} ref={scaleRef}>
              {/* Show digital vs balance scale depending on phase */}
              {goal.gamePhase === EqualizationGamePhase.SolvingSystem ? (
                <DigitalScale
                  items={currentGameState.leftItems}
                  isValidDropzone={isValidDropzone}
                />
              ) : (
                <BalanceScale
                  exercise={exercise}
                  leftItems={currentGameState.leftItems}
                  rightItems={currentGameState.rightItems}
                  isValidDropzone={isValidDropzone}
                />
              )}
            </div>
          </div>

          {/* DragOverlay renders the dragged item following your cursor/finger */}
          {draggedItem[0] !== null && (
            <DragOverlay>
              <div className={"draggable-item__container--3rem"}>
                <DraggableImage
                  isVisible={true}
                  imageName={draggedItem[0]!}
                />
              </div>
            </DragOverlay>
          )}
        </DndContext>

        {/* Footer with undo/redo, verify button, and hints */}
        <div className={"equalization__footer"}>
          <div className={"equalization__button-group"}>
            <button
              className={"button primary-button"}
              disabled={currentStep < 1 || showTransparentOverlay}
              onClick={undoLastStep}
            >
              <FontAwesomeIcon icon={faRotateLeft} />
            </button>
            <button
              className={"button primary-button"}
              disabled={currentStep >= gameHistory.length - 1 || showTransparentOverlay}
              onClick={loadPreviousState}
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
          </div>

          {/* Show feedback message if feedback[0] is true */}
          {feedback[0] && (
            <div className={"equalization__feedback"}>{feedback[1]}</div>
          )}

          <div className={"equalization__button-group"}>
            {/* The main "verify" button changes its label & handler based on phase */}
            {goal.gamePhase === EqualizationGamePhase.SolvingSystem ? (
              <button
                className={"button primary-button"}
                onClick={verifyWeight}
                disabled={showTransparentOverlay}
              >
                {t(EqualizationTranslations.ADOPT_WEIGHT, {
                  ns: TranslationNamespaces.Equalization
                })}
                <FontAwesomeIcon icon={faCheck} />
              </button>
            ) : (
              <button
                className={"button primary-button"}
                onClick={
                  goal.gamePhase === EqualizationGamePhase.Equalization
                    ? verifyEqualization
                    : verifySimplification
                }
                disabled={showTransparentOverlay}
              >
                {t(GeneralTranslations.BUTTON_VERIFY, {
                  ns: TranslationNamespaces.General
                })}
                <FontAwesomeIcon icon={faCheck} />
              </button>
            )}

            {/* Hint popover shows hint text from our hints[] state */}
            <HintPopover
              hints={hints}
              namespaces={[TranslationNamespaces.Equalization]}
              disabled={!showHints}
              trackHint={trackHintInPhase}
            />
          </div>
        </div>

        {/* If the user asked for an explanation, highlight parts of the UI */}
        {showScaleSystemRelation && (
          <HighlightedArea
            scaleRect={computeBoundingBoxOfScale()}
            systemRect={computeBoundingBoxOfSystem()}
            gameState={currentGameState}
            exercise={exercise}
          />
        )}
      </div>
    </React.Fragment>
  );

  /* Below this line: all the event handlers and helper functions for drag & drop, verification logic, etc. */

  /**
   * Called when dragging starts. We store which item is being dragged
   * so we can render it in the DragOverlay.
   */
  function handleDragStart(event: any): void {
    const source = event.active.data.current.source;
    if (source === DragSource.FruitsLeft || source === DragSource.FruitsRight) {
      setDraggedItem([event.active.data.current.item.name, source]);
    } else {
      // We only show an image when dragging fruits, not weights
      setDraggedItem([null, source]);
    }
  }

  /**
   * Checks if dropping back into the origin zone should be disallowed.
   * For example, you can't drop an item into the exact same bucket you took it from.
   */
  function isValidDropzone(target: DragSource): boolean {
    return target !== draggedItem[1];
  }

  /**
   * Checks if there's room on the target pan/scale for another item.
   * Each scale has a maximum based on the exercise or
   * a global constant if none is provided.
   */
  function isSpaceAvailable(target: DragSource): boolean {
    if (goal.gamePhase === EqualizationGamePhase.SolvingSystem) {
      // Digital scale has its own max capacity
      return (
        currentGameState.leftItems.length < EqualizationConstants.MAX_ITEMS_DIG_SCALE
      );
    }
    // Classic balance scale uses left/right capacity constants
    const maxCap = exercise.maximumCapacity ?? EqualizationConstants.MAX_ITEMS_SCALE;
    return !(
      (target === DragSource.BalanceScaleLeft &&
        currentGameState.leftItems.length >= maxCap) ||
      (target === DragSource.BalanceScaleRight &&
        currentGameState.rightItems.length >= maxCap)
    );
  }

  /**
   * Called when the drag operation ends (mouse/finger released).
   * We handle adding/removing items from left/right shelving areas or weights,
   * tracking analytics, updating history, and moving to the next history step.
   */
  function handleDragEnd(event: any): void {
    // Clear the draggedItem so DragOverlay disappears
    setDraggedItem([null, null]);

    const { over, active } = event;

    // If dropped back into the same source zone, just track and exit
    if (over !== null && over.data.current.target === active.data.current.source) {
      let sourceName = "";
      if (active.data.current.source === DragSource.BalanceScaleLeft) {
        sourceName = "ScaleLeft";
      } else if (active.data.current.source === DragSource.BalanceScaleRight) {
        sourceName = "ScaleRight";
      }
      trackActionInPhase(
        `DROP ${event.active.data.current.item.name} at target=source=${sourceName}`
      );
      return;
    }

    // We copy current state variables so we can mutate them immutably via Immer below
    let isolatedVariableCount = currentGameState.isolatedVariableCount;
    let secondVariableCount = currentGameState.secondVariableCount;
    let leftItems = currentGameState.leftItems;
    let rightItems = currentGameState.rightItems;
    let weights = currentGameState.weights;

    // We switch on where the dragged item came from (fruits, weights, or scale)
    switch (active.data.current.source) {
      case DragSource.FruitsLeft: {
        // If we dropped outside or target is full, track invalid drop and return
        if (over === null || !isSpaceAvailable(over.data.current.target)) {
          if (over === null) {
            trackActionInPhase(
              `DRAG ${exercise.isolatedVariable.name} from FruitsLeft to NULL`
            );
          } else {
            const targetName =
              over.data.current.target === DragSource.BalanceScaleLeft
                ? "LeftScale"
                : "RightScale";
            trackActionInPhase(
              `DROP INVALID at ${targetName} for dragged ${
                exercise.isolatedVariable.name
              } from FruitsLeft`
            );
          }
          return;
        }

        // Otherwise we remove one fruit from the shelf
        isolatedVariableCount--;

        // Then we add to left or right pan based on drop target
        if (
          over.data.current.target === DragSource.BalanceScaleLeft ||
          over.data.current.target === DragSource.DigitalScale
        ) {
          leftItems = produce(currentGameState.leftItems, draft => {
            draft.push(
              exercise.isolatedVariable.toItem(EqualizationItemType.IsolatedVariable)
            );
          });
          trackActionInPhase(
            `DRAG ${exercise.isolatedVariable.name} from FruitsLeft to ${
              over.data.current.target === DragSource.BalanceScaleLeft
                ? "ScaleLeft"
                : "DigitalScale"
            }`
          );
        } else {
          rightItems = produce(currentGameState.rightItems, draft => {
            draft.push(
              exercise.isolatedVariable.toItem(EqualizationItemType.IsolatedVariable)
            );
          });
          trackActionInPhase(
            `DRAG ${exercise.isolatedVariable.name} from FruitsLeft to ScaleRight`
          );
        }

        break;
      }

      case DragSource.FruitsRight: {
        // Same logic as FruitsLeft but for the second variable
        if (over === null || !isSpaceAvailable(over.data.current.target)) {
          if (over === null) {
            trackActionInPhase(
              `DRAG ${exercise.secondVariable.name} from FruitsRight to NULL`
            );
          } else {
            const targetName =
              over.data.current.target === DragSource.BalanceScaleLeft
                ? "LeftScale"
                : "RightScale";
            trackActionInPhase(
              `DROP INVALID at ${targetName} for dragged ${
                exercise.secondVariable.name
              } from FruitsRight`
            );
          }
          return;
        }

        secondVariableCount--;

        if (
          over.data.current.target === DragSource.BalanceScaleLeft ||
          over.data.current.target === DragSource.DigitalScale
        ) {
          leftItems = produce(currentGameState.leftItems, draft => {
            draft.push(
              exercise.secondVariable.toItem(EqualizationItemType.SecondVariable)
            );
          });
          trackActionInPhase(
            `DRAG ${exercise.secondVariable.name} from FruitsRight to ${
              over.data.current.target === DragSource.BalanceScaleLeft
                ? "ScaleLeft"
                : "DigitalScale"
            }`
          );
        } else {
          rightItems = produce(currentGameState.rightItems, draft => {
            draft.push(
              exercise.secondVariable.toItem(EqualizationItemType.SecondVariable)
            );
          });
          trackActionInPhase(
            `DRAG ${exercise.secondVariable.name} from FruitsRight to ScaleRight`
          );
        }

        break;
      }

      case DragSource.Weights: {
        // Dragging a weight icon: if invalid drop, track and return
        if (over === null || !isSpaceAvailable(over.data.current.target)) {
          if (over === null) {
            trackActionInPhase(
              `DRAG ${event.active.data.current.item.name} from Weights to NULL`
            );
          } else {
            const targetName =
              over.data.current.target === DragSource.BalanceScaleLeft
                ? "LeftScale"
                : "RightScale";
            trackActionInPhase(
              `DROP INVALID at ${targetName} for dragged ${
                event.active.data.current.item.name
              } from Weights`
            );
          }
          return;
        }

        // Remove one unit of that weight from our shelf (maybe it had multiple)
        const count = currentGameState.weights[active.data.current.index].amount;
        if (count === 1) {
          // If only one left, remove the entry entirely
          weights = produce(currentGameState.weights, draft => {
            draft.splice(active.data.current.index, 1);
          });
        } else {
          // Otherwise decrement the count
          weights = produce(currentGameState.weights, draft => {
            draft[active.data.current.index].amount = count - 1;
          });
        }

        // Now add it to left or right pan
        const newWeightItem = {
          ...currentGameState.weights[active.data.current.index],
          amount: 1
        } as EqualizationItem;

        if (
          over.data.current.target === DragSource.BalanceScaleLeft ||
          over.data.current.target === DragSource.DigitalScale
        ) {
          leftItems = produce(currentGameState.leftItems, draft => {
            draft.push(newWeightItem);
          });
          trackActionInPhase(
            `DRAG ${event.active.data.current.item.name} from Weights to ${
              over.data.current.target === DragSource.BalanceScaleLeft
                ? "ScaleLeft"
                : "DigitalScale"
            }`
          );
        } else {
          rightItems = produce(currentGameState.rightItems, draft => {
            draft.push(newWeightItem);
          });
          trackActionInPhase(
            `DRAG ${event.active.data.current.item.name} from Weights to ScaleRight`
          );
        }

        break;
      }

      case DragSource.BalanceScaleLeft:
      case DragSource.BalanceScaleRight: {
        // Moving an item from one pan to another or back to shelf
        const sourceName =
          active.data.current.source === DragSource.BalanceScaleLeft
            ? "ScaleLeft"
            : "ScaleRight";

        // If dropped where there's no space, track invalid and return
        if (over !== null && !isSpaceAvailable(over.data.current.target)) {
          trackActionInPhase(
            `DROP INVALID at ${over.data.current.target} for dragged ${
              event.active.data.current.item.name
            } from ${sourceName}`
          );
          return;
        }

        // Remove from the source pan
        if (active.data.current.source === DragSource.BalanceScaleLeft) {
          leftItems = produce(currentGameState.leftItems, draft => {
            draft.splice(active.data.current.index, 1);
          });
        } else {
          rightItems = produce(currentGameState.rightItems, draft => {
            draft.splice(active.data.current.index, 1);
          });
        }

        if (over === null) {
          // Dropped back to "nowhere"—so return to the fruit/weight shelf
          const item = active.data.current.item as EqualizationItem;
          switch (item.itemType) {
            case EqualizationItemType.IsolatedVariable:
              isolatedVariableCount++;
              break;
            case EqualizationItemType.SecondVariable:
              secondVariableCount++;
              break;
            default:
              // We need to put the weight back into the weights list
              const index = currentGameState.weights.findIndex(
                (entry: EqualizationItem) => entry.name === item.name
              );
              weights = returnWeight(index, item);
          }
          trackActionInPhase(`REMOVE ${event.active.data.current.item.name} from ${sourceName}`);
        } else {
          // Dropped onto the opposite pan
          if (active.data.current.source === DragSource.BalanceScaleLeft) {
            rightItems = produce(currentGameState.rightItems, draft => {
              draft.push({
                ...currentGameState.leftItems[active.data.current.index],
                amount: 1
              } as EqualizationItem);
            });
            trackActionInPhase(
              `DRAG ${event.active.data.current.item.name} from ScaleLeft to ScaleRight`
            );
          } else {
            leftItems = produce(currentGameState.leftItems, draft => {
              draft.push({
                ...currentGameState.rightItems[active.data.current.index],
                amount: 1
              } as EqualizationItem);
            });
            trackActionInPhase(
              `DRAG ${event.active.data.current.item.name} from ScaleRight to ScaleLeft`
            );
          }
        }

        break;
      }

      case DragSource.DigitalScale: {
        // Digital scale droppable area: only has leftItems list
        leftItems = produce(currentGameState.leftItems, draft => {
          draft.splice(active.data.current.index, 1);
        });

        // If it was a second variable, return to shelf count; if a weight, return weight object
        const item = active.data.current.item as EqualizationItem;
        switch (item.itemType) {
          case EqualizationItemType.SecondVariable:
            secondVariableCount++;
            break;
          default:
            const wIndex = currentGameState.weights.findIndex(
              (entry: EqualizationItem) => entry.name === item.name
            );
            weights = returnWeight(wIndex, item);
            break;
        }
        trackActionInPhase(
          `REMOVE ${event.active.data.current.item.name} from DigitalScale`
        );
        break;
      }
    }

    // After handling the drop logic, we push a new state into our gameHistory
    setGameHistory(
      produce(draft => {
        draft[currentStep + 1] = new EqualizationGameState(
          isolatedVariableCount,
          secondVariableCount,
          weights,
          leftItems,
          rightItems
        );
      })
    );

    // Step forward to the newly added state
    setCurrentStep(currentStep + 1);
  }

  /**
   * If a weight was returned to shelf, this helper adds it back to the weights array,
   * incrementing its amount if it already exists, or pushing a brand new entry.
   */
  function returnWeight(index: number, item: EqualizationItem): EqualizationItem[] {
    if (index === -1) {
      // Never existed before—push new
      return produce(currentGameState.weights, draft => {
        draft.push({
          ...item,
          amount: 1
        } as EqualizationItem);
      });
    } else {
      // Already in shelf—increment count
      return produce(currentGameState.weights, draft => {
        draft[index] = {
          ...currentGameState.weights[index],
          amount: currentGameState.weights[index].amount + 1
        } as EqualizationItem;
      });
    }
  }

  /**
   * Undo moves one step back in the history, if possible.
   */
  function undoLastStep(): void {
    if (currentStep >= 1 && gameHistory.length >= currentStep) {
      setCurrentStep(currentStep - 1);
    }
    trackActionInPhase("UNDO");
  }

  /**
   * Redo moves one step forward in the history, if possible.
   */
  function loadPreviousState(): void {
    if (currentStep < gameHistory.length) {
      setCurrentStep(currentStep + 1);
    }
    trackActionInPhase("REDO");
  }

  /**
   * verifyEqualization checks that both pans have equal total weight,
   * then checks that we've used the correct counts of each variable.
   * If everything matches our `goal`, we proceed to the next instruction.
   */
  function verifyEqualization(): void {
    const [leftWeight, rightWeight] = calculateWeightPerPan();

    if (leftWeight === rightWeight) {
      const [countLeft, countRight] = calculateSecondVariablePerPan();
      const satisfiesCount = satisfiesSecondVariableCount(countLeft, countRight);

      if (
        goal.expectedWeight === leftWeight &&
        satisfiesCount
      ) {
        // Right answer—lock out UI, hide hints, go to next instruction
        setShowTransparentOverlay(true);
        setShowHints(false);
        setInstructionType(InstructionType.ScaleAndSystemRelation);
      } else {
        // Not quite right—show feedback
        trackErrorInPhase();

        if (leftWeight === 0) {
          showFeedbackForEmptyScale();
        } else if (scaleContainsIsolatedVariable()) {
          trackActionInPhase("ERROR: scale contains ISOLATED");
          const fb = EqualizationTranslations.getFeedbackForIsolatedVariableOnEqualization(
            exercise
          );
          displayFeedBack(
            setFeedback,
            <p>
              <Trans
                ns={TranslationNamespaces.Equalization}
                i18nKey={fb.translationKey}
                values={fb.interpolationVariables as object}
              />
            </p>
          );
        } else {
          trackActionInPhase("ERROR: INVALID balance");
          const fb = EqualizationTranslations.getFeedbackForInvalidBalanceOnEqualization(
            exercise
          );
          displayFeedBack(
            setFeedback,
            <p>
              <Trans
                ns={TranslationNamespaces.Equalization}
                i18nKey={fb.translationKey}
                values={fb.interpolationVariables as object}
              />
            </p>
          );
        }
      }
    } else {
      // Weights differ—imbalance
      showFeedbackForImbalance();
    }
  }

  /**
   * Similar to verifyEqualization but for the "simplification" phase:
   * after removing common factors, check balance & hint about next step if needed.
   */
  function verifySimplification(): void {
    const [leftWeight, rightWeight] = calculateWeightPerPan();

    if (leftWeight === rightWeight) {
      const [countLeft, countRight] = calculateSecondVariablePerPan();
      const satisfiesCount = satisfiesSecondVariableCount(countLeft, countRight);

      if (
        goal.expectedWeight === leftWeight &&
        satisfiesCount
      ) {
        // Move to determining second variable step
        setShowTransparentOverlay(true);
        setNextTrackingPhase(EqualizationPhase.FirstSolution);
        setInstructionType(InstructionType.DeterminingSecondVariable);
        setHints(
          EqualizationTranslations.getSecondVariableHints(
            exercise,
            currentGameState.leftItems,
            currentGameState.rightItems
          )
        );
      } else {
        // Feedback branch logic for simplification errors
        trackErrorInPhase();
        if (leftWeight === 0) {
          showFeedbackForEmptyScale();
        } else if (scaleContainsIsolatedVariable()) {
          trackActionInPhase("ERROR: scale contains ISOLATED");
          displayFeedBack(
            setFeedback,
            <p>
              {t(EqualizationTranslations.FEEDBACK_SIMPLIFICATION_ISO, {
                ns: TranslationNamespaces.Equalization
              })}
            </p>
          );
        } else if (
          (countLeft >= goal.expectedCountLeft &&
            countRight >= goal.expectedCountRight) ||
          (countRight >= goal.expectedCountLeft &&
            countLeft >= goal.expectedCountRight)
        ) {
          trackActionInPhase("ERROR: SIMPLIFICATION required");
          displayFeedBack(
            setFeedback,
            <p>
              {t(EqualizationTranslations.FEEDBACK_SIMPLIFICATION_REQ, {
                ns: TranslationNamespaces.Equalization
              })}
            </p>
          );
        } else {
          trackActionInPhase("ERROR: INVALID balance");
          displayFeedBack(
            setFeedback,
            <p>
              {t(EqualizationTranslations.FEEDBACK_SIMPLIFICATION_INV, {
                ns: TranslationNamespaces.Equalization
              })}
            </p>
          );
        }
      }
    } else {
      showFeedbackForImbalance();
    }
  }

  /**
   * Helper: sum numeric weights of items in each pan.
   */
  function calculateWeightPerPan(): [number, number] {
    const leftWeight = sumWeightOfItems(currentGameState.leftItems);
    const rightWeight = sumWeightOfItems(currentGameState.rightItems);
    return [leftWeight, rightWeight];
  }

  /**
   * Helper: count how many "second variable" items are on each pan.
   */
  function calculateSecondVariablePerPan(): [number, number] {
    const countLeft = countSecondVariable(currentGameState.leftItems);
    const countRight = countSecondVariable(currentGameState.rightItems);
    return [countLeft, countRight];
  }

  /**
   * Checks if the counts match our goal counts, in either order (swapped pans).
   */
  function satisfiesSecondVariableCount(
    countLeft: number,
    countRight: number
  ): boolean {
    return (
      (countLeft === goal.expectedCountLeft &&
        countRight === goal.expectedCountRight) ||
      (countRight === goal.expectedCountLeft &&
        countLeft === goal.expectedCountRight)
    );
  }

  /**
   * Detect if any isolated variable ended up on the scale,
   * which is disallowed for certain steps.
   */
  function scaleContainsIsolatedVariable(): boolean {
    const leftHasIso = currentGameState.leftItems.some(
      item => item.itemType === EqualizationItemType.IsolatedVariable
    );
    const rightHasIso = currentGameState.rightItems.some(
      item => item.itemType === EqualizationItemType.IsolatedVariable
    );
    return leftHasIso || rightHasIso;
  }

  /**
   * Show a message when user tries to verify an empty scale.
   */
  function showFeedbackForEmptyScale(): void {
    trackActionInPhase("ERROR: EMPTY scale");
    displayFeedBack(
      setFeedback,
      <p>{t(EqualizationTranslations.FEEDBACK_EMPTY_SCALE, {
        ns: TranslationNamespaces.Equalization
      })}</p>
    );
  }

  /**
   * Show a message when scale is simply unbalanced.
   */
  function showFeedbackForImbalance(): void {
    trackErrorInPhase();
    trackActionInPhase("ERROR: IMBALANCED scale");
    displayFeedBack(
      setFeedback,
      <p>{t(EqualizationTranslations.FEEDBACK_IMBALANCE, {
        ns: TranslationNamespaces.Equalization
      })}</p>
    );
  }

  /**
   * Final verification of the isolated variable's weight in solving the system.
   */
  function verifyWeight(): void {
    const weight = sumWeightOfItems(currentGameState.leftItems);
    if (weight === exercise.isolatedVariable.weight) {
      endTrackingPhase();
      endTracking();
      setShowTransparentOverlay(true);
      setShowHints(false);
      setInstructionType(InstructionType.Solution);
    } else {
      trackErrorInPhase();
      trackActionInPhase("ERROR: WEIGHT INVALID");
      displayFeedBack(
        setFeedback,
        <p>{t(EqualizationTranslations.FEEDBACK_INV_WEIGHT, {
          ns: TranslationNamespaces.Equalization
        })}</p>
      );
    }
  }

  /**
   * When user clicks "Explain relation", show highlight and switch instructions.
   */
  function explainScaleAndSystemRelation(): void {
    setShowScaleSystemRelation(true);
    setInstructionType(InstructionType.RelationReason);
  }

  /**
   * Move from relation phase into the simplification practice phase.
   */
  function loadSimplificationPhase(): void {
    setNextTrackingPhase(EqualizationPhase.Simplification);
    setGoal(Goal.getSimplificationGoal(exercise));
    setHints(
      EqualizationTranslations.getSimplificationHints(
        exercise,
        currentGameState.leftItems,
        currentGameState.rightItems
      )
    );
    setInstructionType(InstructionType.Simplification);
    setShowScaleSystemRelation(false);
    setShowHints(true);
    // Reset history so user starts fresh on simplification
    setGameHistory([gameHistory[currentStep]]);
    setCurrentStep(0);
    setShowTransparentOverlay(false);
  }

  /**
   * After simplifying and determining the second variable, move to the final solution step.
   */
  function loadSolutionPhase(): void {
    setNextTrackingPhase(EqualizationPhase.SecondSolution);
    setGoal(Goal.getSolutionGoal());
    setCurrentStep(0);
    setGameHistory([
      EqualizationGameState.setGameStateForSolutionPhase(exercise)
    ]);
    setHints(EqualizationTranslations.getIsolatedVariableHints(exercise));
    setInstructionType(InstructionType.DeterminingIsolatedVariable);
    setShowTransparentOverlay(false);
  }

  /**
   * Compute the bounding rectangle of the scale element on screen.
   * This helps us position the HighlightedArea overlay correctly.
   */
  function computeBoundingBoxOfScale(): DOMRect | undefined {
    if (scaleRef.current) {
      return scaleRef.current.getBoundingClientRect();
    }
    return undefined;
  }

  /**
   * Compute bounding rectangle of the system image for HighlightedArea.
   */
  function computeBoundingBoxOfSystem(): DOMRect | undefined {
    if (systemRef.current) {
      return systemRef.current.getBoundingClientRect();
    }
    return undefined;
  }
}
