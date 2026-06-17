import { test } from "node:test";
import assert from "node:assert/strict";
import { urlTrends } from "./trends-best-effort.mjs";

test("urlTrends monta a URL do related queries pro termo", () => {
  const u = urlTrends("claude code");
  assert.match(u, /trends\.google\.com/);
  assert.match(u, /claude%20code/);
});
