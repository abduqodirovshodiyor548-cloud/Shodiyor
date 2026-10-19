import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { after, describe, it } from "node:test";
import { resolveClaudeBin } from "./resolveBin.ts";

const root = mkdtempSync(join(tmpdir(), "resolve-bin-"));
after(() => rmSync(root, { recursive: true, force: true }));

const touch = (...parts: string[]) => {
  mkdirSync(join(root, ...parts.slice(0, -1)), { recursive: true });
  writeFileSync(join(root, ...parts), "");
};

describe("resolveClaudeBin", () => {
  it("Windows bo'lmasa yoki yo'l/kengaytma berilsa — o'zgarishsiz", () => {
    assert.equal(resolveClaudeBin("claude", { platform: "linux", path: root }), "claude");
    assert.equal(resolveClaudeBin("C:\\x\\claude.exe", { platform: "win32", path: root }), "C:\\x\\claude.exe");
    assert.equal(resolveClaudeBin("claude.cmd", { platform: "win32", path: root }), "claude.cmd");
  });

  it("npm shim (claude.cmd) yonidagi native claude.exe topiladi", () => {
    touch("npm", "claude.cmd");
    touch("npm", "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe");
    const path = [join(root, "empty"), join(root, "npm")].join(delimiter);
    assert.equal(
      resolveClaudeBin("claude", { platform: "win32", path }),
      join(root, "npm", "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe"),
    );
  });

  it("PATH'dagi claude.exe birinchi o'rinda; topilmasa — nomning o'zi", () => {
    touch("native", "claude.exe");
    const path = [join(root, "native"), join(root, "npm")].join(delimiter);
    assert.equal(resolveClaudeBin("claude", { platform: "win32", path }), join(root, "native", "claude.exe"));
    assert.equal(resolveClaudeBin("claude", { platform: "win32", path: join(root, "empty") }), "claude");
  });
});
