import { useAuth } from "@/contexts/AuthProvider.tsx";
import Home from "@/views/Home";
import { ReactElement } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { ErrorTranslations } from "@/types/shared/errorTranslations.ts";
import About from "@views/About.tsx";
import EliminationExercise from "@views/elimination/EliminationExercise.tsx";
import EliminationGameTutorial from "@views/elimination/EliminationGameTutorial.tsx";
import EliminationView from "@views/elimination/EliminationView.tsx";
import EqualizationExercise from "@views/equalization/EqualizationExercise.tsx";
import EqualizationGameTutorial from "@views/equalization/EqualizationGameTutorial.tsx";
import EqualizationView from "@views/equalization/EqualizationView.tsx";
import FlexibilityStudyExamplesView from "@views/flexibility/FlexibilityStudyExamplesView.tsx";
import FlexibilityView from "@views/flexibility/FlexibilityView.tsx";
import LoginView from "@views/studies/LoginView.tsx";
import BarteringStudyExercise from "@views/studies/conceptual-knowledge/BarteringStudyExercise.tsx";
import CKStudyView from "@views/studies/conceptual-knowledge/CKStudyView.tsx";
import EliminationStudyExercise from "@views/studies/conceptual-knowledge/EliminationStudyExercise.tsx";
import EqualizationStudyExercise from "@views/studies/conceptual-knowledge/EqualizationStudyExercise.tsx";
import SubstitutionStudyExercise from "@views/studies/conceptual-knowledge/SubstitutionStudyExercise.tsx";
import BarteringExercise from "@views/substitution/BarteringExercise.tsx";
import BarteringGameTutorial from "@views/substitution/BarteringGameTutorial.tsx";
import SubstitutionExercise from "@views/substitution/SubstitutionExercise.tsx";
import SubstitutionGameTutorial from "@views/substitution/SubstitutionGameTutorial.tsx";
import SubstitutionView from "@views/substitution/SubstitutionView.tsx";
import ErrorScreen, { HomeErrorFallback, RouteNotFound } from "@components/shared/ErrorScreen.tsx";
import UnsupportedDevicesBoundary from "@components/views/UnsupportedDevicesBoundary.tsx";
import AuthenticatedRoute from "@routes/AuthenticatedRoute.tsx";
import { Paths } from "@routes/paths.ts";
import FlexibilityExercise from "@views/flexibility/FlexibilityExercise.tsx";
import { FlexibilityStudyView } from "@views/studies/flexibility/FlexibilityStudyView.tsx";
import FlexibilityStudyExercise from "@views/studies/flexibility/FlexibilityStudyExercise.tsx";
import { FlexibilityStudyEnd } from "@views/studies/flexibility/FlexibilityStudyEnd.tsx";
import { EqualizationDemoExercise } from "@views/studies/flexibility/EqualizationDemoExercise.tsx";
import { SubstitutionDemoExercise } from "@views/studies/flexibility/SubstitutionDemoExercise.tsx";
import { EliminationDemoExercise } from "@views/studies/flexibility/EliminationDemoExercise.tsx";

