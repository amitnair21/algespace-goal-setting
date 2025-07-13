import { TranslationNamespaces } from "@/i18n.ts";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { AgentExpression, AgentType, Method } from "@/types/flexibility/enums.ts";
import { FlexibilityTranslations } from "@/types/flexibility/flexibilityTranslations.ts";
import { FlexibilityEquation } from "@/types/math/linearEquation.ts";
import { GeneralTranslations } from "@/types/shared/generalTranslations.ts";
import { SingleChoice } from "@components/flexibility/choice/SingleChoice.tsx";
import { FlexibilityHint } from "@components/flexibility/interventions/FlexibilityHint.tsx";
import { FlexibilityPopover } from "@components/flexibility/interventions/FlexibilityPopover.tsx";
import { LinearSystem } from "@components/math/procedural-knowledge/LinearSystem.tsx";

export function SuitableMethodSelection({
    firstEquation,
    secondEquation,
    question,
    loadNextStep,
    agentType
}: {
    firstEquation: FlexibilityEquation;
    secondEquation: FlexibilityEquation;
    question: string;
    loadNextStep: (method: Method) => void;
    agentType?: AgentType;
}): ReactElement {
    const { t } = useTranslation([TranslationNamespaces.Flexibility, TranslationNamespaces.General]);

    const [selectedOption, setSelectedOption] = useState<number | undefined>();
    const [showAgentPrompt, setShowAgentPrompt] = useState<boolean>(false);
    const [showSecondPrompt, setShowSecondPrompt] = useState<boolean>(false);

    const chosenMethod = selectedOption === 0
        ? Method.Equalization
        : selectedOption === 1
        ? Method.Substitution
        : Method.Elimination;

    return (
        <>
            <p>{t(FlexibilityTranslations.INTRO_SYSTEM)}</p>
            <LinearSystem firstEquation={firstEquation} secondEquation={secondEquation} />
            <div className={"method-selection"}>
                <p>{question}</p>
                <SingleChoice
                    options={[
                        t(FlexibilityTranslations.EQUALIZATION),
                        t(FlexibilityTranslations.SUBSTITUTION),
                        t(FlexibilityTranslations.ELIMINATION)
                    ]}
                    selectedOption={selectedOption}
                    setSelectedOption={setSelectedOption}
                    disabled={false}
                    optionClassname={"method-selection__option"}
                />
            </div>

            {selectedOption !== undefined && !showAgentPrompt && (
                <button
                    className={"button primary-button"}
                    onClick={() => setShowAgentPrompt(true)}
                >
                    {t(GeneralTranslations.BUTTON_CONTINUE, { ns: TranslationNamespaces.General })}
                    <FontAwesomeIcon icon={faArrowRight} />
                </button>
            )}

            {showAgentPrompt && (
                <FlexibilityPopover
                    agentType={agentType}
                    agentExpression={AgentExpression.Neutral}
                >
                    {!showSecondPrompt ? (
                        <>
                            <p>{t("great-choice")}</p>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button
                                    className="button primary-button"
                                    onClick={() => handleChoice()}
                                >
                                    {t("ive-got-this")}
                                </button>
                                <button
                                    className="button primary-button"
                                    onClick={() => setShowSecondPrompt(true)}
                                >
                                    {t("im-not-sure")}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p>
                              {t("feel-free-update-goal")}
                            </p>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button
                                    className="button primary-button"
                                >
                                    {t("change-goal")}
                                </button>
                                <button
                                    className="button primary-button"
                                    onClick={() => handleChoice()}
                                >
                                    {t("im-fine")}
                                </button>
                            </div>
                        </>
                    )}
                </FlexibilityPopover>
            )}

            <FlexibilityHint
                hints={[FlexibilityTranslations.SUITABLE_HINT]}
                agentType={agentType}
                agentExpression={AgentExpression.Neutral}
                disabled={false}
            />
        </>
    );

    function handleChoice(): void {
        loadNextStep(chosenMethod);
    }
}
