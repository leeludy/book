import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const bookRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        author: z.string().min(1),
        resume: z.string().max(1200),
        cover: z.string().nullish(),
        qrCode: z.string(),
        currentLibraryId: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.book.create({
        data: {
          author: input.author,
          title: input.title,
          resume: input.resume,
          cover: input.cover,
          qrCode: input.qrCode,
          currentLibraryId: input.currentLibraryId,
        },
      });
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.book.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),
});
