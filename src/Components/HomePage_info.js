import React from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";

export function HomePage_info() {
    const [open, setOpen] = React.useState(1);

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    return (
        <div className="mb-15 p-10 bg-gray-100 shadow-2xl rounded-xl">
            <p className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-10"> How is checkpoint.ai different from competitors?</p>
            <Accordion open={open === 1}>
                <AccordionHeader onClick={() => handleOpen(1)}>Checkpoint isn't just for essays.</AccordionHeader>
                <AccordionBody>
                    While other 'ai graders' grade essays for english, checkpoint can work for any type of assignment from chemistry, physics, computer science, english, history and more.
                </AccordionBody>
            </Accordion>
            <Accordion open={open === 2}>
                <AccordionHeader onClick={() => handleOpen(2)}>
                    Checkpoint is 100x more accurate than competitors.
                </AccordionHeader>
                <AccordionBody>
                    AI is really really bad at solving math problems on it's own. That's why checkpoint is not completly AI backed, it still requires teachers to input correct steps/work as well as 'hints' for the AI. Because of this, our checkpoint.ai is 10-100X more accurate and specific when giving feedback as opposed to raw gpt output.
                </AccordionBody>
            </Accordion>
            <Accordion open={open === 3}>
                <AccordionHeader onClick={() => handleOpen(3)}>
                    It's not a grader, it's a feedback tool with analytics.
                </AccordionHeader>
                <AccordionBody>
                    Other ai graders grade for teachers. We provide feedback for students AND teachers, such as 'common mistakes', 'personalized feedback' and more.
                </AccordionBody>
            </Accordion>
            <div />
        </div>
    );
}