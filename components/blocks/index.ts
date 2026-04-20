import { BlockType, BlockProps } from "./types";
import type { ComponentType } from "react";

import HeroBlock from "./HeroBlock";
import AboutBlock from "./AboutBlock";
import ExperienceBlock from "./ExperienceBlock";
import EducationBlock from "./EducationBlock";
import SkillsBlock from "./SkillsBlock";
import ProjectsBlock from "./ProjectsBlock";
import LinksBlock from "./LinksBlock";

export const BLOCK_REGISTRY: Record<BlockType, ComponentType<BlockProps>> = {
  hero: HeroBlock,
  about: AboutBlock,
  experience: ExperienceBlock,
  education: EducationBlock,
  skills: SkillsBlock,
  projects: ProjectsBlock,
  achievements: AboutBlock, // placeholder
  proof: AboutBlock, // placeholder
  links: LinksBlock,
  contact: LinksBlock, // placeholder
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Apresentação",
  about: "Sobre mim",
  experience: "Experiência",
  education: "Formação",
  skills: "Habilidades",
  projects: "Projetos",
  achievements: "Conquistas",
  proof: "Resultados",
  links: "Links",
  contact: "Contato",
};

export type { BlockType, BlockProps } from "./types";
