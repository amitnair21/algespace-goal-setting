import { TranslationNamespaces } from "@/i18n.ts";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactElement, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { GeneralTranslations } from "@/types/shared/generalTranslations.ts";
import { TranslationInterpolation } from "@/types/shared/translationInterpolation.ts";
import { SubstitutionExercise } from "@/types/substitution/conceptual-knowledge/substitutionExercise.ts";
import { SubstitutionTranslations } from "@/types/substitution/substitutionTranslations.ts";
import ImageEquation from "@components/math/conceptual-knowledge/ImageEquation.tsx";

import { AgentExpression, AgentType, Method } from "@/types/flexibility/enums.ts";
import { FlexibilityTranslations } from "@/types/flexibility/flexibilityTranslations.ts";
import { FlexibilityEquation } from "@/types/math/linearEquation.ts";
import { SingleChoice } from "@components/flexibility/choice/SingleChoice.tsx";
import { FlexibilityHint } from "@components/flexibility/interventions/FlexibilityHint.tsx";
import { FlexibilityPopover } from "@components/flexibility/interventions/FlexibilityPopover.tsx";

export default function Introduction({
  exercise,
  handleClick
}: {
  exercise: SubstitutionExercise;
  handleClick: () => void;
}): ReactElement {
  const { t } = useTranslation([
    TranslationNamespaces.General,
    TranslationNamespaces.Substitution,
    TranslationNamespaces.Variables
  ]);

  // pick a random agent type once per mount
  const [selectedAgentType] = useState<AgentType>(() => {
    const agentTypes: AgentType[] = [
      AgentType.MaleAfrican,
      AgentType.FemaleAfrican,
      AgentType.MaleCaucasian,
      AgentType.FemaleCaucasian,
      AgentType.MaleEastern,
      AgentType.FemaleEastern,
      AgentType.MaleAsian,
      AgentType.FemaleAsian
    ];
    return agentTypes[Math.floor(Math.random() * agentTypes.length)];
  });

  // Helper to get cookie by name
  function getCookie(name: string): string | null {
    const matches = document.cookie.match(
      new RegExp(
        "(?:^|; )" +
          name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
          "=([^;]*)"
      )
    );
    return matches ? decodeURIComponent(matches[1]) : null;
  }

  const descriptionOfFirstEq: TranslationInterpolation =
    SubstitutionTranslations.getDescriptionForFirstEquation(
      exercise.firstEquation.equation
    );
  const descriptionForSecondEq: TranslationInterpolation =
    SubstitutionTranslations.getDescriptionForSecondEquation(
      exercise.secondEquation.equation
    );
  const textForLastLine: TranslationInterpolation =
    SubstitutionTranslations.getTextForLastLine(
      exercise.isolatedVariable.name,
      exercise.secondVariable.name
    );

  // State for agent dialog flow
  const [showAgentPrompt, setShowAgentPrompt] = useState(false);
  const [showAnxiousResponse, setShowAnxiousResponse] = useState(false);

  // Check questionsEncountered cookie (parse as number)
  const questionsEncountered = Number(getCookie("questionsEncountered")) || 0;

  function onContinueClick(): void {
    if (questionsEncountered % 3 === 0) {
      // Show agent interaction instead of immediate continue
      setShowAgentPrompt(true);
    } else {
      // Normal continue
      handleClick();
    }
  }

  return (
    <>
      <p>
        {t(SubstitutionTranslations.INTRO_FIRST_LINE, {
          ns: TranslationNamespaces.Substitution
        })}
      </p>
      <p>
        <Trans
          ns={TranslationNamespaces.Substitution}
          i18nKey={descriptionOfFirstEq.translationKey}
          values={descriptionOfFirstEq.interpolationVariables as object}
        />
      </p>
      <ImageEquation
        equation={exercise.firstEquation.equation}
        style={{ color: "var(--dark-text)" }}
      />
      <p>
        <Trans
          ns={TranslationNamespaces.Substitution}
          i18nKey={descriptionForSecondEq.translationKey}
          values={descriptionForSecondEq.interpolationVariables as object}
        />
      </p>
      <ImageEquation
        equation={exercise.secondEquation.equation}
        style={{ color: "var(--dark-text)" }}
      />
      <p>
        <Trans
          ns={TranslationNamespaces.Substitution}
          i18nKey={textForLastLine.translationKey}
          values={textForLastLine.interpolationVariables as object}
        />
      </p>

      {!showAgentPrompt && (
        <button className="button primary-button" onClick={onContinueClick}>
          {t(GeneralTranslations.BUTTON_CONTINUE, {
            ns: TranslationNamespaces.General
          })}
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      )}

      {showAgentPrompt && (
        <FlexibilityPopover
          agentType={selectedAgentType}
          agentExpression={AgentExpression.Neutral}
        >
          {!showAnxiousResponse ? (
            <>
              <p>{t("how-do-you-feel-problem")}</p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  className="button primary-button"
                  onClick={() => {
                    // User is ready, continue normally
                    handleClick();
                  }}
                >
                  {t("lets-do-this")}
                </button>
                <button
                  className="button primary-button"
                  onClick={() => {
                    setShowAnxiousResponse(true);
                  }}
                >
                  {t("im-anxious")}
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                {t("remember-youre-learning")}
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  className="button primary-button"
                  onClick={() => {
                    handleClick();
                  }}
                >
                  {t("ill-do-my-best")}
                </button>
              </div>
            </>
          )}
        </FlexibilityPopover>
      )}
    </>
  );
}
