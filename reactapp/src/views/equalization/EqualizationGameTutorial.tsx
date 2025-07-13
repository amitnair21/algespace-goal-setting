// Import React itself and some "hooks" from the React library.
// Hooks are special functions that let React components "remember" things and react to changes in state or lifecycle.
// ReactElement is the type for React components that return JSX elements.
import React, { ReactElement, useMemo } from "react";

// Import the translation hook from the react-i18next library.
// This hook provides the function `t` to get translated strings based on the current language.
import { useTranslation } from "react-i18next";

// Import hooks from react-router-dom to get info about the current URL and parameters.
// useLocation returns details about the current browser URL and its state.
// useParams gives access to parameters in the URL path, like an ID.
import { useLocation, useParams } from "react-router-dom";

// Import a custom authentication hook from the app's context.
// This provides functions like logout to handle user authentication status.
import { useAuth } from "@/contexts/AuthProvider.tsx";

// Import constants and functions related to language handling and translations within the app.
// Language and TranslationNamespaces define language codes and translation areas.
// getCurrentLanguage returns the currently selected language (e.g., "en" or "de").
import { Language, TranslationNamespaces, getCurrentLanguage } from "@/i18n.ts";

// Import TypeScript types that describe the shape of data.
// TutorialInstruction defines how each tutorial step is structured.
// EqualizationTranslations contains keys for translation texts specific to this tutorial.
// ErrorTranslations holds translation keys for error messages.
import { TutorialInstruction } from "@/types/shared/tutorialInstruction.ts";
import { EqualizationTranslations } from "@/types/equalization/equalizationTranslations.ts";
import { ErrorTranslations } from "@/types/shared/errorTranslations.ts";

// Import reusable components used inside this tutorial screen.
// ErrorScreen shows an error message if something goes wrong.
// OrientationModal displays a popup advising users on device orientation.
// Tutorial is the main component that displays the tutorial steps.
import ErrorScreen from "@components/shared/ErrorScreen.tsx";
import OrientationModal from "@components/shared/OrientationModal.tsx";
import Tutorial from "@components/views/Tutorial.tsx";

// Import predefined paths used for navigation within the app.
// These paths are strings that represent URLs or routes.
import { Paths } from "@routes/paths.ts";

// Import utility functions that handle marking a tutorial as completed in local storage.
// These functions save flags so the app knows the user finished the tutorial.
import { setCKStudyTutorialCompleted, setCKTutorialCompleted } from "@utils/storageUtils.ts";

// Import images used in the tutorial steps.
// For each image, there is a German ("De") and English ("En") version.
// These images represent buttons, instructions, or visuals shown during the tutorial.
import HintsDe from "@images/tutorials/equalization/equalization-hints-button-de.png";
import HintsEn from "@images/tutorials/equalization/equalization-hints-button-en.png";
import InstructionDe from "@images/tutorials/equalization/equalization-instruction-de.png";
import InstructionEn from "@images/tutorials/equalization/equalization-instruction-en.png";
import ItemsDe from "@images/tutorials/equalization/equalization-items-de.png";
import ItemsEn from "@images/tutorials/equalization/equalization-items-en.png";
import PlainDe from "@images/tutorials/equalization/equalization-plain-de.png";
import PlainEn from "@images/tutorials/equalization/equalization-plain-en.png";
import ScaleDe from "@images/tutorials/equalization/equalization-scale-de.png";
import ScaleEn from "@images/tutorials/equalization/equalization-scale-en.png";
import SystemDe from "@images/tutorials/equalization/equalization-system-de.png";
import SystemEn from "@images/tutorials/equalization/equalization-system-en.png";
import UndoDe from "@images/tutorials/equalization/equalization-undo-redo-buttons-de.png";
import UndoEn from "@images/tutorials/equalization/equalization-undo-redo-buttons-en.png";
import VerifyDe from "@images/tutorials/equalization/equalization-verify-button-de.png";
import VerifyEn from "@images/tutorials/equalization/equalization-verify-button-en.png";

