/**
 * CKExercise.tsx
 *
 * A generic “exercise wrapper” for Conceptual Knowledge (CK) flows.
 * It handles:
 *  - Extracting the exerciseId from the URL
 *  - Error boundaries in case rendering fails
 *  - A top NavigationBar with exit/home controls
 *  - A modal to confirm exiting the exercise
 *  - An orientation reminder modal for device rotation
 *  - Delegating actual exercise UI to a provided renderExercise function
 */

import { ReactElement, useState } from "react";
// ReactElement is the TypeScript type for JSX return values.
// useState is a React hook for managing local component state.

import { ErrorBoundary } from "react-error-boundary";
// ErrorBoundary catches JavaScript errors in its child component tree
// and shows a fallback UI instead of crashing the entire app.

import { useLocation, useParams } from "react-router-dom";
// useLocation gives us the current URL and optional state passed via navigation.
// useParams reads dynamic URL segments, like ":exerciseId".

import { ErrorTranslations } from "@/types/shared/errorTranslations.ts";
// A map of translation keys for error messages.

import ErrorScreen from "@components/shared/ErrorScreen.tsx";
// A reusable full-page error UI that shows a message and a “go back” button.

import { ExitExerciseOverlay } from "@components/shared/ExerciseOverlay.tsx";
// A modal overlay that asks “Are you sure you want to exit?” with Yes/No options.

import NavigationBar from "@components/shared/NavigationBar.tsx";
// Top navigation bar with back/home buttons and exercise progress indicator.

import OrientationModal from "@components/shared/OrientationModal.tsx";
// A simple modal reminding the user to rotate their device if in landscape/portrait.

import { getExerciseNumber, handleNavigationClick } from "@utils/utils.ts";
// Utility to compute the current exercise index and handle nav button clicks.

/**
 * CKExercise Props:
 *
 * @param routeToReturn  - the path to navigate back to on errors or exit
 * @param mainRoute      - the label/route for the “home” button in the navbar
 * @param subRoute       - the label/route for the “back” button in the navbar
 * @param renderExercise - a function that actually renders the exercise UI given an ID
 */
export default function CKExercise({
  routeToReturn,
  mainRoute,
  subRoute,
  renderExercise
}: {
  routeToReturn: string;
  mainRoute: string;
  subRoute: string;
  renderExercise: (exerciseId: number, exercises?: number[]) => ReactElement;
}): ReactElement {
  /**
   * exitOverlay state holds two booleans:
   * [0] = whether the “ExitExerciseOverlay” is visible
   * [1] = when exiting, should we return all the way home (true) or just back (false)
   */
  const [exitOverlay, setExitOverlay] = useState<[boolean, boolean]>([false, false]);

  // Grab the current URL location object, including any `state` passed via navigation.
  const location = useLocation();

  // Read the dynamic URL parameter ":exerciseId".
  // If the route is something like "/ck/5", this gives us { exerciseId: "5" }.
  const { exerciseId } = useParams();

  // If exerciseId is missing or literally the string "undefined", show a friendly error screen.
  if (exerciseId === undefined || exerciseId === "undefined") {
    return (
      <ErrorScreen
        text={ErrorTranslations.ERROR_EXERCISE_ID}
        routeToReturn={routeToReturn}
        showFrownIcon={true}
      />
    );
  }

  // Convert the exerciseId string into a number so we can use it in logic.
  const id: number = parseInt(exerciseId);

  /**
   * getExerciseNumber finds the index of `id` in the optional array
   * `location.state?.exercises` so the NavigationBar can show progress like “3/10”.
   * If no list was passed, currentExercise may be undefined.
   */
  const currentExercise: number | undefined = getExerciseNumber(
    id,
    location.state?.exercises
  );

  /**
   * Wrap the entire UI in an ErrorBoundary keyed by `location.pathname`,
   * so if something inside crashes, we show a fallback error screen
   * with the option to return to `routeToReturn`.
   */
  return (
    <ErrorBoundary
      key={location.pathname}
      FallbackComponent={() => (
        <ErrorScreen
          text={ErrorTranslations.ERROR_RETURN}
          routeToReturn={routeToReturn}
        />
      )}
    >
      {/*
        The outer container that fills the viewport.
      */}
      <div className="full-page">
        {/*
          Top navigation bar:
          - mainRoute: where the “home” button goes
          - subRoute: where the “back” button goes
          - handleSelection: callback when user clicks home/back
          - currentExercise: the 1-based index to highlight in the progress dots
          - exercisesCount: total number of exercises (for progress indicators)
        */}
        <NavigationBar
          mainRoute={mainRoute}
          subRoute={subRoute}
          handleSelection={(isHome: boolean) =>
            handleNavigationClick(isHome, setExitOverlay)
          }
          currentExercise={currentExercise}
          exercisesCount={location.state?.exercises?.length ?? undefined}
        />

        {/*
          Render the actual exercise UI, passing:
          - id: the numeric exerciseId
          - exercises list (optional): so exercises can know the whole sequence
        */}
        {renderExercise(id, location.state?.exercises ?? undefined)}
      </div>

      {/*
        If exitOverlay[0] is true, show the confirmation modal
        asking “Do you really want to leave this exercise?”
        returnToHome = exitOverlay[1] tells the overlay if the user
        pressed “home” or “back.”
      */}
      {exitOverlay[0] && (
        <ExitExerciseOverlay
          returnToHome={exitOverlay[1]}
          routeToReturn={routeToReturn}
          closeOverlay={() => setExitOverlay([false, false])}
        />
      )}

      {/*
        Always include the orientation reminder modal.
        It will only show itself if the device orientation is not ideal.
      */}
      <OrientationModal />
    </ErrorBoundary>
  );
}
