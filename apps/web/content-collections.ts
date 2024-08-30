import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMarkdown } from "@content-collections/markdown";

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
        const html = await compileMarkdown(context, document);
        const date = new Date(document.date);
        const dateDocument = (({ date, ...rest }) => rest)(document)
        return {
            ...dateDocument,
            date,
            html,
        };
    },
});

export default defineConfig({
    collections: [changelog],
});