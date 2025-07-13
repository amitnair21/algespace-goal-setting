// Importing ReactElement type from React library
// ReactElement represents the kind of thing React components return (like a description of UI elements)
import { ReactElement } from "react";

// Importing DragSource enum from your project — this helps identify where a draggable item comes from
import { DragSource } from "@/types/equalization/enums";

// Importing some constants related to equalization exercises, such as max items allowed on digital scale
import { EqualizationConstants } from "@/types/equalization/equalizationConstants.ts";

// Importing the EqualizationItem type which describes the shape of an item that can be placed on the scale
import { EqualizationItem } from "@/types/shared/item";

// Importing a utility function that adds up the weight values of all items in a list
import { sumWeightOfItems } from "@utils/utils";

// Importing a reusable React component called ScaleDropzone which is a drag-and-drop target area
import ScaleDropzone from "./ScaleDropzone";

// This is the main exported React component function named DigitalScale
// It takes two props:
// - 'items': an array of EqualizationItems currently on the scale
// - 'isValidDropzone': a function to check if a dragged item can be dropped on this scale
// The function returns a ReactElement which describes what should appear on screen
export default function DigitalScale({
    items,
    isValidDropzone,
}: {
    items: EqualizationItem[];
    isValidDropzone: (target: DragSource) => boolean;
}): ReactElement {

    // The return statement describes the UI that will be rendered for this component
    // Everything inside the parentheses is JSX — a syntax that looks like HTML but is JavaScript
    return (
        // This outer div wraps the whole digital scale UI
        // The className "digital-scale" is used for styling this container via CSS
        <div className={"digital-scale"}>

            {/*
                ScaleDropzone is a special area where users can drag and drop items.
                Here we pass it:
                - items: all the current items on this scale
                - margin: CSS margin for spacing around the drop zone ("4.5rem")
                - source: identifies this drop zone as belonging to the DigitalScale drag source category
                - isValidDropzone: function to validate if dropping an item here is allowed
                - maxCapacity: maximum number of items allowed, from your constants file
            */}
            <ScaleDropzone
                items={items}
                margin={"4.5rem"}
                source={DragSource.DigitalScale}
                isValidDropzone={isValidDropzone}
                maxCapacity={EqualizationConstants.MAX_ITEMS_DIG_SCALE}
            />

            {/*
                This div shows the total weight of all items on the scale, styled with two CSS classes.
                It visually looks like an "image equation" (probably styled to look like a digital readout).
            */}
            <div className={"image-equation digital-scale__equation"}>

                {/*
                    This paragraph displays the total weight in grams.
                    sumWeightOfItems(items) runs the utility function that adds all item weights together.
                    The result is then shown followed by the string " g" to denote grams.
                */}
                <p>{sumWeightOfItems(items)} g</p>
            </div>
        </div>
    );
}
