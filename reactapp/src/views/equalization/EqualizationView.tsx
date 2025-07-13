// Import constants for translation namespaces.
// These help specify which set of translations to use in the translation hook.
import { TranslationNamespaces } from "@/i18n.ts";

// Import React and the ReactElement type (the return type of a React component).
import React, { ReactElement } from "react";

// Import the translation hook from react-i18next, used to translate text keys into the current language.
import { useTranslation } from "react-i18next";

// Import general translation keys (used for common text strings across the app).
import { GeneralTranslations } from "@/types/shared/generalTranslations.ts";

// Import a reusable component that displays a list of exercises in a collapsible (expandable/collapsible) panel.
import CollapsibleExerciseList from "@components/views/CollapsibleExerciseList.tsx";

// Import the layout component used to wrap views with a consistent page structure, header, etc.
import ViewLayout from "@components/views/ViewLayout.tsx";

// Import predefined app routes and a helper function to get exercise paths.
// Paths are constant URL strings; getPathToExercises builds URLs for exercise sections.
import { Paths, getPathToExercises } from "@routes/paths.ts";

// Import utility functions to get and set collapsible UI states and retrieve which exercises the user completed.
// These typically interact with local storage or some persistent browser storage.
import { getCollapsibleState, getCompletedCKExercises, setCollapsibleState } from "@utils/storageUtils.ts";

// This React functional component renders the Equalization view screen.
// It shows info about the equalization game and a collapsible list of exercises.
export default function EqualizationView(): ReactElement {
    // useTranslation hook returns the function `t` that translates keys to strings in the current language.
    // We specify the general namespace for common text translations.
    const { t } = useTranslation(TranslationNamespaces.General);

    // Identifier string for the equalization module, used for storing exercise completion and UI states.
    const equalization: string = "equalization";

    // A key prefix for saving and retrieving collapsible panel open/close state from storage.
    const storageKey: string = "ck-open";

    // Prepare the main content of the view as a React fragment (a container that doesn't create extra DOM elements).
    const contents: ReactElement = (
        <React.Fragment>
            {/* Paragraph explaining info about the equalization game, translated */}
            <p>{t(GeneralTranslations.EQUALIZATION_INFO)}</p>

            {/*
            Render the CollapsibleExerciseList component, which shows a collapsible list of exercises.
            Props explanation:
            - text: The header text for the list (translated)
            - route: The URL path to the exercises page, generated dynamically
            - navigateTo: The path used for navigation when user selects exercises
            - completedExercises: An array of IDs for exercises the user has already completed (retrieved from storage)
            - isOpen: Whether the collapsible panel is open or closed (retrieved from storage, defaults to true)
            - handleOpen: Callback that runs when the panel is toggled open or closed, updates the stored state
            */}
            <CollapsibleExerciseList
                text={t(GeneralTranslations.HEADER_EQUALIZATION_GAME)}
                route={getPathToExercises(Paths.EqualizationGamePath)}
                navigateTo={Paths.EqualizationGamePath}
                completedExercises={getCompletedCKExercises(equalization)}
                isOpen={getCollapsibleState(equalization, storageKey, true)}
                handleOpen={(isOpen: boolean) => setCollapsibleState(equalization, storageKey, isOpen)}
            />
        </React.Fragment>
    );

    // Wrap the contents inside a ViewLayout component which provides a consistent page layout.
    // The title prop specifies the page title (translated).
    // The contents are passed as the `children` prop to display inside the layout.
    return <ViewLayout title={GeneralTranslations.EQUALIZATION} children={contents} />;
}
