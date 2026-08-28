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
   * 0–100
   * Wie verdächtig ist dieses Signal?
   */
  readonly score: number;

  /**
   * 0–1
   * Wie sehr vertrauen wir diesem Signal?
   */
  readonly confidence: number;

  readonly reason: string;

  readonly tags: readonly string[];

  readonly metadata?: Readonly<Record<string, unknown>>;
}
