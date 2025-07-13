/**
 * Instruction.tsx
 *
 * This file defines a set of React components that render the “instruction board”
 * for each step in the equalization game. Each component shows some text,
 * images, buttons or inputs, and we’ve added comments everywhere—even for
 * the most basic details.
 */

import React, {
  ReactElement,
  ReactNode,
  useRef,
  useState
} from "react";
// React is the main library for building UI.
// ReactElement is the type returned by components (i.e., JSX nodes).
// ReactNode covers anything you can render inside JSX (strings, elements, arrays).
// useState lets us keep internal component state.
// useRef gives us a way to hold a direct reference to a DOM node.

import { Trans, useTranslation } from "react-i18next";
// react-i18next is our i18n (internationalization) library.
// useTranslation gives us t(), the function to look up translated strings.
// Trans is a component that can render translated text with embedded variables or markup.

import { TranslationNamespaces } from "@/i18n.ts";
// We group translation keys into “namespaces” so we only load what we need per feature.

import { faArrowRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// FontAwesome: a popular icon library.
// We import two icons (arrow-right, check) and the React wrapper component.

import { evaluate } from "mathjs";
// mathjs lets us parse and evaluate math expressions like "3+4*2".

import { EqualizationExercise } from "@/types/equalization/equalizationExercise";
// This type describes the exercise data: which fruits/weights, equations, expected results.

import { EqualizationTranslations } from "@/types/equalization/equalizationTranslations.ts";
import { GeneralTranslations } from "@/types/shared/generalTranslations.ts";
// These modules hold translation keys specific to this exercise and general UI.

import { TranslationInterpolation } from "@/types/shared/translationInterpolation.ts";
// Describes an object with a translation key plus optional variables to interpolate.

import { getImageSourceByName } from "@utils/itemImageLoader.ts";
// A helper that, given an item name (e.g. "apple"), returns the image URL.

//
// 1) Main <Instruction> wrapper
//    - Draws the outer “instruction board” frame.
//    - Renders a paragraph of translated text.
//    - Renders any children passed inside (buttons, inputs).
//
export default function Instruction({
  translation,      // { translationKey: string, interpolationVariables?: {} }
  children          // Optional React nodes to render inside the board
}: {
  translation: TranslationInterpolation;
  children?: ReactNode;
}): ReactElement {
  // Pull t() from our i18n context. We declare which namespaces we might use.
  const { t } = useTranslation([
    TranslationNamespaces.Equalization,
    TranslationNamespaces.Variables
  ]);

  return (
    <div className="instruction-board">
      <div className="instruction-board__container">
        <div className="instruction-board__background">
          {/*
            If we have interpolation variables, use <Trans> so we can
            dynamically insert values into the translation string.
          */}
          {translation.interpolationVariables != null ? (
            <p>
              <Trans
                ns={[
                  TranslationNamespaces.Equalization,
                  TranslationNamespaces.Variables
                ]}
                i18nKey={translation.translationKey}
                values={translation.interpolationVariables}
              />
            </p>
          ) : (
            // Otherwise render a simple translated string.
            <p>
              {t(translation.translationKey, {
                ns: TranslationNamespaces.Equalization
              })}
            </p>
          )}
          {/* Render any nested children (buttons, input forms, etc.) */}
          {children}
        </div>

        {/*
          The “clamp” at the bottom shows a little label or icon
          that reminds the user which task they’re on.
        */}
        <div className="instruction-board__clamp">
          <p>
            {t(EqualizationTranslations.TASK_SIGN, {
              ns: TranslationNamespaces.Equalization
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

//
// 2) <InstructionForScaleAndSystemRelation>
//    Renders two buttons: Skip explanation or Show explanation.
//
export function InstructionForScaleAndSystemRelation({
  onContinue,  // Called if the user clicks “Continue”
  onExplain,   // Called if the user clicks “Explain”
  trackAction  // Analytics callback to record what they did
}: {
  onContinue: () => void;
  onExplain: () => void;
  trackAction: (action: string) => void;
}): ReactElement {
  const { t } = useTranslation([TranslationNamespaces.Equalization]);

  return (
    <div className="instruction-board__contents">
      <button
        className="button primary-button"
        onClick={() => {
          trackAction("SKIP equalization explanation");
          onContinue();
        }}
      >
        {t(EqualizationTranslations.CONTINUE)}
      </button>

      <button
        className="button primary-button"
        onClick={() => {
          trackAction("EXPLAIN equalization");
          onExplain();
        }}
      >
        {t(EqualizationTranslations.EXPLAIN)}
      </button>
    </div>
  );
}

//
// 3) <InstructionForContinuingWithSimplification>
//    A single “Continue” button to move to the next phase.
//
export function InstructionForContinuingWithSimplification({
  handleClick
}: {
  handleClick: () => void;
}): ReactElement {
  const { t } = useTranslation([TranslationNamespaces.General]);

  return (
    <button className="button primary-button" onClick={handleClick}>
      {t(GeneralTranslations.BUTTON_CONTINUE)}
    </button>
  );
}

//
// 4) <InstructionForSecondVariableInput>
//    Renders an image of the second variable, an input field for the user
//    to type an algebraic expression, and validation logic to check it.
//
export function InstructionForSecondVariableInput({
  exercise,                // Data for our exercise (includes secondVariable.weight)
  handleCorrectSolution,   // Called when input evaluates correctly
  trackAction,             // Analytics callback for successful attempts
  trackError               // Analytics callback for errors
}: {
  exercise: EqualizationExercise;
  handleCorrectSolution: () => void;
  trackAction: (action: string) => void;
  trackError: () => void;
}): ReactElement {
  const { t } = useTranslation([
    TranslationNamespaces.Variables,
    TranslationNamespaces.Equalization
  ]);

  // Local state for the text input and error flags:
  const [input, setInput] = useState("");
  const [validationError, setValidationError] = useState(false);
  const [warningIncorrectInput, setWarningIncorrectInput] =
    useState(false);

  // A ref to the <input> DOM node so we can call .focus() when validation fails.
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="instruction-board__contents">
        <div className="image-equation">
          <div className="image-equation__image">
            {/*
              Show an image (banana, apple, etc.) for the second variable.
              getImageSourceByName gives us the correct URL.
            */}
            <img
              src={getImageSourceByName(exercise.secondVariable.name)}
              alt={exercise.secondVariable.name}
            />
          </div>

          {/* The equals sign between the image and the input */}
          <p className="image-equation__operator">=</p>

          {/* The text input for algebraic expression */}
          <input
            autoFocus={!isTouchDevice()}
            className={`instruction-board__contents-input ${
              validationError || warningIncorrectInput ? "error" : ""
            }`}
            type="text"
            ref={inputRef}
            value={input}
            pattern="^[0-9+\-*/]*$"  // Only digits and basic operators
            maxLength={10}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
          />

          {/* Unit label "g" for grams */}
          <p> g</p>
        </div>

        {/* Button to submit the expression */}
        <button className="button primary-button" onClick={attemptSolution}>
          {t(GeneralTranslations.BUTTON_INSERT, {
            ns: TranslationNamespaces.General
          })}
          <FontAwesomeIcon icon={faCheck} />
        </button>
      </div>

      {/*
        Show validation feedback:
        - If the pattern is invalid or empty → validationError
        - If the expression is valid syntax but the result is wrong → warningIncorrectInput
      */}
      {validationError && (
        <p className="instruction-board__contents-feedback">
          {t(EqualizationTranslations.INPUT_VALIDATION_ERR, {
            ns: TranslationNamespaces.Equalization
          })}{" "}
          +, −, ×, ÷
        </p>
      )}
      {warningIncorrectInput && (
        <p className="instruction-board__contents-feedback">
          {t(EqualizationTranslations.INPUT_INCORRECT_INPUT, {
            ns: TranslationNamespaces.Equalization
          })}
        </p>
      )}
    </>
  );

  // Called when the input loses focus: checks HTML5 pattern and emptiness.
  function handleBlur(event: React.FocusEvent<HTMLInputElement>): void {
    if (
      !validationError &&
      (event.target.validity.patternMismatch || input === "")
    ) {
      // Force focus back to input and show a validation error.
      inputRef.current?.focus();
      setValidationError(true);
    }
  }

  // When the user presses Enter, treat it like clicking the submit button.
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      attemptSolution();
    }
  }

  // Keep the `input` state in sync with the text field,
  // and set/clear validation flags as needed.
  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (warningIncorrectInput) {
      setWarningIncorrectInput(false);
    }

    const isValid = !event.target.validity.patternMismatch;
    if (validationError && isValid) {
      setValidationError(false);
    } else if (!validationError && !isValid) {
      setValidationError(true);
    }
    setInput(event.target.value);
  }

  // Evaluate the expression via mathjs and compare to expected weight.
  function attemptSolution(): void {
    if (validationError) {
      return; // Don’t proceed if syntax is invalid
    }

    try {
      const evaluated = evaluate(input);
      if (evaluated === exercise.secondVariable.weight) {
        trackAction(`SOLUTION ${input}`);
        handleCorrectSolution();
      } else {
        trackError();
        trackAction(`Error: FALSE input ${input}`);
        setWarningIncorrectInput(true);
      }
    } catch {
      // mathjs threw an error for invalid expression
      trackError();
      trackAction(`Error: INVALID input ${input}`);
      setValidationError(true);
    }
  }

  // Simple check for touch devices (to decide whether to auto-focus).
  function isTouchDevice(): boolean {
    return (
      ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
      window.innerWidth <= 1300
    );
  }
}

//
// 5) <InstructionForDeterminingIsolatedVariable>
//    Shows two image-equations side by side:
//    [secondVariable image] = [number]    and    [isolatedVariable image] = [?]
//
export function InstructionForDeterminingIsolatedVariable({
  exercise
}: {
  exercise: EqualizationExercise;
}): ReactElement {
  return (
    <>
      <div
        className="instruction-board__contents"
        style={{ color: "var(--dark-text)" }}
        // Inline style just to darken the text for readability.
      >
        <div className="image-equation">
          <div className="image-equation__image">
            <img
              src={getImageSourceByName(exercise.secondVariable.name)}
              alt={exercise.secondVariable.name}
            />
          </div>
          <p className="image-equation__operator">=</p>
          <p>{exercise.secondVariable.weight} g</p>
        </div>

        <div className="image-equation">
          <div className="image-equation__image">
            <img
              src={getImageSourceByName(exercise.isolatedVariable.name)}
              alt={exercise.isolatedVariable.name}
            />
          </div>
          <p className="image-equation__operator">=</p>
          <p>?</p>
        </div>
      </div>
    </>
  );
}

//
// 6) <InstructionForSolution>
//    Final summary step: show both values, then a Continue button.
//
export function InstructionForSolution({
  exercise,
  handleClick
}: {
  exercise: EqualizationExercise;
  handleClick: () => void;
}): ReactElement {
  const { t } = useTranslation([TranslationNamespaces.General]);

  return (
    <>
      <div
        className="instruction-board__contents"
        style={{ color: "var(--dark-text)" }}
      >
        {/* secondVariable = known weight */}
        <div className="image-equation">
          <div className="image-equation__image">
            <img
              src={getImageSourceByName(exercise.secondVariable.name)}
              alt={exercise.secondVariable.name}
            />
          </div>
          <p className="image-equation__operator">=</p>
          <p>{exercise.secondVariable.weight} g</p>
        </div>

        {/* isolatedVariable = known weight */}
        <div className="image-equation">
          <div className="image-equation__image">
            <img
              src={getImageSourceByName(exercise.isolatedVariable.name)}
              alt={exercise.isolatedVariable.name}
            />
          </div>
          <p className="image-equation__operator">=</p>
          <p>{exercise.isolatedVariable.weight} g</p>
        </div>
      </div>

      {/* Button to finish and move on */}
      <button className="button primary-button" onClick={handleClick}>
        {t(GeneralTranslations.BUTTON_CONTINUE)}
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
    </>
  );
}
