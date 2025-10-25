import { component$, type QwikIntrinsicElements } from '@builder.io/qwik';

export interface TextareaProps extends Omit<QwikIntrinsicElements['textarea'], 'class'> {
    class?: string;
}

export const Textarea = component$<TextareaProps>((props) => {
    const { class: className = '', ...restProps } = props;

    return (
        <textarea
            class={`flex min-h-[80px] w-full resize-none rounded-md border border-neutral-100 bg-neutral-100 px-3 py-2 text-sm outline-none ring-offset-background transition-all placeholder:text-muted-foreground hover:bg-neutral-200 focus-visible:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...restProps}
        />
    );
});