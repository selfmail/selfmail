import { defineCollection, defineConfig } from "@content-collections/core";

const changelog = defineCollection({
    name: "changelog",
    directory: "src/posts",
    include: "**/*.mdx",
    schema: (z) => ({
        title: z.string(),
        summary: z.string(),
    }),
});

export default defineConfig({
    collections: [changelog],
});