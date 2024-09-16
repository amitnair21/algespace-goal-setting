import useAxios from "axios-hooks";
import { plainToClass } from "class-transformer";
import { ReactElement, useState } from "react";
import { ErrorTranslations } from "@/types/shared/errorTranslations.ts";
import { GeneralTranslations } from "@/types/shared/generalTranslations.ts";
import ErrorScreen from "@components/shared/ErrorScreen.tsx";
import { ExitExerciseOverlay } from "@components/shared/ExerciseOverlay.tsx";
import Loader from "@components/shared/Loader.tsx";
import { Paths } from "@routes/paths.ts";
import "@styles/views/flexibility.scss";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FlexibilityStudyExerciseType } from "@/types/studies/enums.ts";
import { AgentCondition, FlexibilityExerciseType } from "@/types/flexibility/enums.ts";
import { getExerciseNumber, handleNavigationClick } from "@utils/utils.ts";
import { ErrorBoundary } from "react-error-boundary";
import NavigationBar from "@components/shared/NavigationBar.tsx";
import { getCurrentLanguage } from "@/i18n.ts";
import { SuitabilityExercise as SuitabilityExerciseProps } from "@/types/flexibility/suitabilityExercise.ts";
import { SuitabilityExercise } from "@components/flexibility/exercises/SuitabilityExercise.tsx";
import { EfficiencyExercise } from "@components/flexibility/exercises/EfficiencyExercise.tsx";
import { EfficiencyExercise as EfficiencyExerciseProps } from "@/types/flexibility/efficiencyExercise.ts";
import { MatchingExercise as MatchingExerciseProps } from "@/types/flexibility/matchingExercise.ts";
import { TipExercise as TipExerciseProps } from "@/types/flexibility/tipExercise.ts";
import { MatchingExercise } from "@components/flexibility/exercises/MatchingExercise.tsx";
import { WorkedExamples } from "@components/flexibility/exercises/WorkedExamples.tsx";
import { TipExercise } from "@components/flexibility/exercises/TipExercise.tsx";
import { PlainExercise as PlainExerciseProps } from "@/types/flexibility/plainExercise.ts";
import { PlainExercise } from "@components/flexibility/exercises/PlainExercise.tsx";

export default function FlexibilityExercise({ isStudyExample }: { isStudyExample: boolean }): ReactElement {
    const [exitOverlay, setExitOverlay] = useState<[boolean, boolean]>([false, false]);
    const location = useLocation();
    const { exerciseId } = useParams();

    const concreteExerciseType: FlexibilityExerciseType | FlexibilityStudyExerciseType | undefined = location.state?.exerciseType;
    const concreteExerciseId: number | undefined = location.state?.exerciseId;

    if (exerciseId === undefined || exerciseId === "undefined" || concreteExerciseType === undefined || concreteExerciseId === undefined) {
        return <ErrorScreen text={ErrorTranslations.ERROR_EXERCISE_ID} routeToReturn={Paths.FlexibilityStudyExamplesPath} showFrownIcon={true} />;
    }

    const id: number = parseInt(exerciseId);
    const currentExercise: number | undefined = getExerciseNumber(id, location.state?.exercises);

    return (
        <ErrorBoundary key={location.pathname}
                       FallbackComponent={() => <ErrorScreen text={ErrorTranslations.ERROR_RETURN} routeToReturn={Paths.FlexibilityPath} />}
        >
            <div className={"full-page"} style={{ background: "linear-gradient(180deg, var(--blue-background) 0%, #044a6d 100%)", paddingBottom: "1rem" }}>
                <NavigationBar mainRoute={GeneralTranslations.FLEXIBILITY_TRAINING}
                               handleSelection={isStudyExample ? undefined : (isHome: boolean) => handleNavigationClick(isHome, setExitOverlay)}
                               currentExercise={currentExercise} isStudy={isStudyExample} exercisesCount={location.state?.exercises?.length ?? undefined}
                               style={{ minHeight: "3.5rem" }} />
                <div className={"flexibility-view__container"}>
                    <div className={"flexibility-view__contents"}>
                        {isStudyExample ?
                            <ExampleExercise concreteExerciseType={concreteExerciseType as FlexibilityStudyExerciseType} concreteExerciseId={concreteExerciseId}
                                             flexibilityId={id} navigateBackTo={Paths.FlexibilityStudyExamplesPath} /> :
                            <Exercise concreteExerciseType={concreteExerciseType as FlexibilityExerciseType} concreteExerciseId={concreteExerciseId} flexibilityId={id}
                                      navigateBackTo={Paths.FlexibilityPath} />
                        }
                    </div>
                </div>
            </div>
            {!isStudyExample && exitOverlay[0] &&
                <ExitExerciseOverlay returnToHome={exitOverlay[1]} routeToReturn={Paths.FlexibilityPath} closeOverlay={() => setExitOverlay([false, false])} />}
        </ErrorBoundary>
    );
}

