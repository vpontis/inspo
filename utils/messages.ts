import * as z from "zod";

const GetFontsResponse = z.object({
  __type: z.literal("get-fonts-response"),
  host: z.string(),
  fonts: z.array(
    z.object({
      name: z.string(),
      count: z.number(),
    })
  ),
});

export type Fonts = z.infer<typeof GetFontsResponse>["fonts"];

const GetFontsRequest = z.object({
  __type: z.literal("get-fonts-request"),
});

export const ExtensionMessageZ = z.discriminatedUnion("__type", [
  GetFontsResponse,
  GetFontsRequest,
]);

export type ExtensionMessage = z.infer<typeof ExtensionMessageZ>;
