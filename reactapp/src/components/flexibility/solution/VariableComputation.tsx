import { TranslationNamespaces } from "@/i18n.ts";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { AgentExpression, AgentType, FirstSolutionState } from "@/types/flexibility/enums.ts";
import { FlexibilityTranslations } from "@/types/flexibility/flexibilityTranslations.ts";
import { Variable } from "@/types/flexibility/variable.ts";
import { ContinueMessage } from "@components/flexibility/interventions/ContinueMessage.tsx";
import { FlexibilityPopover } from "@components/flexibility/interventions/FlexibilityPopover.tsx";
import { Intervention } from "@components/flexibility/interventions/Intervention.tsx";
import { SolutionInputField } from "@components/flexibility/solution/SolutionInputField.tsx";
import { VariableSolution } from "@components/flexibility/solution/VariableSolution.tsx";

export function VariableComputation({ variable, loadNextStep, agentType, additionalMessage, trackAction, trackError, trackChoice, isSecondSolution = false }: {
    variable: Variable;
    loadNextStep: () => void;
    agentType?: AgentType;
    additionalMessage?: string;
    trackAction: (action: string) => void;
    trackError: () => void;
    trackChoice: (choice: string) => void;
    isSecondSolution?: boolean
}): ReactElement {
    const { t } = useTranslation(TranslationNamespaces.Flexibility);

    const [exerciseState, setExerciseState] = useState<FirstSolutionState>(FirstSolutionState.Intervention);

    let content: ReactElement | undefined;
    switch (exerciseState) {
        case FirstSolutionState.Intervention: {
            content = (
                <Intervention
                    handleYes={() => {
                        trackChoice("Yes");
                        setExerciseState(FirstSolutionState.ManualComputation);
                    }}
                    handleNo={() => {
                        trackChoice("No");
                        setExerciseState(FirstSolutionState.ResultAuto);
                    }}
                    agentType={agentType} agentExpression={AgentExpression.Smiling} additionalMessage={additionalMessage}
                >
                    <p>{t(FlexibilityTranslations.FIRST_SOLUTION_CHOICE)}</p>
                </Intervention>
            );
            break;
        }

        case FirstSolutionState.ManualComputation: {
            content = <SolutionInputField variable={variable} handleSolution={() => setExerciseState(FirstSolutionState.ResultManual)}
                                          showSolution={() => setExerciseState(FirstSolutionState.ResultAuto)} agentType={agentType}
                                          trackAction={trackAction} trackError={trackError}
            />;
            break;
        }

        case FirstSolutionState.ResultAuto: {
            content = (
                <React.Fragment>
                    <p>{t(FlexibilityTranslations.FIRST_SOLUTION_SOLUTION)}</p>
                    <VariableSolution variable={variable} useLayout={isSecondSolution} />
                    <FlexibilityPopover agentType={agentType} agentExpression={AgentExpression.Neutral}>
                        <ContinueMessage message={FlexibilityTranslations.FIRST_SOLUTION_AUTO_CONTINUE} loadNextStep={loadNextStep} />
                    </FlexibilityPopover>
                </React.Fragment>
            );
            break;
        }

        case FirstSolutionState.ResultManual: {
            content = (
                <React.Fragment>
                    <p>{t(FlexibilityTranslations.FIRST_SOLUTION_SOLUTION)}</p>
                    <VariableSolution variable={variable} useLayout={isSecondSolution} />
                    <FlexibilityPopover agentType={agentType} agentExpression={AgentExpression.Smiling}>
                        <ContinueMessage message={FlexibilityTranslations.FIRST_SOLUTION_SUCCESS_CONTINUE} loadNextStep={loadNextStep} />
                    </FlexibilityPopover>
                </React.Fragment>
            );
            break;
        }
    }

    return content;
}
