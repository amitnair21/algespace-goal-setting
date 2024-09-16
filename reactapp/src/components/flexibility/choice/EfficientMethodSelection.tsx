import { TranslationNamespaces } from "@/i18n.ts";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactElement, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { AgentExpression, AgentType, Method } from "@/types/flexibility/enums.ts";
import { FlexibilityTranslations } from "@/types/flexibility/flexibilityTranslations.ts";
import { FlexibilityEquation } from "@/types/math/linearEquation.ts";
import { GeneralTranslations } from "@/types/shared/generalTranslations.ts";
import { TranslationInterpolation } from "@/types/shared/translationInterpolation.ts";
import { SingleChoice } from "@components/flexibility/choice/SingleChoice.tsx";
import { FlexibilityHint } from "@components/flexibility/interventions/FlexibilityHint.tsx";
import { ClosableFlexibilityPopover } from "@components/flexibility/interventions/FlexibilityPopover.tsx";
import { Intervention } from "@components/flexibility/interventions/Intervention.tsx";
import { LinearSystem } from "@components/math/procedural-knowledge/LinearSystem.tsx";

export function EfficientMethodSelection(
    {
        firstEquation,
        secondEquation,
        efficientMethods,
        transformationRequired,
        loadNextStep,
        question,
        agentType,
        additionalMessage,
        trackAction,
        trackError,
        trackChoice
    }: {
        firstEquation: FlexibilityEquation;
        secondEquation: FlexibilityEquation;
        efficientMethods: Method[];
        transformationRequired: boolean;
        loadNextStep: (method: Method, selfExplain: boolean) => void;
        question?: string;
        agentType?: AgentType;
        additionalMessage?: string;
        trackAction: (action: string) => void;
        trackError: () => void;
        trackChoice: (choice: string) => void;
    }
): ReactElement {
    const { t } = useTranslation([TranslationNamespaces.Flexibility, TranslationNamespaces.General]);

    const [selectedOption, setSelectedOption] = useState<number | undefined>();
    const [selectedMethod, setSelectedMethod] = useState<Method>(Method.Equalization);
    const [intervention, setIntervention] = useState<TranslationInterpolation | undefined>(undefined);
    const [feedback, setFeedback] = useState<string>("");
    const [showFeedback, setShowFeedback] = useState<boolean>(false);

    return (
        <React.Fragment>
            <p>{t(FlexibilityTranslations.INTRO_SYSTEM)}</p>
            <LinearSystem firstEquation={firstEquation} secondEquation={secondEquation} />
            <div className={"method-selection"}>
                <p>{question !== null ? question : t(efficientMethods.length > 1 ? FlexibilityTranslations.MULTIPLE_EFFICIENT_INSTR : FlexibilityTranslations.SINGLE_EFFICIENT_INSTR)}</p>
                <SingleChoice options={[t(FlexibilityTranslations.EQUALIZATION), t(FlexibilityTranslations.SUBSTITUTION), t(FlexibilityTranslations.ELIMINATION)]}
                              selectedOption={selectedOption} setSelectedOption={setSelectedOption} disabled={intervention !== undefined}
                              optionClassname={"method-selection__option"} />
            </div>
            {selectedOption !== undefined && intervention === undefined && (
                <button className={"button primary-button"} onClick={evaluateChoice} disabled={showFeedback}>
                    {t(GeneralTranslations.BUTTON_VERIFY_ANSWER, { ns: TranslationNamespaces.General })}
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
            )}
            <FlexibilityHint hints={[FlexibilityTranslations.EFFICIENT_METHOD_HINT]} agentType={agentType} agentExpression={AgentExpression.Neutral}
                             disabled={intervention !== undefined || showFeedback} />
            {intervention !== undefined && (
                <Intervention handleYes={() => {
                    trackChoice("Yes");
                    loadNextStep(selectedMethod, true);
                }} handleNo={() => {
                    trackChoice("No");
                    loadNextStep(selectedMethod, false);
                }} agentType={agentType}
                              agentExpression={AgentExpression.Smiling} additionalMessage={additionalMessage}>
                    <p><Trans ns={TranslationNamespaces.Flexibility} i18nKey={intervention.translationKey} values={intervention.interpolationVariables as object} /></p>
                </Intervention>
            )}
            {showFeedback && (
                <ClosableFlexibilityPopover setShowContent={setShowFeedback} agentType={agentType} agentExpression={AgentExpression.Thinking}>
                    <p>{t(feedback)}</p>
                </ClosableFlexibilityPopover>
            )}
        </React.Fragment>
    );

    function evaluateChoice(): void {
        let method: Method = Method.Elimination;
        let feedback: string = transformationRequired ? FlexibilityTranslations.ELIMINATION_NOT_EFFICIENT_NO_TRANSFORMATION : FlexibilityTranslations.ELIMINATION_NOT_EFFICIENT;
        if (selectedOption === 0) {
            method = Method.Equalization;
            feedback = transformationRequired ? FlexibilityTranslations.EQUALIZATION_NOT_EFFICIENT_NO_TRANSFORMATION : FlexibilityTranslations.EQUALIZATION_NOT_EFFICIENT;
            setSelectedMethod(Method.Equalization);
        } else if (selectedOption === 1) {
            method = Method.Substitution;
            feedback = transformationRequired ? FlexibilityTranslations.SUBSTITUTION_NOT_EFFICIENT_NO_TRANSFORMATION : FlexibilityTranslations.SUBSTITUTION_NOT_EFFICIENT;
            setSelectedMethod(Method.Substitution);
        } else {
            setSelectedMethod(Method.Elimination);
        }

        if (efficientMethods.includes(method)) {
            trackAction(`selected ${Method[method]},\nSUCCESS`);
            const question = FlexibilityTranslations.getQuestionForSEInterventionForEfficiency(method);
            setIntervention(question);
        } else {
            trackAction(`selected ${Method[method]},\nFAILED`);
            trackError();
            setFeedback(feedback);
            setShowFeedback(true);
        }
    }
}
