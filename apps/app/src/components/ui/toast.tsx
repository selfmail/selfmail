import { Action, Root } from '@rn-primitives/toast';
import * as react_native from 'react-native';
import { View } from "react-native";

export const Toast = Root
export const ToastTrigger: React.FC<Omit<react_native.PressableProps & React.RefAttributes<View>, "ref"> & {
    asChild?: boolean;
} & {
    onKeyDown?: (ev: React.KeyboardEvent) => void;
    onKeyUp?: (ev: React.KeyboardEvent) => void;
} & React.RefAttributes<View>> = ({
    children,
    ...props
}) => {
        return <Action {...props}>{children}</Action>;
    };
