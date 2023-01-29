import * as z from "zod";

export const MessageZ = z.object({
  __type: z.literal("message-1"),
  label: z.string().nullable(),
});

export type Message = z.infer<typeof MessageZ>;