function Exercise({ concreteExerciseType, concreteExerciseId, flexibilityId, navigateBackTo }: {
    concreteExerciseType: FlexibilityExerciseType,
    concreteExerciseId: number;
    flexibilityId: number;
    navigateBackTo: string
}): ReactElement {
    switch (concreteExerciseType) {
        case FlexibilityExerciseType.Suitability :
            return <ExerciseForSuitability concreteExerciseId={concreteExerciseId} flexibilityId={flexibilityId} navigateBackTo={navigateBackTo} />;
        case FlexibilityExerciseType.Efficiency:
            return <ExerciseForEfficiency concreteExerciseId={concreteExerciseId} flexibilityId={flexibilityId} navigateBackTo={navigateBackTo} />;
        case FlexibilityExerciseType.Matching:
            return <ExerciseForMatching concreteExerciseId={concreteExerciseId} flexibilityId={flexibilityId} navigateBackTo={navigateBackTo} />;
    }
}

function ExampleExercise({ concreteExerciseType, concreteExerciseId, flexibilityId, navigateBackTo }: {
    concreteExerciseType: FlexibilityStudyExerciseType,
    concreteExerciseId: number;
    flexibilityId: number;
    navigateBackTo: string
}): ReactElement {
    const navigate = useNavigate();

    switch (concreteExerciseType) {
        case FlexibilityStudyExerciseType.WorkedExamples:
            return <WorkedExamples flexibilityExerciseId={flexibilityId} exerciseId={0} condition={AgentCondition.MotivationalAgent}
                                   handleEnd={() => navigate(navigateBackTo)} />;
        case FlexibilityStudyExerciseType.Suitability :
            return <ExerciseForSuitability concreteExerciseId={concreteExerciseId} flexibilityId={flexibilityId} navigateBackTo={navigateBackTo} />;
        case FlexibilityStudyExerciseType.Efficiency:
            return <ExerciseForEfficiency concreteExerciseId={concreteExerciseId} flexibilityId={flexibilityId} navigateBackTo={navigateBackTo} />;
        case FlexibilityStudyExerciseType.Matching:
            return <ExerciseForMatching concreteExerciseId={concreteExerciseId} flexibilityId={flexibilityId} navigateBackTo={navigateBackTo} />;
        case FlexibilityStudyExerciseType.TipExercise:
            return <ExerciseWithTip concreteExerciseId={concreteExerciseId} flexibilityId={flexibilityId} navigateBackTo={navigateBackTo} />;
        case FlexibilityStudyExerciseType.PlainExercise:
            return <PlainExerciseForStudy concreteExerciseId={concreteExerciseId} flexibilityId={flexibilityId} navigateBackTo={navigateBackTo} />;
    }
}

function ExerciseForSuitability({ concreteExerciseId, flexibilityId, navigateBackTo }: {
    concreteExerciseId: number,
    flexibilityId: number,
    navigateBackTo: string
}): ReactElement {
    const navigate = useNavigate();

    const [{ data, loading, error }] = useAxios({
        url: `/flexibility-training/${getCurrentLanguage()}/getSuitabilityExercise/${concreteExerciseId}`
    });

    if (loading) return <Loader />;
    if (error) {
        console.error(error);
        return <ErrorScreen text={ErrorTranslations.ERROR_LOAD} routeToReturn={Paths.FlexibilityStudyExamplesPath} showFrownIcon={true} />;
    }

    const exercise: SuitabilityExerciseProps = plainToClass(SuitabilityExerciseProps, data as SuitabilityExerciseProps);

    return <SuitabilityExercise flexibilityExerciseId={flexibilityId} exercise={exercise} condition={AgentCondition.MotivationalAgent}
                                handleEnd={() => navigate(navigateBackTo)} />;
}

