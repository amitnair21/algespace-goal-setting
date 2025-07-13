// React imports: ReactElement type and useMemo hook for memoizing calculations.
import { ReactElement, useMemo } from "react";

// Import enums used to identify drag sources and types of equalization items.
import { DragSource, EqualizationItemType } from "@/types/equalization/enums";

// Import constants for the equalization module (e.g., max items allowed on scale).
import { EqualizationConstants } from "@/types/equalization/equalizationConstants.ts";

// Import the EqualizationExercise type, representing an exercise data structure.
import { EqualizationExercise } from "@/types/equalization/equalizationExercise";

// Import math-related types for building equation terms.
import { Coefficient } from "@/types/math/coefficient.ts";
import { Operator, RelationSymbol } from "@/types/math/enums";
import { LinearEquation as LinearEquationProps } from "@/types/math/linearEquation";
import { Term } from "@/types/math/term";

// Import the EqualizationItem type (general item used on the scale).
import { EqualizationItem } from "@/types/shared/item";

// Import component to render the equation visually as an image.
import ImageEquation from "@components/math/conceptual-knowledge/ImageEquation.tsx";

// Import utility function to sum weights of items.
import { sumWeightOfItems } from "@utils/utils";

// Import images representing different states of the balance scale (balanced, left down, right down).
import BalancedScale from "@images/equalization/balancedScale.png";
import LeftScale from "@images/equalization/leftScale.png";
import RightScale from "@images/equalization/rightScale.png";

// Import a component that serves as the drop zone on each side of the scale.
import ScaleDropzone from "./ScaleDropzone";

// Main component to render the balance scale with items on left and right plates, and the equation showing their relation.
export default function BalanceScale({
    exercise,
    leftItems,
    rightItems,
    isValidDropzone,
}: {
    exercise: EqualizationExercise;
    leftItems: EqualizationItem[];
    rightItems: EqualizationItem[];
    isValidDropzone: (target: DragSource) => boolean;
}): ReactElement {
    // Compute the math terms represented by items on the left side, memoizing to avoid unnecessary recalculations.
    const leftTerms: Term[] = useMemo(() => {
        return computeTerms(exercise, leftItems);
    }, [exercise, leftItems]);

    // Compute the math terms represented by items on the right side.
    const rightTerms: Term[] = useMemo(() => {
        return computeTerms(exercise, rightItems);
    }, [exercise, rightItems]);

    // Determine the relation symbol (equal, smaller, larger) based on weights on both sides.
    const relation: RelationSymbol = useMemo(() => {
        return determineRelationSymbol(leftItems, rightItems);
    }, [leftItems, rightItems]);

    // Construct a LinearEquation object from the left and right terms and the relation symbol.
    const equation: LinearEquationProps = new LinearEquationProps(leftTerms, rightTerms, relation);

    // CSS height values to visually position scale plates based on balance.
    const equalHeight: string = "7.48rem";
    const minHeight: string = "6.23rem";
    const maxHeight: string = "9.98rem";

    // Variables to hold the image and margin styles depending on the scale balance.
    let backgroundImage: string;
    let marginBottomLeft: string;
    let marginBottomRight: string;

    // Select background image and margin sizes depending on relation (balance state).
    switch (relation) {
        case RelationSymbol.Equal: {
            backgroundImage = BalancedScale;        // Balanced scale image
            marginBottomLeft = equalHeight;         // Both sides at equal height
            marginBottomRight = equalHeight;
            break;
        }
        case RelationSymbol.Smaller: {
            backgroundImage = RightScale;           // Right side heavier, scale tilts right
            marginBottomLeft = maxHeight;           // Left plate is higher
            marginBottomRight = minHeight;          // Right plate is lower
            break;
        }
        case RelationSymbol.Larger: {
            backgroundImage = LeftScale;            // Left side heavier, scale tilts left
            marginBottomLeft = minHeight;           // Left plate lower
            marginBottomRight = maxHeight;          // Right plate higher
            break;
        }
    }

    // Render the balance scale container with the chosen background image and dynamic classes.
    return (
        <div className={`balance-scale${relation === RelationSymbol.Equal ? "--balanced" : "--imbalanced"}`} style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className={"balance-scale__plates"}>
                {/* Left drop zone: accepts draggable items, shows items placed on left plate */}
                <ScaleDropzone
                    items={leftItems}
                    margin={marginBottomLeft}
                    source={DragSource.BalanceScaleLeft}
                    isValidDropzone={isValidDropzone}
                    maxCapacity={exercise.maximumCapacity ?? EqualizationConstants.MAX_ITEMS_SCALE}
                />
                {/* Right drop zone: same as left but for right plate */}
                <ScaleDropzone
                    items={rightItems}
                    margin={marginBottomRight}
                    source={DragSource.BalanceScaleRight}
                    isValidDropzone={isValidDropzone}
                    maxCapacity={exercise.maximumCapacity ?? EqualizationConstants.MAX_ITEMS_SCALE}
                />
            </div>
            <div className={"balance-scale__equation"}>
                {/* Render the visual equation representing the balance state */}
                <ImageEquation equation={equation} style={{ color: "var(--dark-text)" }} />
            </div>
        </div>
    );
}

