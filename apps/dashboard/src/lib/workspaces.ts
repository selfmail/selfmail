import { db, type User } from "@selfmail/db";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { authMiddleware } from "#/utils/auth";

export interface DashboardWorkspace {
  id: string;
  image: string | null;
  memberId: string;
  name: string;
  ownerId: string;
  slug: string;
}

export interface DashboardShellData {
  user: User;
  workspace: DashboardWorkspace | null;
}

export const getDashboardShellDataFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }): Promise<DashboardShellData> => {
    const workspace = await db.workspace.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        image: true,
        Member: {
          select: {
            id: true,
          },
          take: 1,
          where: {
            userId: user.id,
          },
        },
        name: true,
        ownerId: true,
        slug: true,
      },
      where: {
        Member: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    const member = workspace?.Member[0];

    return {
      user,
      workspace:
        workspace && member
          ? {
              id: workspace.id,
              image: workspace.image,
              memberId: member.id,
              name: workspace.name,
              ownerId: workspace.ownerId,
              slug: workspace.slug,
            }
          : null,
    };
  });

export const getWorkspace = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      workspaceSlug: z.string().min(1),
    })
  )
  .handler(async ({ context: { user }, data: { workspaceSlug } }) => {
    const member = await db.member.findFirst({
      select: {
        id: true,
        workspace: {
          select: {
            id: true,
            image: true,
            name: true,
            ownerId: true,
            slug: true,
          },
        },
      },
      where: {
        userId: user.id,
        workspace: {
          slug: workspaceSlug,
        },
      },
    });

    return {
      member: member ? { id: member.id } : null,
      workspace: member
        ? {
            id: member.workspace.id,
            image: member.workspace.image,
            memberId: member.id,
            name: member.workspace.name,
            ownerId: member.workspace.ownerId,
            slug: member.workspace.slug,
          }
        : null,
    };
  });

export const getDashboardWorkspacesFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { user } }): Promise<DashboardWorkspace[]> => {
    const workspaces = await db.workspace.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        image: true,
        Member: {
          select: {
            id: true,
          },
          take: 1,
          where: {
            userId: user.id,
          },
        },
        name: true,
        ownerId: true,
        slug: true,
      },
      where: {
        Member: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    return workspaces.flatMap((workspace) => {
      const member = workspace.Member[0];

      return member
        ? [
            {
              id: workspace.id,
              image: workspace.image,
              memberId: member.id,
              name: workspace.name,
              ownerId: workspace.ownerId,
              slug: workspace.slug,
            },
          ]
        : [];
    });
  });
