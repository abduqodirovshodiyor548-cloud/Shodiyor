import { existsSync } from "node:fs";
import { delimiter, isAbsolute, join } from "node:path";

/**
 * Claude CLI bajariladigan faylini topadi.
 *
 * Windows'da `spawn("claude")` npm o'rnatgan `claude.cmd` shim'ini topmaydi (Node `.cmd`/`.bat` ni faqat shell
 * orqali ishga tushiradi, shell esa promptdagi maxsus belgilarni buzishi mumkin). Shuning uchun nom PATH bo'yicha
 * `claude.exe` ga, yoki `claude.cmd` yonidagi npm paketidagi native `bin/claude.exe` ga aylantiriladi.
 * Boshqa tizimlarda, yoki yo'l/kengaytma bilan berilgan nom — o'zgarishsiz.
 */
export function resolveClaudeBin(
  bin: string,
  { platform = process.platform, path = process.env.PATH ?? process.env.Path ?? "" } = {},
): string {
  if (platform !== "win32" || isAbsolute(bin) || /[\\/]/.test(bin) || /\.[a-z]+$/i.test(bin)) return bin;
  for (const dir of path.split(delimiter).filter(Boolean)) {
    const exe = join(dir, `${bin}.exe`);
    if (existsSync(exe)) return exe;
    if (existsSync(join(dir, `${bin}.cmd`))) {
      const native = join(dir, "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe");
      if (existsSync(native)) return native;
    }
  }
  return bin;
}
