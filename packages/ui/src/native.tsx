import type {
  ComponentPropsWithoutRef,
  ElementType,
  PropsWithChildren,
  ReactNode,
} from "react";
import { selfmailPalette, selfmailTokens } from "./lib/brand";

type NativeStyleValue = number | string | undefined;
type NativeStyle = Record<string, NativeStyleValue>;
type NativePrimitiveProps = {
  children?: ReactNode;
  style?: NativeStyle | NativeStyle[];
};

type NativePressableProps = NativePrimitiveProps & {
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress?: () => void;
};

type NativePrimitives = {
  Pressable: ElementType<NativePressableProps>;
  Text: ElementType<NativePrimitiveProps>;
  View: ElementType<NativePrimitiveProps>;
};

const missingNativeProvider = () => {
  throw new Error("Wrap native UI components in <NativeProvider primitives={...}> before rendering.");
};

let primitives: NativePrimitives = {
  Pressable: missingNativeProvider as unknown as ElementType<NativePressableProps>,
  Text: missingNativeProvider as unknown as ElementType<NativePrimitiveProps>,
  View: missingNativeProvider as unknown as ElementType<NativePrimitiveProps>,
};

function mergeNativeStyles(...styles: Array<NativeStyle | NativeStyle[] | undefined>) {
  return styles.flatMap((style) => (Array.isArray(style) ? style : style ? [style] : []))
    .reduce<NativeStyle>((acc, style) => ({ ...acc, ...style }), {});
}

export const selfmailNativeTokens = {
  colors: selfmailTokens,
  palette: selfmailPalette,
  radius: {
    sm: 12,
    md: 16,
    lg: 24,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
  },
} as const;

export function NativeProvider({
  children,
  primitives: nextPrimitives,
}: PropsWithChildren<{ primitives: NativePrimitives }>) {
  primitives = nextPrimitives;
  return <>{children}</>;
}

export function View({ style, ...props }: NativePrimitiveProps) {
  const Comp = primitives.View;
  return <Comp style={style} {...props} />;
}

export function Text({ style, ...props }: NativePrimitiveProps) {
  const Comp = primitives.Text;
  return <Comp style={style} {...props} />;
}

export function Stack({
  gap = selfmailNativeTokens.spacing.md,
  horizontal,
  style,
  ...props
}: NativePrimitiveProps & { gap?: number; horizontal?: boolean }) {
  return (
    <View
      style={mergeNativeStyles(
        {
          display: "flex",
          flexDirection: horizontal ? "row" : "column",
          gap,
        },
        style
      )}
      {...props}
    />
  );
}

export function Button({
  accessibilityLabel,
  children,
  disabled,
  onPress,
  style,
}: NativePressableProps) {
  const Pressable = primitives.Pressable;
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={mergeNativeStyles(
        {
          alignItems: "center",
          backgroundColor: selfmailNativeTokens.colors.light.primary,
          borderRadius: selfmailNativeTokens.radius.md,
          justifyContent: "center",
          opacity: disabled ? 0.6 : 1,
          paddingHorizontal: selfmailNativeTokens.spacing.lg,
          paddingVertical: selfmailNativeTokens.spacing.md,
        },
        style
      )}
    >
      <Text
        style={{
          color: selfmailNativeTokens.colors.light.primaryForeground,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function Card({ style, ...props }: NativePrimitiveProps) {
  return (
    <View
      style={mergeNativeStyles(
        {
          backgroundColor: selfmailNativeTokens.colors.light.card,
          borderColor: selfmailNativeTokens.colors.light.border,
          borderRadius: selfmailNativeTokens.radius.lg,
          borderWidth: 1,
          padding: selfmailNativeTokens.spacing.xl,
        },
        style
      )}
      {...props}
    />
  );
}

export type NativeViewProps = ComponentPropsWithoutRef<typeof View>;
export type NativeTextProps = ComponentPropsWithoutRef<typeof Text>;
