// data.d.ts
import type { ComponentType } from "react";

export type IconName =
  | "gallery"
  | "audio"
  | "command"
  | "terminal"
  | "bot"
  | "book"
  | "settings"
  | "frame"
  | "pie"
  | "map";

export interface AppData {
  user: {
    name: string;
    email: string;
    image: string;
  };

  teams: {
    name: string;
    logo: IconName;
    plan: string;
  }[];

  navMain: {
    title: string;
    url: string;
    icon: IconName;
    isActive?: boolean;
    items: {
      title: string;
      url: string;
    }[];
  }[];

  projects:
    | {
        name: string;
        url: string;
        icon: IconName;
      }[]
    | null;
}
