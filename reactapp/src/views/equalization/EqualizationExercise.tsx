// Importing a custom React hook to make HTTP requests easily using Axios library.
// Axios is like a tool that helps your app talk to a backend server to get data.
import useAxios from "axios-hooks";

// Importing a helper function from class-transformer library.
// It converts plain data (JSON) into objects of a specific class,
// so you can use the methods and properties defined in that class.
import { plainToClass } from "class-transformer";

// Importing the type for React components that return JSX (ReactElement).
// ReactElement is basically the object representation of your UI elements.
import { ReactElement } from "react";

// Importing the TypeScript type for the EqualizationExercise data structure.
// This defines what properties the exercise data should have.
// The 'as EqualizationExerciseProps' in the code will ensure type safety.
import { EqualizationExercise as EqualizationExerciseProps } from "@/types/equalization/equalizationExercise.ts";

// Importing some predefined error messages translations.
// Useful for showing user-friendly error texts depending on the situation.
import { ErrorTranslations } from "@/types/shared/errorTranslations.ts";

// Importing general UI text translations used throughout the app.
import { GeneralTranslations } from "@/types/shared/generalTranslations.ts";

// Importing the React component responsible for showing the actual equalization game UI.
import EqualizationGame from "@components/equalization/EqualizationGame.tsx";

// Importing a component that shows an error screen when something goes wrong.
import ErrorScreen from "@components/shared/ErrorScreen.tsx";

// Importing an overlay component that allows users to continue to the next exercise after finishing the current one.
import { ContinueWithNextExerciseOverlay } from "@components/shared/ExerciseOverlay.tsx";

// Importing a loader/spinner component to indicate data is loading.
import Loader from "@components/shared/Loader.tsx";

// Importing a higher-level wrapper component that manages exercise navigation and layout.
import CKExercise from "@components/views/CKExercise.tsx";

// Importing routing paths and helper function to build API paths for fetching exercise data.
import { Paths, getPathToExercise } from "@routes/paths.ts";

// Importing stylesheets (CSS/SCSS) that style the equalization page and draggable UI elements.
// Stylesheets control how things look on the page.
import "@styles/equalization/equalization.scss";
import "@styles/shared/draggable.scss";


// The main React component exported from this file.
// This function returns JSX that React uses to render UI on the page.
export default function EqualizationExercise(): ReactElement {
    // We use CKExercise component as a layout/container.
    // It handles common features for exercise pages like:
    // - Knowing where to navigate back to (routeToReturn)
    // - Showing main and sub-route titles (breadcrumbs/navigation labels)
    // - Rendering the actual exercise UI through the renderExercise callback.
    // The renderExercise callback is called by CKExercise with the exercise id and list of exercises,
    // and it returns the JSX for the actual exercise component.
    return (
        <CKExercise
            routeToReturn={Paths.EqualizationPath}  // Where the "Back" button should go
            mainRoute={GeneralTranslations.EQUALIZATION}  // Main title of the section
            subRoute={GeneralTranslations.NAV_GAME}  // Subtitle or subsection label
            renderExercise={(exerciseId: number, exercises?: number[]) => (
                // This calls the Exercise component passing the current exerciseId and optional list of exercises
                <Exercise exerciseId={exerciseId} exercises={exercises} />
            )}
        />
    );
}


// This is the component responsible for:
// 1. Fetching the data for the specific exercise from the server
// 2. Handling loading and error states while data is fetched
// 3. Initializing the exercise data structure
// 4. Rendering the actual game UI when ready
function Exercise({ exerciseId, exercises }: { exerciseId: number; exercises?: number[] }): ReactElement {
    // useAxios is a React hook that automatically sends an HTTP GET request to the given URL
    // It returns an array where the first element is an object with 'data', 'loading', and 'error' properties.
    // - data: the data returned from the server (or undefined if not loaded yet)
    // - loading: true if the request is in progress
    // - error: any error encountered during fetching
    const [{ data, loading, error }] = useAxios(getPathToExercise(Paths.EqualizationGamePath, exerciseId));

    // If the request is still loading, show a spinner or loader to indicate to user "please wait"
    if (loading) return <Loader />;

    // If there was an error while fetching data, show an error screen.
    // Also, log the error to the console for debugging.
    if (error) {
        console.error(error);  // For developers to see what went wrong in browser console
        return (
            <ErrorScreen
                text={ErrorTranslations.ERROR_LOAD}  // User-friendly error message
                routeToReturn={Paths.EqualizationPath}  // Where to go back from error screen
                showFrownIcon={true}  // Show a sad face icon for visual effect
            />
        );
    }

    // Once the data is loaded successfully, it will be plain JSON (simple JavaScript object).
    // But we want to convert it into an instance of the EqualizationExercise class,
    // so that it has all class methods available (like initializeItemArrays).
    const equalizationExercise: EqualizationExerciseProps = plainToClass(EqualizationExerciseProps, data as EqualizationExerciseProps);

    // These two lines initialize some internal data structures (arrays) inside the exercise,
    // presumably to prepare the equations for rendering or game logic.
    equalizationExercise.firstEquation.initializeItemArrays(equalizationExercise);
    equalizationExercise.secondEquation.initializeItemArrays(equalizationExercise);

    // Finally, render the EqualizationGame UI component,
    // passing the fully prepared exercise data as a prop.
    // Also, pass an overlay component that shows buttons or navigation after completing the exercise.
    return (
        <EqualizationGame
            key={equalizationExercise.id}  // React uses keys to efficiently update the UI
            exercise={equalizationExercise}  // The data for the exercise
            actionOverlay={
                <ContinueWithNextExerciseOverlay
                    currentExercise={exerciseId}  // Current exercise id
                    exercises={exercises}  // List of all exercise ids (optional)
                    routeToReturn={Paths.EqualizationPath}  // Where to go back after finishing
                    routeToNextExercise={Paths.EqualizationGamePath + Paths.ExercisesSubPath}  // Path for the next exercise
                />
            }
        />
    );
}
