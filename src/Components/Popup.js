import React from "react";


export function DialogDefault() {
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen(!open);

    return (
        <>
            <Button onClick={handleOpen} variant="gradient">
                Open Dialog
            </Button>


        </>
    );
}