function ExerciseForEfficiency({ concreteExerciseId, flexibilityId, navigateBackTo }: {
    concreteExerciseId: number,
    flexibilityId: number,
    navigateBackTo: string
}): ReactElement {
    const navigate = useNavigate();

    const [{ data, loading, error }] = useAxios({
        url: `/flexibility-training/${getCurrentLanguage()}/getEfficiencyExercise/${concreteExerciseId}`
    });

    if (loading) return <Loader />;
    if (error) {
        console.error(error);
        return <ErrorScreen text={ErrorTranslations.ERROR_LOAD} routeToReturn={Paths.FlexibilityStudyExamplesPath} showFrownIcon={true} />;
    }

    const exercise: EfficiencyExerciseProps = plainToClass(EfficiencyExerciseProps, data as EfficiencyExerciseProps);

    return <EfficiencyExercise flexibilityExerciseId={flexibilityId} exercise={exercise} condition={AgentCondition.MotivationalAgent}
                               handleEnd={() => navigate(navigateBackTo)} />;
}

function ExerciseForMatching({ concreteExerciseId, flexibilityId, navigateBackTo }: {
    concreteExerciseId: number,
    flexibilityId: number,
    navigateBackTo: string
}): ReactElement {
    const navigate = useNavigate();

    const [{ data, loading, error }] = useAxios({
        url: `/flexibility-training/${getCurrentLanguage()}/getMatchingExercise/${concreteExerciseId}`
    });

    if (loading) return <Loader />;
    if (error) {
        console.error(error);
        return <ErrorScreen text={ErrorTranslations.ERROR_LOAD} routeToReturn={Paths.FlexibilityStudyExamplesPath} showFrownIcon={true} />;
    }

    const exercise: MatchingExerciseProps = plainToClass(MatchingExerciseProps, data as MatchingExerciseProps);

    return <MatchingExercise flexibilityExerciseId={flexibilityId} exercise={exercise} condition={AgentCondition.MotivationalAgent}
                             handleEnd={() => navigate(navigateBackTo)} isStudy={false} studyId={1} />;
}

function ExerciseWithTip({ concreteExerciseId, flexibilityId, navigateBackTo }: {
    concreteExerciseId: number,
    flexibilityId: number,
    navigateBackTo: string
}): ReactElement {
    const navigate = useNavigate();

    const [{ data, loading, error }] = useAxios({
        url: `/flexibility-training/${getCurrentLanguage()}/getTipExercise/${concreteExerciseId}`
    });

    if (loading) return <Loader />;
    if (error) {
        console.error(error);
        return <ErrorScreen text={ErrorTranslations.ERROR_LOAD} routeToReturn={Paths.FlexibilityStudyExamplesPath} showFrownIcon={true} />;
    }

    const exercise: TipExerciseProps = plainToClass(TipExerciseProps, data as TipExerciseProps);

    return <TipExercise flexibilityExerciseId={flexibilityId} exercise={exercise} condition={AgentCondition.MotivationalAgent}
                        handleEnd={() => navigate(navigateBackTo)} />;
}

function PlainExerciseForStudy({ concreteExerciseId, flexibilityId, navigateBackTo }: {
    concreteExerciseId: number,
    flexibilityId: number,
    navigateBackTo: string
}): ReactElement {
    const navigate = useNavigate();

    const [{ data, loading, error }] = useAxios({
        url: `/flexibility-training/${getCurrentLanguage()}/getPlainExercise/${concreteExerciseId}`
    });

    if (loading) return <Loader />;
    if (error) {
        console.error(error);
        return <ErrorScreen text={ErrorTranslations.ERROR_LOAD} routeToReturn={Paths.FlexibilityStudyExamplesPath} showFrownIcon={true} />;
    }

    const exercise: PlainExerciseProps = plainToClass(PlainExerciseProps, data as PlainExerciseProps);

    return <PlainExercise flexibilityExerciseId={flexibilityId} exercise={exercise} condition={AgentCondition.MotivationalAgent}
                          handleEnd={() => navigate(navigateBackTo)} />;
}