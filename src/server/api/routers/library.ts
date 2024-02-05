import { z } from "zod"

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

export const libraryRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        address: z.string(),
        geographicCoordinates: z.string(),
        picture: z.string(),
        qrCode: z.string(),
        townId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return ctx.db.library.create({
        data: {
          address: input.address,
          geographicCoordinates: input.geographicCoordinates,
          name: input.name,
          picture: input.picture,
          qrCode: input.qrCode,
          townId: input.townId,
        },
      })
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50
      const { cursor } = input
      const items = await ctx.db.library.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          name: "asc",
        },
      })
      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.id
      }
      return {
        items,
        nextCursor,
      }
    }),

  getLibrariesByTown: publicProcedure
    .input(
      z.object({
        townId: z.number(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.library.findMany({
        where: { townId: input.townId },
        orderBy: {
          name: "asc",
        },
      })
    }),
})
