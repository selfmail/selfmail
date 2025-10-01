import { component$, type HTMLAttributes, Slot } from "@builder.io/qwik";

type ButtonProps = {} & {
  disabled?: boolean | undefined;
  formAction?: string | undefined;
  formEnctype?: string | undefined;
  formMethod?: string | undefined;
  formNoValidate?: boolean | undefined;
  formTarget?: string | undefined;
  name?: string | undefined;
  type?: "button" | "reset" | "submit" | undefined;
  popoverTargetAction?: string | undefined;
  form?: string | undefined | undefined;
  value?: string | number | readonly string[] | undefined;
  popovertarget?: string | undefined | undefined;
  popovertargetaction?: undefined;
} & HTMLAttributes<HTMLButtonElement>;

export const Button = component$<ButtonProps>((props) => {
  return (
    <button
      {...props}
      class={`inline-flex cursor-pointer items-center justify-center rounded-xl bg-neutral-800 px-4 py-1 text-lg text-white transition-colors hover:bg-neutral-700 ${props.class ?? ""}`}
    >
      <Slot />
    </button>
  );
});
