export type EvidenceCategory =
  | "reputation"
  | "authentication"
  | "content"
  | "malware"
  | "url"
  | "behavior";

export interface Evidence {
  readonly id: string;
  readonly detector: string;
  readonly category: EvidenceCategory;

  /**
   */
  readonly score: number;

  /**
   */
  readonly confidence: number;

  readonly reason: string;

  readonly tags: readonly string[];

  readonly metadata?: Readonly<Record<string, unknown>>;
}
