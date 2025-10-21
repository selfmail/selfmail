import { component$ } from "@builder.io/qwik";
import Wait from "~/components/dashboard/wait";
import BackHeading from "~/components/ui/BackHeading";

export default component$(() => {
    return (
        <>
            <BackHeading>AI</BackHeading>
            <Wait />
        </>
    )
})