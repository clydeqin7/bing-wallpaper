import fs from 'fs';
import path from 'path';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * 读取并解析 JSON 文件，失败时返回兜底值而不是抛错。
 * 仅用于派生文件的读取；数据文件的修复策略由调用方决定。
 */
export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Cannot load ${filePath} (${message}). Using fallback.`);
    return fallback;
  }
}

/**
 * 原子写入：先写同目录临时文件再 rename，避免进程中断时留下半个文件。
 */
export async function writeFileAtomic(filePath: string, content: string): Promise<void> {
  const directory = path.dirname(filePath);
  const tmpPath = path.join(directory, `.${path.basename(filePath)}.${process.pid}.tmp`);
  await fs.promises.mkdir(directory, { recursive: true });
  try {
    await fs.promises.writeFile(tmpPath, content, 'utf-8');
    await fs.promises.rename(tmpPath, filePath);
  } catch (error) {
    await fs.promises.rm(tmpPath, { force: true }).catch(() => undefined);
    throw error;
  }
}

export function getMdFilePath(date: string, wallpapersPath?: string): string {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const formattedMonth = `${year}-${month}`;
  // 保证 public 目录在项目根目录
  const basePath = wallpapersPath || path.resolve(process.cwd(), 'public/wallpapers');
  const yearFolderPath = path.join(basePath, `${year}`);
  return path.join(yearFolderPath, `${formattedMonth}.md`);
}

export function getJsonFilePath(date: string, wallpapersPath?: string): string {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const formattedMonth = `${year}-${month}`;
  // 保证 public 目录在项目根目录
  const basePath = wallpapersPath || path.resolve(process.cwd(), 'public/wallpapers');
  const yearFolderPath = path.join(basePath, `${year}`);
  return path.join(yearFolderPath, `${formattedMonth}.json`);
}
