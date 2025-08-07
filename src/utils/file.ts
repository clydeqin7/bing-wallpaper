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