// Helper function to determine if left and right plates are balanced, or which is heavier.
function determineRelationSymbol(itemsLeft: EqualizationItem[], itemsRight: EqualizationItem[]): RelationSymbol {
    // Sum the weights of items on each side.
    const leftWeight: number = sumWeightOfItems(itemsLeft);
    const rightWeight: number = sumWeightOfItems(itemsRight);

    // Return the relation symbol according to comparison.
    if (leftWeight === rightWeight) {
        return RelationSymbol.Equal;
    } else if (leftWeight > rightWeight) {
        return RelationSymbol.Larger;
    } else {
        return RelationSymbol.Smaller;
    }
}

// Helper function to convert an array of items on one side into an array of equation terms.
// This constructs terms for isolated variables, second variables, and weights based on item counts.
function computeTerms(exercise: EqualizationExercise, items: EqualizationItem[]): Term[] {
    let isolatedVarCount: number = 0;  // Count of isolated variable items on this side.
    let secondVarCount: number = 0;    // Count of second variable items.
    let weightsCount: number = 0;      // Total weight of all weight items.

    // Loop over each item and increment counters accordingly.
    items.forEach((item: EqualizationItem): void => {
        switch (item.itemType) {
            case EqualizationItemType.IsolatedVariable: {
                isolatedVarCount++;
                break;
            }
            case EqualizationItemType.SecondVariable: {
                secondVarCount++;
                break;
            }
            case EqualizationItemType.Weight: {
                weightsCount += item.weight;
                break;
            }
        }
    });

    // Build an array of terms representing the left or right side of the equation.
    let terms: Term[] = [];

    // Add term for isolated variable, if any.
    if (isolatedVarCount > 0) {
        terms = [...terms, new Term(null, Coefficient.createNumberCoefficient(isolatedVarCount), exercise.isolatedVariable.name)];
    }

    // Add term for second variable, with operator plus if isolated variable was already added.
    if (secondVarCount > 0) {
        if (isolatedVarCount > 0) {
            terms = [...terms, new Term(Operator.Plus, Coefficient.createNumberCoefficient(secondVarCount), exercise.secondVariable.name)];
        } else {
            terms = [...terms, new Term(null, Coefficient.createNumberCoefficient(secondVarCount), exercise.secondVariable.name)];
        }
    }

    // Add weights term if there were any variable terms already or just weights alone.
    if (isolatedVarCount > 0 || secondVarCount > 0) {
        if (weightsCount > 0) {
            terms = [...terms, new Term(Operator.Plus, Coefficient.createNumberCoefficient(weightsCount), EqualizationConstants.WEIGHT_VAR)];
        }
    } else {
        // Only weights with no variables.
        terms = [...terms, new Term(null, Coefficient.createNumberCoefficient(weightsCount), EqualizationConstants.WEIGHT_VAR)];
    }

    return terms;
}
