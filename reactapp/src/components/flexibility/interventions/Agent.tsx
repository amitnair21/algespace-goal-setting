import { ReactElement } from "react";
import { AgentExpression, AgentType } from "@/types/flexibility/enums.ts";
import { getAgentImageSource } from "@utils/agentImageLoader.ts";

export function Agent({ type, expression }: { type: AgentType; expression: AgentExpression }): ReactElement {
    return (
        <div className={`agent-image__container${isMaleAgent(type) ? "--large" : "--normal"}`}>
            <img src={getAgentImageSource(type, expression)} alt={"pedagogical agent"} />
        </div>
    );
}

function isMaleAgent(type: AgentType): boolean {
    return !(type === AgentType.FemaleAfrican || type === AgentType.FemaleAsian || type === AgentType.FemaleCaucasian || type === AgentType.FemaleEastern);
}
