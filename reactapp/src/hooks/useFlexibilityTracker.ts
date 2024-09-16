import { IUser } from "@/types/studies/user.ts";
import {
    FlexibilityExerciseActionPhase,
    FlexibilityExerciseChoicePhase,
    FlexibilityExercisePhase,
    FlexibilityStudyExerciseType
} from "@/types/studies/enums.ts";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "@/types/shared/axiosInstance.ts";
import { AgentCondition, AgentType } from "@/types/flexibility/enums.ts";
import { getTime } from "@utils/utils.ts";

export default function useFlexibilityTracker(useLogger: boolean, user: IUser, studyId: number, flexibilityId: number, exerciseId: number, exerciseType: FlexibilityStudyExerciseType, currentTime: number, agentCondition: AgentCondition, agentType?: AgentType, initialPhase?: FlexibilityExercisePhase) {
    const exerciseStartTime = useRef<number>(currentTime);

    const [entryId, setEntryId] = useState<number>();

    const [errors, setErrors] = useState<number>(0);

    const [phase, setPhase] = useState<FlexibilityExercisePhase>(initialPhase ?? FlexibilityExercisePhase.Transformation);
    const [startTimeInPhase, setStartTimeInPhase] = useState<number>(0);
    const [errorsInPhase, setErrorsInPhase] = useState<number>(0);

    useEffect(() => {
        const fetchRowId = async (userId: number, username: string) => {
            try {
                const response = await axiosInstance.put(
                    "/flexibility-study/createEntry",
                    { userId, username, studyId, flexibilityId, exerciseId, exerciseType, agentCondition, agentType },
                    {
                        headers: {
                            Authorization: "Bearer " + user.token
                        }
                    }
                );
                setEntryId(response.data);
            } catch (error) {
                console.error(error);
                throw new Error("Server initialization for tracking failed: " + error);
            }
        };

        if (useLogger) {
            fetchRowId(user.id, user.username);
        }
    }, [useLogger, user, studyId, flexibilityId, exerciseId, exerciseType, agentCondition, agentType]);

    function initializeTrackingPhase(phase: FlexibilityExercisePhase): void {
        if (useLogger) {
            setPhase(phase);
            setStartTimeInPhase(performance.now());
            setErrorsInPhase(0);
        }
    }

    function trackActionInPhase(action: string, phase: FlexibilityExerciseActionPhase): void {
        if (useLogger) {
            const data = { userId: user.id, username: user.username, studyId, id: entryId, phase, action };
            sendData(data);
        }
    }

    function trackChoice(choice: string, phase: FlexibilityExerciseChoicePhase): void {
        if (useLogger) {
            const data = { userId: user.id, username: user.username, studyId, id: entryId, phase, choice };
            sendData(data, "trackChoice");
        }
    }

    function trackErrorInPhase(): void {
        if (useLogger) {
            setErrors((previousErrors: number) => previousErrors + 1);
            setErrorsInPhase((previousErrors: number) => previousErrors + 1);
        }
    }

    function setNextTrackingPhase(newPhase: FlexibilityExercisePhase, choice?: string): void {
        if (useLogger) {
            endTrackingPhase(choice);
            setPhase(newPhase);
            setStartTimeInPhase(performance.now());
            setErrorsInPhase(0);
        }
    }

    function endTrackingPhase(choice?: string): void {
        if (useLogger) {
            const time: number = getTime(startTimeInPhase);

            let data;
            if (phase === FlexibilityExercisePhase.Comparison || phase === FlexibilityExercisePhase.ResolveConclusion) {
                data = { userId: user.id, username: user.username, studyId, id: entryId, time, errors: 0, phase, choice };
            } else {
                data = { userId: user.id, username: user.username, studyId, id: entryId, time, errors: errorsInPhase, phase };
            }
            sendDataOnPhaseEnd(data);
        }
    }

    function endTracking(): void {
        if (useLogger) {
            sendDataOnEnd();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function sendData(data: any, route: string = "addActionToEntry"): Promise<void> {
        try {
            await axiosInstance.post(`/flexibility-study/${route}`, data, {
                headers: {
                    Authorization: "Bearer " + user.token
                }
            });
        } catch (error) {
            console.error(error);
            throw new Error("Sending tracked action data failed: " + error);
        }
    }

    async function sendDataOnEnd(): Promise<void> {
        const time: number = getTime(exerciseStartTime.current);
        try {
            await axiosInstance.post(`/flexibility-study/completeTracking`,
                { userId: user.id, username: user.username, studyId, id: entryId, time, errors },
                {
                    headers: {
                        Authorization: "Bearer " + user.token
                    }
                }
            );
        } catch (error) {
            console.error(error);
            throw new Error("Sending final tracking data failed: " + error);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function sendDataOnPhaseEnd(data: any): Promise<void> {
        try {
            await axiosInstance.post(`/flexibility-study/completePhaseTracking`, data, {
                headers: {
                    Authorization: "Bearer " + user.token
                }
            });
        } catch (error) {
            console.error(error);
            throw new Error("Sending tracking data on phase end failed: " + error);
        }
    }

    return {
        initializeTrackingPhase,
        trackActionInPhase,
        trackChoice,
        trackErrorInPhase,
        setNextTrackingPhase,
        endTrackingPhase,
        endTracking
    };
}