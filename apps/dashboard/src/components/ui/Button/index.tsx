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
  const classString = typeof props.class === 'string' ? props.class : '';
  const hasCustomStyles = classString.includes('bg-') || classString.includes('text-') || classString.includes('hover:');
  
  const defaultClasses = hasCustomStyles 
    ? "inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-1 text-lg transition-colors transition-transform active:scale-97"
    : "inline-flex cursor-pointer items-center justify-center rounded-xl bg-neutral-800 px-4 py-1 text-lg text-white transition-colors transition-transform hover:bg-neutral-700 active:scale-97 disabled:bg-neutral-600";
  
  return (
    <button
      {...props}
      class={`${defaultClasses} ${classString}`}
    >
      <Slot />
    </button>
  );
});
