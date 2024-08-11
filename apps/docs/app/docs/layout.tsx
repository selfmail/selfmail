import { DocsLayout } from 'fumadocs-ui/layout';
import type { ReactNode } from 'react';
import { docsOptions } from '../layout.config';
import { Components } from "./components";

export default function Layout({ children }: { children: ReactNode }) {
  return <DocsLayout sidebar={{
    enabled: true,
    defaultOpenLevel: 1,
    components: {
      ...Components
    }
  }} {...docsOptions}>{children}</DocsLayout>;
}
