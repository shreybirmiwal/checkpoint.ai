import React from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";

export function AccordianOuter({ common_mistakes }) {
    const [open, setOpen] = React.useState();

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    return (
        <>
            <Accordion open={open === 1} >
                <AccordionHeader className='font-bold text-xl text-purple-600 underline mb-2' onClick={() => handleOpen(1)}>Top Mistakes</AccordionHeader>
                <AccordionBody>
                    {common_mistakes.map((mistake, index) => (
                        <Accordion key={index}>
                            <AccordionHeader className="text-sm">
                                {mistake}
                            </AccordionHeader>
                        </Accordion>
                    ))}
                </AccordionBody>
            </Accordion>
            <Accordion open={open === 2} >
                <AccordionHeader className='font-bold text-xl text-purple-600 underline mb-2' onClick={() => handleOpen(2)}>Student results</AccordionHeader>
                <AccordionBody>
                    {/* {studentRes.map((mistake, index) => (
                        <Accordion key={index}>
                            <AccordionHeader className="text-sm">
                                {mistake}
                            </AccordionHeader>
                        </Accordion>
                    ))} */}
                </AccordionBody>
            </Accordion>
            <Accordion open={open === 3} >
                <AccordionHeader className='font-bold text-xl text-purple-600 underline mb-2' onClick={() => handleOpen(3)}>Overall analytics</AccordionHeader>
                <AccordionBody>
                </AccordionBody>
            </Accordion>
        </>
    );
}