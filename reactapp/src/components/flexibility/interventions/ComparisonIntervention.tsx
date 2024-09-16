import { TranslationNamespaces } from "@/i18n.ts";
import { ReactElement, useMemo, useState } from "react";
import { Trans } from "react-i18next";
import { AgentExpression, AgentType, Method } from "@/types/flexibility/enums.ts";
import { FlexibilityTranslations } from "@/types/flexibility/flexibilityTranslations.ts";
import { SubstitutionParameters } from "@/types/flexibility/substitutionParameters.ts";
import { Variable } from "@/types/flexibility/variable.ts";
import { FlexibilityEquation as FlexibilityEquationProps } from "@/types/math/linearEquation.ts";
import { TranslationInterpolation } from "@/types/shared/translationInterpolation.ts";
import { ContinueMessage } from "@components/flexibility/interventions/ContinueMessage.tsx";
import { FlexibilityPopover } from "@components/flexibility/interventions/FlexibilityPopover.tsx";
import { Intervention } from "@components/flexibility/interventions/Intervention.tsx";
import { SystemSolution } from "@components/flexibility/solution/SystemSolution.tsx";

export function ComparisonIntervention({
    selectedMethod,
    initialSystem,
    transformedSystem,
    methodEquation,
    selectedEquation,
    firstSolutionVariable,
    otherVariable,
    firstSolutionIsFirstVariable,
    loadNextStep,
    compareMethods,
    comparisonMethod,
    substitutionInfo,
    agentType,
    additionalMessage
}: {
    selectedMethod: Method;
    initialSystem: [FlexibilityEquationProps, FlexibilityEquationProps];
    transformedSystem?: [FlexibilityEquationProps, FlexibilityEquationProps];
    methodEquation: FlexibilityEquationProps;
    selectedEquation: FlexibilityEquationProps;
    firstSolutionVariable: Variable;
    otherVariable: Variable;
    firstSolutionIsFirstVariable: boolean;
    loadNextStep: (compliance: boolean) => void;
    compareMethods: boolean;
    comparisonMethod: Method;
    substitutionInfo?: SubstitutionParameters;
    agentType?: AgentType;
    additionalMessage?: string;
}): ReactElement {
    const [showPrompt, setShowPrompt] = useState<boolean>(false);

    const message: TranslationInterpolation = useMemo(() => {
        return compareMethods ? FlexibilityTranslations.getComparisonPrompt(comparisonMethod) : FlexibilityTranslations.getResolvingPrompt(comparisonMethod);
    }, [compareMethods, comparisonMethod]);

    const continuePopover: ReactElement = (
        <FlexibilityPopover agentType={agentType} agentExpression={AgentExpression.Smiling}>
            <ContinueMessage message={FlexibilityTranslations.SYSTEM_SOLUTION_SUCCESS} loadNextStep={() => setShowPrompt(true)} />
        </FlexibilityPopover>
    );

    const promptPopover: ReactElement = (
        <Intervention handleYes={() => loadNextStep(true)} handleNo={() => loadNextStep(false)} agentType={agentType} agentExpression={AgentExpression.Smiling} additionalMessage={additionalMessage}>
            <p className={"strong-primary"}>
                <Trans ns={TranslationNamespaces.Flexibility} i18nKey={message.translationKey} values={message.interpolationVariables as object} />
            </p>
        </Intervention>
    );

    return (
        <SystemSolution
            method={selectedMethod}
            initialSystem={initialSystem}
            transformedSystem={transformedSystem}
            applicationEquation={methodEquation}
            firstSolutionVariable={firstSolutionVariable}
            selectedEquation={selectedEquation}
            otherVariable={otherVariable}
            firstSolutionIsFirstVariable={firstSolutionIsFirstVariable}
            popover={showPrompt ? promptPopover : continuePopover}
            substitutionInfo={substitutionInfo}
        />
    );
}
