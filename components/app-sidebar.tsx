"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/server/users";
import { User } from "@/db/schema";
import { AppData } from "@/type/data";
import { iconMap } from "@/type/icon-map";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  data: AppData;
}

export function AppSidebar({ data, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={data.teams.map((team) => ({
            ...team,
            logo: iconMap[team.logo],
          }))}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain.map((item) => ({
            ...item,
            icon: iconMap[item.icon],
          }))}
        />
        {/* <NavProjects
          projects={data.projects.map((project) => ({
            ...project,
            icon: iconMap[project.icon],
          }))}
        /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
