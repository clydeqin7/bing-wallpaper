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
  const basePath = wallpapersPath || '../public/wallpapers';
  const yearFolderPath = path.resolve(__dirname, basePath, `${year}`);
  return path.join(yearFolderPath, `${formattedMonth}.md`);
}

export function getJsonFilePath(date: string, wallpapersPath?: string): string {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const formattedMonth = `${year}-${month}`;
  const basePath = wallpapersPath || '../public/wallpapers';
  const yearFolderPath = path.resolve(__dirname, basePath, `${year}`);
  return path.join(yearFolderPath, `${formattedMonth}.json`);
}
