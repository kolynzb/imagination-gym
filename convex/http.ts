import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { isSupportedImageType, MAX_IMAGE_BYTES } from "./crew";

const http = httpRouter();
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Crit-Room-Code, X-Crit-Week, X-Crit-Day, X-Crit-Size, X-Crit-Prompt",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function response(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function headerInteger(request: Request, header: string): number | null {
  const value = request.headers.get(header);
  if (!value || !/^(0|[1-9]\d*)$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

http.route({ path: "/crit-upload", method: "OPTIONS", handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })) });

http.route({
  path: "/crit-upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ") || authorization.length <= "Bearer ".length) return response("Sign in with Google before uploading", 401);
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return response("Sign in with Google before uploading", 401);

    const roomCode = request.headers.get("x-crit-room-code") ?? "";
    const week = headerInteger(request, "x-crit-week");
    const day = headerInteger(request, "x-crit-day");
    let prompt: string;
    try {
      prompt = decodeURIComponent(request.headers.get("x-crit-prompt") ?? "");
    } catch {
      return response("Invalid upload prompt", 400);
    }
    const contentType = request.headers.get("content-type") ?? "";
    const declaredSize = headerInteger(request, "x-crit-size");
    if (!isSupportedImageType(contentType) || !roomCode || week === null || week < 1 || week > 8 || day === null || day < 1 || day > 7 || !prompt.trim() || prompt.length > 500 || declaredSize === null || declaredSize <= 0 || declaredSize > MAX_IMAGE_BYTES) return response("Invalid image upload", 400);

    const isMember: boolean = await ctx.runQuery(internal.crew.canUploadCrit, { roomCode, tokenIdentifier: identity.tokenIdentifier });
    if (!isMember) return response("Join this room before posting to it", 403);

    const reader = request.body?.getReader();
    if (!reader) return response("Missing image", 400);
    const chunks: ArrayBuffer[] = [];
    let received = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > declaredSize) {
        await reader.cancel();
        return response("Image exceeds declared size", 400);
      }
      chunks.push(new Uint8Array(value).buffer);
    }
    const blob = new Blob(chunks, { type: contentType });
    if (blob.size !== declaredSize || blob.size <= 0 || blob.size > MAX_IMAGE_BYTES || blob.type !== contentType || !isSupportedImageType(blob.type)) return response("Invalid image upload", 400);

    const storageId = await ctx.storage.store(blob);
    try {
      const postId = await ctx.runMutation(internal.crew.recordUploadedCrit, { roomCode, tokenIdentifier: identity.tokenIdentifier, week, day, storageId, contentType, size: blob.size, prompt });
      return new Response(JSON.stringify({ postId }), { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (error) {
      await ctx.storage.delete(storageId);
      throw error;
    }
  }),
});

export default http;
