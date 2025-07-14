import { TranslationNamespaces } from "@/i18n.ts";
import { faChevronRight }       from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon }       from "@fortawesome/react-fontawesome";
import React, {
  CSSProperties,
  ReactElement,
  useState,
  useMemo,
  useEffect,
} from "react";
import { useTranslation }        from "react-i18next";
import { GeneralTranslations }   from "@/types/shared/generalTranslations.ts";
import Logo                      from "@images/home/logo320.png";
import "@styles/shared/navigation.scss";

import { getCompletedCKExercises } from "@utils/storageUtils.ts";
import { getCompletedPKExercises } from "@utils/storageUtils.ts";

const TOTAL_EQUALIZATION = 11;
const TOTAL_SUBSTITUTION  = 16;
const TOTAL_ELIMINATION   = 11;
const TOTAL_FLEXIBILITY   = 14;

// --- Cookie utility functions ---
function getCookie(name: string): string | null {
  const cookieString = document.cookie || "";
  const parts       = cookieString.split("; ");
  for (const part of parts) {
    const [key, ...vals] = part.split("=");
    if (key === name) {
      return decodeURIComponent(vals.join("="));
    }
  }
  return null;
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export default function NavigationBar({
  mainRoute,
  subRoute,
  handleSelection,
  currentExercise,
  exercisesCount,
  isStudy = false,
  style,
}: {
  mainRoute: string;
  subRoute?: string;
  handleSelection?: (isHome: boolean) => void;
  currentExercise?: number;
  exercisesCount?: number;
  isStudy?: boolean;
  style?: CSSProperties;
}): ReactElement {
  const { t } = useTranslation([TranslationNamespaces.General, TranslationNamespaces.Flexibility]);
  const [overlayVisible, setOverlayVisible] = useState(false);

  // --- Options for dropdowns ---
  const goalOptions = [
    t("none"),
    t("goal-1-correct"),
    t("goal-3-correct"),
    t("goal-5-correct"),
    t("goal-recover"),
    t("goal-level-5-correct"),
  ];

  const methodOptions = [
    t("any"),
    "⚖️ " + t("strat-equi"),
    "🛍️ " + t("strat-subs"),
    "💵 " + t("strat-elim"),
    "🪁 " + t("strat-flex"),
  ];

  // --- Initialize goal and method indices from cookies ---
  const [goalIndex, setGoalIndex]     = useState(() => {
    const cookieVal = getCookie("GlobalTask");
    const idx       = cookieVal ? parseInt(cookieVal, 10) : 0;
    return idx >= 0 && idx < goalOptions.length ? idx : 0;
  });
  const [methodIndex, setMethodIndex] = useState(() => {
    const cookieVal = getCookie("GlobalStrat");
    const idx       = cookieVal ? parseInt(cookieVal, 10) : 0;
    return idx >= 0 && idx < methodOptions.length ? idx : 0;
  });

  // NEW state for mismatch‐redirect icon
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // whenever “Solve a level 5 problem” is chosen, hide Flexibility
  const filteredMethodOptions =
    goalIndex === goalOptions.indexOf(t("goal-level-5-correct"))
      ? methodOptions.filter((m) => m !== "🪁 " + t("strat-flex"))
      : methodOptions;

  const goal   = goalOptions[goalIndex];
  const method = methodOptions[methodIndex];

  // check the success cookie each render
  const taskSuccess = getCookie("TaskSuccess") === "1";

  function stripLeadingEmoji(text: string): string {
    if (
      text.length > 1 &&
      text.charCodeAt(0) >= 0xd800 &&
      text.charCodeAt(0) <= 0xdbff
    ) {
      return text.substring(2).trim();
    }
    return text;
  }

  const cleanGoal = goal === t("none") ? goal : stripLeadingEmoji(goal);
  const displayGoalText =
    cleanGoal === t("none")
      ? `${t("current-goal")}: ${t("none")}`
      : method === t("any")
      ? `${t("current-goal")}: ${goal}`
      : `${t("current-goal")}: ${goal} → ${method}`;

  // State for current-goal text color
  const [goalTextColor, setGoalTextColor] = useState<string>("#fff");

  // Helper to recalculate & apply goal-color based on cookies
  // helper to read a streak cookie as number
function getStreak(cookieName: string): number {
  return parseInt(getCookie(cookieName) || "0", 10);
}

/** recalc & repaint based on (GlobalTask, GlobalStrat, streak-cookies) */
function updateGoalTextColor() {
              // 1) if we already flagged success, just stay green
              if (getCookie("TaskSuccess") === "1") {
                console.log("TaskSuccess active → painting green");
                setGoalTextColor("#7AE361");
                return;
              }

              const task  = parseInt(getCookie("GlobalTask") || "0", 10);
              const strat = parseInt(getCookie("GlobalStrat") || "0", 10);
              const route = mainRoute.toLowerCase();

              // 2) guard: if user picked a strat that doesn't match this route, reset streaks & bail
              const valid =
                strat === 0 ||
                (strat === 1 && route === "equalization") ||
                (strat === 2 && route === "substitution") ||
                (strat === 3 && route === "elimination") ||
                (strat === 4 && route === "flexibility-training");

              if (!valid) {
                const streakMapping: Record<string, string> = {
                  equalization:           "EqualizationStreak",
                  substitution:           "SubstitutionStreak",
                  elimination:            "EliminationStreak",
                  "flexibility-training": "FlexibilityStreak",
                };
                Object.values(streakMapping).forEach((cookieName) => {
                  setCookie(cookieName, "0");
                });
                return;
              }

              let color = "#fff";

              // 3) tasks 1–3: thresholds 1, 3, 5
              if (task >= 1 && task <= 3) {
                const thresholds = [1, 3, 5];
                const threshold  = thresholds[task - 1];

                if (strat === 0) {
                  // “any” → check all streaks
                  const allNames = [
                    "EqualizationStreak",
                    "SubstitutionStreak",
                    "EliminationStreak",
                    "FlexibilityStreak",
                  ];
                  const anyGood = allNames
                    .map(getStreak)
                    .some((st) => st >= threshold);

                  if (anyGood) {
                    color = "#7AE361";
                    setCookie("TaskSuccess", "1");
                    console.log("Rewarding point");
                  }
                } else {
                  // specific strategy only
                  const byStrat: Record<number, string> = {
                    1: "EqualizationStreak",
                    2: "SubstitutionStreak",
                    3: "EliminationStreak",
                    4: "FlexibilityStreak",
                  };
                  const streakName = byStrat[strat];
                  if (getStreak(streakName) >= threshold) {
                    color = "#7AE361";
                    setCookie("TaskSuccess", "1");
                    console.log("Rewarding point");
                  }
                }
              }
              // 4) task 4: recover-on-wrong
              else if (task === 4) {
                const incorrect = parseInt(getCookie("IncorrectFlag") || "0", 10);
                if (incorrect === 1) {
                  color = "#7AE361";
                  setCookie("TaskSuccess", "1");
                  console.log("Rewarding point");
                }
              }
              // 5) task 5: level-5 logic stays the same
              else if (task === 5) {
                const unlocked      = getCookie("Task5Completed") === "1";
                const level5Detect =
                  (mainRoute === "equalization" && currentExercise === 10) ||
                  (mainRoute === "substitution" &&
                    [9, 10].includes(currentExercise!)) ||
                  (mainRoute === "elimination" &&
                    [9, 10].includes(currentExercise!));

                if ((currentExercise != null && level5Detect) || unlocked) {
                  color = "#7AE361";
                  setCookie("Task5Completed", "1");
                  setCookie("TaskSuccess",   "1");
                  console.log("Rewarding point");
                }
              }

              setGoalTextColor(color);
            }





  useEffect(updateGoalTextColor, [mainRoute, currentExercise]);

  function calculateProgress(moduleName: string, total: number): number {
    let completed = getCompletedCKExercises(moduleName) || [];
    if (moduleName === "flexibility-training") {
      completed = getCompletedPKExercises(moduleName) || [];
    }
    if (moduleName === "substitution") {
      const barteringCompleted = getCompletedCKExercises("substitution", "bartering");
      if (Array.isArray(barteringCompleted)) {
        completed = [...completed, ...barteringCompleted];
      } else {
        //console.warn("Bartering data missing or invalid:", barteringCompleted);
      }
    }
    const percent = (completed.length / total) * 100;
    return Math.min(100, Math.max(0, Math.round(percent)));
  }

  const progressData = useMemo(() => {
    if (!overlayVisible) return null;
    return [
      { method: t("strat-equi"), percent: calculateProgress("equalization", TOTAL_EQUALIZATION) },
      { method: t("strat-subs"), percent: calculateProgress("substitution", TOTAL_SUBSTITUTION) },
      { method: t("strat-elim"),  percent: calculateProgress("elimination", TOTAL_ELIMINATION) },
      { method: t("strat-flex"),  percent: calculateProgress("flexibility-training", TOTAL_FLEXIBILITY) },
    ];
  }, [overlayVisible]);

  // when user clicks either dropdown, we reset success & streak flags
  function onGoalChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newIndex    = goalOptions.indexOf(e.target.value);
    const oldIndexStr = getCookie("GlobalTask");
    const oldIndex    = oldIndexStr ? parseInt(oldIndexStr, 10) : null;

    if (newIndex !== oldIndex) {
      setGoalIndex(newIndex);
      setCookie("GlobalTask", newIndex.toString());

      if (newIndex === 0) {
        setMethodIndex(0);
        setCookie("GlobalStrat", "0");
      }

      // if user picks “Solve a level 5 problem” and they had Flexibility, revert it
      if (
        newIndex === goalOptions.indexOf(t("goal-level-5-correct")) &&
        methodOptions[methodIndex] === "🪁 " + t("strat-flex")
      ) {
        setMethodIndex(0);
        setCookie("GlobalStrat", "0");
      }

      console.log("Resetting streaks");
      const streakMapping: Record<string, string> = {
        equalization:           "EqualizationStreak",
        substitution:           "SubstitutionStreak",
        elimination:            "EliminationStreak",
        "flexibility-training": "FlexibilityStreak",
      };
      Object.values(streakMapping).forEach((cookieName) => {
        setCookie(cookieName, "0");
      });
    } else {
      setGoalIndex(newIndex);
    }

    // clear any green locks so color returns to white
    setCookie("TaskSuccess",   "0");
    console.log("Goal reset");
    setCookie("Task5Completed","0");
    setGoalTextColor("#fff");
  }

  function onMethodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newIndex    = methodOptions.indexOf(e.target.value);
    const oldIndexStr = getCookie("GlobalStrat");
    const oldIndex    = oldIndexStr ? parseInt(oldIndexStr, 10) : null;

    if (newIndex !== oldIndex) {
      setMethodIndex(newIndex);
      setCookie("GlobalStrat", newIndex.toString());

      console.log("Resetting streaks");
      const streakMapping: Record<string, string> = {
        equalization:           "EqualizationStreak",
        substitution:           "SubstitutionStreak",
        elimination:            "EliminationStreak",
        "flexibility-training": "FlexibilityStreak",
      };
      Object.values(streakMapping).forEach((cookieName) => {
        setCookie(cookieName, "0");
      });
    } else {
      setMethodIndex(newIndex);
    }

    // --- NEW MISMATCH DETECTION ---
    if (newIndex !== 0) {
      const matches =
        (newIndex === 1 && mainRoute === "equalization") ||
        (newIndex === 2 && mainRoute === "substitution") ||
        (newIndex === 3 && mainRoute === "elimination") ||
        (newIndex === 4 && mainRoute === "flexibility-training");
      if (!matches) {
        console.log("MISMATCH!");
        const paths: Record<number,string> = {
          1: "/equalization",
          2: "/substitution",
          3: "/elimination",
          4: "/flexibility-training",
        };
        setRedirectUrl(paths[newIndex] || null);
      } else {
        setRedirectUrl(null);
      }
    } else {
      setRedirectUrl(null);
    }

    // clear any green locks so color returns to white
    setCookie("TaskSuccess",   "0");
    console.log("Goal reset");
    setCookie("Task5Completed","0");
    setGoalTextColor("#fff");
  }

  useEffect(() => {
          const newIndex = methodIndex;

          // EXACT MATCH CASE REPEATED (ON PAGE LOAD)
          if (newIndex !== 0) {
            const matches =
              (newIndex === 1 && mainRoute === "equalization") ||
              (newIndex === 2 && mainRoute === "substitution") ||
              (newIndex === 3 && mainRoute === "elimination") ||
              (newIndex === 4 && mainRoute === "flexibility-training");

            if (!matches) {
              const paths: Record<number,string> = {
                1: "/equalization",
                2: "/substitution",
                3: "/elimination",
                4: "/flexibility-training",
              };
              setRedirectUrl(paths[newIndex] || null);
            } else {
              setRedirectUrl(null);
            }
          } else {
            setRedirectUrl(null);
          }
        }, [goalIndex, mainRoute]);





  // MutationObserver to watch for "well done" and "try again"
  useEffect(() => {
    if (!document.body) return;
    const streakMapping: Record<string, string> = {
      equalization:           "EqualizationStreak",
      substitution:           "SubstitutionStreak",
      elimination:            "EliminationStreak",
      "flexibility-training": "FlexibilityStreak",
    };

    function getStreak(cookieName: string): number {
      const val = getCookie(cookieName);
      return val ? parseInt(val, 10) || 0 : 0;
    }
    function setStreak(cookieName: string, value: number) {
      setCookie(cookieName, value.toString());
    }
    function setIncorrectFlag() {
      setCookie("IncorrectFlag", "1");
    }
    function printAllStreaks() {
      const names = Object.values(streakMapping);
      const vals  = names.map((n) => `${n}:${getStreak(n)}`);
      console.log("Current Streaks:", vals.join(", "));
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node instanceof HTMLElement
            ) {
              const text = node.innerText?.toLowerCase();

              // correct detection
              if (
                text?.includes(t("load-next-exercise").toLowerCase()) ||
                text?.includes(t("undefined-exercise-series").toLowerCase()) ||
                text?.includes(t("completed-exercise-series").toLowerCase()) ||
                text?.includes(t("system-solution-success").toLowerCase())
              ) {
                console.log("Correct action detected", mainRoute);
                const cookieName = streakMapping[mainRoute.toLowerCase()];
                if (cookieName) {
                  const cur = getStreak(cookieName);
                  setStreak(cookieName, cur + 1);
                }
                printAllStreaks();

                // lock green across routes
                //setCookie("TaskSuccess", "1");
                // instantly repaint green
                updateGoalTextColor();
              }

              // incorrect detection
              if (
                text?.includes("unfortunately") ||
                text?.includes("leider") || text?.includes("try again") || text?.includes("versuch")
              ) {
                console.log("Incorrect action detected");
                const cookieName = streakMapping[mainRoute.toLowerCase()];
                if (cookieName) {
                  setStreak(cookieName, 0);
                }
                setIncorrectFlag();
                printAllStreaks();
              }
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree:   true,
    });
    return () => observer.disconnect();
  }, [mainRoute, currentExercise]);


