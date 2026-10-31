import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileExists, getJsonFilePath, writeFileAtomic } from '../utils/file';
import { BingWallpaper, WallpaperMap } from '../types';

/**
 * 保存每日壁纸信息到每月的 JSON 文件
 * @param date 壁纸日期，格式为 '20250219'
 * @param wallpaper 壁纸信息
 * @returns 是否新增了数据（已存在则返回 false）
 */
export async function saveWallpaperInfo(date: string, wallpaper: BingWallpaper): Promise<boolean> {
  const infoFilePath = getJsonFilePath(date);
  await fsPromises.mkdir(path.dirname(infoFilePath), { recursive: true });

  const wallpapersInfo = await loadMonthlyInfo(infoFilePath);

  // 检查是否已经存在该日期的壁纸信息
  if (wallpapersInfo[date]) {
    console.log(`Wallpaper info for ${date} already exists. Skipping save.`);
    return false;
  }

  // 添加新的壁纸信息
  wallpapersInfo[date] = wallpaper;

  // 原子写入，避免中途失败产生残缺 JSON
  await writeFileAtomic(infoFilePath, `${JSON.stringify(wallpapersInfo, null, 2)}\n`);
  console.log(`Wallpaper info for ${date} saved to ${infoFilePath}`);
  return true;
}

/**
 * 读取当月 JSON；若文件损坏则备份为 .bak 后从空对象重建，
 * 避免历史数据被静默覆盖（调用方只会写回当月文件）。
 */
async function loadMonthlyInfo(infoFilePath: string): Promise<WallpaperMap> {
  if (!(await fileExists(infoFilePath))) return {};

  try {
    const parsed = JSON.parse(await fsPromises.readFile(infoFilePath, 'utf-8'));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('unexpected JSON shape');
    }
    return parsed as WallpaperMap;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const backupPath = `${infoFilePath}.bak`;
    await fsPromises.rename(infoFilePath, backupPath).catch(() => undefined);
    console.warn(
      `Corrupted wallpapers file ${infoFilePath} (${message}). Backed up to ${backupPath} and rebuilt.`,
    );
    return {};
  }
}
