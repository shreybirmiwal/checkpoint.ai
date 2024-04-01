import React, { useEffect } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";

export function TopMistakes() {

    return (
        <>
            <Accordion >
                <AccordionHeader className="text-sm pt-0">
                    What is Material Tailwind?
                </AccordionHeader>
            </Accordion>
            <Accordion>
                <AccordionHeader className="text-sm">
                    How to use Material Tailwind?
                </AccordionHeader>
            </Accordion>
            <Accordion >
                <AccordionHeader className="text-sm">
                    What can I do with Material Tailwind?
                </AccordionHeader>
            </Accordion>
        </>
    );
}