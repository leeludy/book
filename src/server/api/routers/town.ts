import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const townRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.town.create({
        data: {
          name: input.name,
        },
      }),
    ),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const items = await ctx.db.town.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          name: "asc",
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      return {
        items,
        nextCursor,
      };
    }),
});
