export type BlockType =
  | "hero"
  | "about"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "achievements"
  | "proof"
  | "links"
  | "contact"

export interface BlockProps {
  config: Record<string, unknown>
  profile: any // será tipado com o tipo completo do profile
  version?: any
  isPreview?: boolean
}