// DETECT CHANGE GOAL IN FLEXIBILITY
useEffect(() => {
            // fires on every click in the page
            const handleDocumentClick = (event) => {
              const btn = event.target;
              if (
                btn instanceof HTMLButtonElement &&
                btn.classList.contains('primary-button') &&
                btn.textContent.trim() === 'Change goal'
              ) {
                setOverlayVisible(true);
              }
            };

            document.addEventListener('click', handleDocumentClick);
            return () => {
              document.removeEventListener('click', handleDocumentClick);
            };
          }, [setOverlayVisible]);


  // Detect total questins encountered
  useEffect(() => {
              // only count when we have a real exercise number
              // and we’re on one of the four “task” routes
              const validRoutes = [
                "equalization",
                "substitution",
                "elimination",
                "flexibility-training",
              ];

              if (
                typeof currentExercise === "number" &&
                validRoutes.includes(mainRoute.toLowerCase())
              ) {
                // read old value (default to 0), increment, write back
                const prevVal = parseInt(getCookie("questionsEncountered") || "0", 10);
                const nextVal = prevVal + 1;
                setCookie("questionsEncountered", nextVal.toString());
                console.log(`questionsEncountered → ${nextVal}`);
              }
            }, [mainRoute, currentExercise]);





  return (
    <>
      <div className={`navigation ${isStudy ? "study" : ""}`} style={style}>
        <img src={Logo} alt="logo" onClick={() => handleClick(true)} />
        <FontAwesomeIcon icon={faChevronRight} />
        <p className={`main-route ${isStudy ? "study" : ""}`} onClick={() => handleClick(false)}>
          {t(mainRoute)}
        </p>
        {subRoute && (
          <>
            <FontAwesomeIcon icon={faChevronRight} />
            <p>{t(subRoute)}</p>
          </>
        )}
        {currentExercise != null && (
          <>
            <FontAwesomeIcon icon={faChevronRight} />
            <p>
              {t(GeneralTranslations.NAV_EXERCISE)} {currentExercise}
              {exercisesCount != null ? ` / ${exercisesCount}` : ""}
            </p>
          </>
        )}
        <div className="current-goal" onClick={() => setOverlayVisible((p) => !p)}>
          <p>
            <b style={{ color: goalTextColor }}>{displayGoalText}</b>
          </p>
        </div>
      </div>

      {overlayVisible && (
        <div className="overlay-window" onClick={() => setOverlayVisible(false)}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: "2rem" }}>{t("goal-setting")}</h2>
            <p style={{ marginBottom: "2rem" }}>
              {t("current-goal")}:{" "}
              <select
                className="goal-select"
                value={goal}
                onChange={onGoalChange}
                style={{ borderColor: taskSuccess ? "#7AE361" : undefined }}
              >
                {goalOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              {goal !== t("none") && (
                <>
                  {" "}
                  →{" "}
                  <select
                    className="goal-select"
                    value={method}
                    onChange={onMethodChange}
                    style={{ borderColor: taskSuccess ? "#7AE361" : undefined }}
                  >
                    {filteredMethodOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>

                  {taskSuccess && (
                    <img
                      src="https://i.imgur.com/V3nWDuX.png"
                      alt="success"
                      onClick={() => {
                        const streaks = [
                          "EqualizationStreak",
                          "SubstitutionStreak",
                          "EliminationStreak",
                          "FlexibilityStreak",
                        ];
                        streaks.forEach((n) => setCookie(n, "0"));
                        setCookie("IncorrectFlag", "0");
                        setCookie("Task5Completed","0");
                        setCookie("TaskSuccess","0");
                        console.log("Goal reset");
                        setGoalTextColor("#fff");
                      }}
                      style={{
                        width:        "2rem",
                        height:       "auto",
                        marginLeft:   "0.75rem",
                        verticalAlign:"middle",
                        cursor:       "pointer",
                        transition:   "transform 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  )}

                  {redirectUrl && (
                    <img
                      src="https://i.imgur.com/Ykw7gmT.png"
                      alt="go"
                      onClick={() => (window.location.href = redirectUrl!)}
                      style={{
                        width:        "2rem",
                        height:       "auto",
                        marginLeft:   "0.25rem",
                        verticalAlign:"middle",
                        cursor:       "pointer",
                        transition:   "transform 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  )}
                </>
              )}
            </p>

            <div style={{ maxWidth: "500px", margin: "0 auto", marginBottom: "1rem" }}>
              <h2
                style={{
                  fontSize:   "1.25rem",
                  fontWeight: "600",
                  textAlign:  "center",
                  marginBottom:"1.5rem",
                }}
              >
                {t("progress-overview")}
              </h2>
              {progressData ? (
                progressData.map(({ method, percent }, index) => {
                  const isLast = index === progressData.length - 1;
                  return (
                    <div key={method} style={{ marginTop: "1rem", display: "flex", alignItems: "center" }}>
                      <span style={{ width: 120, textAlign: "right", opacity: 0.7 }}>{method}</span>
                      <div
                        style={{
                          flexGrow:       1,
                          height:         "1.5rem",
                          backgroundColor:"#ddd",
                          borderRadius:   "2rem",
                          overflow:       "hidden",
                          marginLeft:     "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width:           `${percent}%`,
                            height:          "100%",
                            backgroundColor: isLast ? "#323F4F" : "#7AE361",
                            borderRadius:    "1rem 0 0 1rem",
                            transition:      "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Loading progress...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  function handleClick(isHome: boolean): void {
    if (isStudy) return;
    if (handleSelection) handleSelection(isHome);
  }
}
