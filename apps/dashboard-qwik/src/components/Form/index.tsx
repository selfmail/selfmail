import { component$ } from '@builder.io/qwik';

export interface FormProps extends React.HTMLAttributes<HTMLFormElement> { }

export const Form = component$<FormProps>((props) => {
  return (
    <form {...props} class={`w-full ${props.class ?? ''}`.trim()} />
  );
});
