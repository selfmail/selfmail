import { component$ } from '@builder.io/qwik';

export interface ButtonProps {

}

export const Button = component$<ButtonProps>((props) => {
  return (
    <div>
      Button component works!
    </div>
  );
});
