"use client"

import type { PageTree } from "fumadocs-core/server";

interface Components {
    Item: React.FC<{
        item: PageTree.Item;
    }>;
    Folder: React.FC<{
        item: PageTree.Folder;
        level: number;
    }>;
    Separator: React.FC<{
        item: PageTree.Separator;
    }>;
}
export const Components: Partial<Components> = {
    Item: ({ item }) => <div>{item.name}</div>,
    Folder: ({ item, level }) => <div>hey{item.name}</div>,
}