import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";

const changelog = defineCollection({
    name: "changelog",
    directory: "src/posts",
    include: "**/*.mdx",
    schema: (z) => ({
        title: z.string(),
        summary: z.string(),
        date: z.string()
    }),
    transform: async (document, context) => {
        const mdx = await compileMDX(context, document);
        const date = new Date(document.date);
        const dateDocument = (({ date, ...rest }) => rest)(document)
        return {
            ...dateDocument,
            date,
            mdx,
        };
    },
});

export default defineConfig({
    collections: [changelog],
});