export default function Routes(): ReactElement {
    const { user } = useAuth();

    const RouteErrorBoundaryLayout = () => (
        <ErrorBoundary key={"route-boundary"} FallbackComponent={() => <ErrorScreen text={"test"} routeToReturn={Paths.HomePath} showFrownIcon={true} />}>
            <Outlet />
        </ErrorBoundary>
    );

    const StudyErrorBoundaryLayout = () => (
        <ErrorBoundary key={"study-boundary"}
                       FallbackComponent={() => <ErrorScreen text={ErrorTranslations.ERROR_INVALID_STUDY} routeToReturn={Paths.StudiesLoginPath} />}>
            <Outlet />
        </ErrorBoundary>
    );

    const homeRoute = [
        {
            path: Paths.HomePath,
            element: (
                <ErrorBoundary key={"home-boundary"} FallbackComponent={HomeErrorFallback}>
                    <UnsupportedDevicesBoundary>
                        <Home />
                    </UnsupportedDevicesBoundary>
                </ErrorBoundary>
            )
        }
    ];

    const publicRoutes = [
        {
            element: <RouteErrorBoundaryLayout />,
            children: [
                {
                    path: Paths.EqualizationPath,
                    element: (
                        <UnsupportedDevicesBoundary>
                            <EqualizationView />
                        </UnsupportedDevicesBoundary>
                    )
                },
                {
                    path: Paths.EqualizationGameExercisePath,
                    element: <EqualizationExercise />
                },
                {
                    path: Paths.EqualizationGameTutorialPath,
                    element: <EqualizationGameTutorial />
                },
                {
                    path: Paths.SubstitutionPath,
                    element: (
                        <UnsupportedDevicesBoundary>
                            <SubstitutionView />
                        </UnsupportedDevicesBoundary>
                    )
                },
                {
                    path: Paths.BarteringGameExercisePath,
                    element: <BarteringExercise />
                },
                {
                    path: Paths.BarteringGameTutorialPath,
                    element: <BarteringGameTutorial />
                },
                {
                    path: Paths.SubstitutionGameExercisePath,
                    element: <SubstitutionExercise />
                },
                {
                    path: Paths.SubstitutionGameTutorialPath,
                    element: <SubstitutionGameTutorial />
                },
                {
                    path: Paths.EliminationPath,
                    element: (
                        <UnsupportedDevicesBoundary>
                            <EliminationView />
                        </UnsupportedDevicesBoundary>
                    )
                },
                {
                    path: Paths.EliminationGameExercisePath,
                    element: <EliminationExercise />
                },
                {
                    path: Paths.EliminationGameTutorialPath,
                    element: <EliminationGameTutorial />
                },
                {
                    path: Paths.FlexibilityPath,
                    element: <FlexibilityView />
                },
                {
                    path: Paths.FlexibilityExercisePath,
                    element: <FlexibilityExercise isStudyExample={false} />
                },
                {
                    path: Paths.AboutPath,
                    element: <About />
                },
                {
                    path: "*",
                    element: <RouteNotFound />
                }
            ]
        }
    ];

    const authenticatedRoutes = [
        {
            element: <AuthenticatedRoute />,
            children: [
                {
                    element: <StudyErrorBoundaryLayout />,
                    children: [
                        {
                            path: Paths.CKConcreteStudyPath,
                            element: <CKStudyView />
                        },
                        {
                            path: Paths.CKConcreteStudyPath + Paths.EqualizationGameTutorialPath,
                            element: <EqualizationGameTutorial isStudy={true} />
                        },
                        {
                            path: Paths.CKConcreteStudyPath + Paths.EqualizationGameExercisePath,
                            element: <EqualizationStudyExercise />
                        },
                        {
                            path: Paths.CKConcreteStudyPath + Paths.BarteringGameTutorialPath,
                            element: <BarteringGameTutorial isStudy={true} />
                        },
                        {
                            path: Paths.CKConcreteStudyPath + Paths.BarteringGameExercisePath,
                            element: <BarteringStudyExercise />
                        },
                        {
                            path: Paths.CKConcreteStudyPath + Paths.SubstitutionGameTutorialPath,
                            element: <SubstitutionGameTutorial isStudy={true} />
                        },
                        {
                            path: Paths.CKConcreteStudyPath + Paths.SubstitutionGameExercisePath,
                            element: <SubstitutionStudyExercise />
                        },
                        {
                            path: Paths.CKConcreteStudyPath + Paths.EliminationGameTutorialPath,
                            element: <EliminationGameTutorial isStudy={true} />
                        },
                        {
                            path: Paths.CKConcreteStudyPath + Paths.EliminationGameExercisePath,
                            element: <EliminationStudyExercise />
                        },
                        {
                            path: Paths.FlexibilityStudyExamplesPath,
                            element: <FlexibilityStudyExamplesView />
                        },
                        {
                            path: Paths.FlexibilityStudyExamplesExercisePath,
                            element: <FlexibilityExercise isStudyExample={true} />
                        },
                        {
                            path: Paths.FlexibilityConcreteStudyPath,
                            element: <FlexibilityStudyView />
                        },
                        {
                            path: Paths.FlexibilityStudyExercisePath,
                            element: <FlexibilityStudyExercise />
                        },
                        {
                            path: Paths.FlexibilityStudyEqualizationDemoPath,
                            element: <EqualizationDemoExercise />
                        },
                        {
                            path: Paths.FlexibilityStudySubstitutionDemoPath,
                            element: <SubstitutionDemoExercise />
                        },
                        {
                            path: Paths.FlexibilityStudyEliminationDemoPath,
                            element: <EliminationDemoExercise />
                        },
                        {
                            path: Paths.FlexibilityStudyEndPath,
                            element: <FlexibilityStudyEnd />
                        }
                    ]
                }
            ]
        }
    ];

    const authenticatedForbiddenRoutes = [
        {
            element: <RouteErrorBoundaryLayout />,
            children: [
                {
                    path: Paths.StudiesLoginPath,
                    element: <LoginView />
                }
            ]
        }
    ];

    // const router = createBrowserRouter([...homeRoute, ...publicRoutes, ...authenticatedRoutes, ...(user === undefined ? authenticatedForbiddenRoutes : [])]);
    const router = createBrowserRouter([...homeRoute, ...publicRoutes]); // Authenticated routes are only required for conducting studies

    return <RouterProvider router={router} />;
}
