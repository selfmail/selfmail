"use client"
import { MDXContent } from "@content-collections/mdx/react";
import { ElementType } from "react";

type StringComponent = Extract<keyof JSX.IntrinsicElements, ElementType extends never ? string : ElementType>;
type ClassElementType = Extract<ElementType, new (props: Record<string, any>) => any>;
type FunctionElementType = Extract<ElementType, (props: Record<string, any>) => any>;
type FunctionComponent<Props> = ElementType extends never
    ? (props: Props) => Element | null
    : FunctionElementType extends never
    ? never
    : (props: Props) => ReturnType<FunctionElementType>;

type ClassComponent<Props> = ElementType extends never
    ? new (props: Props) => JSX.ElementClass
    : ClassElementType extends never
    ? never
    : new (props: Props) => InstanceType<ClassElementType>;
type Component<Props> = FunctionComponent<Props> | ClassComponent<Props> | StringComponent;

interface NestedMDXComponents {
    [key: string]: NestedMDXComponents | Component<any>;
}
type MDXComponents =
    & NestedMDXComponents
    & {
        [Key in StringComponent]?: Component<JSX.IntrinsicElements[Key]>;
    }
    & {
        wrapper?: Component<any>;
    };
type MDXContentProps = {
    [props: string]: unknown
    components?: MDXComponents
}

const Render: React.FC<MDXContentProps & {
    code: string;
}> = ({ code, ...props }) => {
    return <MDXContent {...props} code={code} />;
};

export default Render;