// This is the main functional React component that renders the tutorial screen for the Equalization game.
// It accepts an optional prop called "isStudy" which is a boolean that tells the component if it's running
// as part of a study session (e.g., research study).
export default function EqualizationGameTutorial({ isStudy = false }: { isStudy?: boolean }): ReactElement {
    // useTranslation hook returns a function `t` which we use to get the correct translation string
    // for the current language and the given translation key.
    const { t } = useTranslation(TranslationNamespaces.Equalization);

    // useLocation hook returns the current URL location object.
    // It contains info about the current path, and any state passed during navigation.
    const location = useLocation();

    // useAuth is a custom hook returning authentication-related functions,
    // here we extract the logout function to log out users if needed.
    const { logout } = useAuth();

    // useParams returns an object containing URL parameters.
    // Here we try to get "studyId" which may be part of the URL in study mode.
    const { studyId } = useParams();

    // Define an array of tutorial instructions.
    // Each TutorialInstruction includes some text paragraphs (translated) and images for German and English.
    // The text uses translation keys defined in EqualizationTranslations.
    const instructions: TutorialInstruction[] = [
        new TutorialInstruction(
            [
                t(EqualizationTranslations.TUTORIAL_STORY_1),
                t(EqualizationTranslations.TUTORIAL_STORY_2),
                t(EqualizationTranslations.TUTORIAL_STORY_3),
                t(EqualizationTranslations.TUTORIAL_STORY_4)
            ],
            PlainDe,
            PlainEn
        ),
        new TutorialInstruction([t(EqualizationTranslations.TUTORIAL_INSTRUCTION)], InstructionDe, InstructionEn),
        new TutorialInstruction([t(EqualizationTranslations.TUTORIAL_SCALE)], ScaleDe, ScaleEn, "equalization-instruction"),
        new TutorialInstruction([t(EqualizationTranslations.TUTORIAL_ITEMS)], ItemsDe, ItemsEn),
        new TutorialInstruction([t(EqualizationTranslations.TUTORIAL_SYSTEM)], SystemDe, SystemEn),
        new TutorialInstruction([t(EqualizationTranslations.TUTORIAL_UNDO_REDO)], UndoDe, UndoEn),
        new TutorialInstruction([t(EqualizationTranslations.TUTORIAL_HINTS)], HintsDe, HintsEn),
        new TutorialInstruction([t(EqualizationTranslations.TUTORIAL_VERIFY)], VerifyDe, VerifyEn),
        // This last step has no text, just images
        new TutorialInstruction(undefined, PlainDe, PlainEn)
    ];

    // useMemo is a React hook that memorizes the return value of a function so it doesn't get recalculated unnecessarily.
    // Here we check if the current language is German once on component mount and reuse that value.
    const isGerman: boolean = useMemo((): boolean => {
        return getCurrentLanguage() === Language.DE;
    }, []);

    // Now we branch based on whether this tutorial is used inside a study session.
    if (isStudy) {
        // If studyId is missing or invalid, log out the user and show an error screen explaining the problem.
        if (studyId === undefined || studyId === "undefined") {
            logout();
            return (
                <ErrorScreen
                    text={ErrorTranslations.ERROR_STUDY_ID}
                    routeToReturn={Paths.StudiesLoginPath}  // Where to go after error screen
                    showFrownIcon={true}                     // Show sad icon on error screen
                />
            );
        } else {
            // If studyId is valid, show the tutorial and orientation modal.
            // We pass down props like the title, language info, instructions, and
            // a function to mark the tutorial completed in study mode.
            return (
                <>
                    <Tutorial
                        title={t(EqualizationTranslations.TUTORIAL_TITLE)}       // Tutorial title string
                        isGerman={isGerman}                                       // Is the current language German?
                        instructions={instructions}                               // The tutorial steps defined earlier
                        returnTo={Paths.CKStudyPath + studyId}                   // Path to return to after tutorial
                        setTutorialCompleted={() => setCKStudyTutorialCompleted(studyId, "equalization")} // Save completion state for study
                    />
                    <OrientationModal />  {/* A popup for device orientation help */}
                </>
            );
        }
    } else {
        // If not in study mode, show the standard tutorial.
        // Similar to above but different return path, and it supports exercises from location state.
        return (
            <>
                <Tutorial
                    title={t(EqualizationTranslations.TUTORIAL_TITLE)}
                    isGerman={isGerman}
                    instructions={instructions}
                    returnTo={Paths.EqualizationPath}                     // Path to go back to after tutorial
                    navigateToExercise={Paths.EqualizationGamePath}       // Path to start the actual game exercises
                    exercises={location.state?.exercises}                  // Optional exercises passed in location state
                    setTutorialCompleted={() => setCKTutorialCompleted("equalization")} // Mark tutorial done in normal mode
                />
                <OrientationModal />
            </>
        );
    }
}
