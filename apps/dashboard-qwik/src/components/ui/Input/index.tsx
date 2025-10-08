import { component$, type QwikIntrinsicElements } from '@builder.io/qwik';

export interface InputProps extends Omit<QwikIntrinsicElements['input'], 'class'> {
  class?: string;
}

export const Input = component$<InputProps>((props) => {
  const { type = 'text', class: className = '', ...restProps } = props;

  return (
    <input
      type={type}
      class={`flex h-9 w-full rounded-md border border-neutral-100 bg-neutral-100 px-3 py-2 text-sm outline-none ring-offset-background transition-all file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground hover:bg-neutral-200 focus-visible:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...restProps}
    />
  );
});
