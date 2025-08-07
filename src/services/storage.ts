import { promises as fsPromises } from 'fs';
import fs from 'fs';
import { fileExists, getJsonFilePath } from '../utils/file';
import { BingWallpaper } from '../types';

/**
 * 保存每日壁纸信息到每月的 JSON 文件
 * @param date 壁纸日期，格式为 '20250219'
 * @param wallpaper 壁纸信息
 */
export async function saveWallpaperInfo(date: string, wallpaper: BingWallpaper): Promise<boolean> {
  const infoFilePath = getJsonFilePath(date);
  const yearFolderPath = infoFilePath.substring(0, infoFilePath.lastIndexOf('/'));

  // 创建年份文件夹
  if (!fs.existsSync(yearFolderPath)) {
    fs.mkdirSync(yearFolderPath, { recursive: true });
  }

  // 读取现有的 JSON 文件内容
  let wallpapersInfo: Record<string, BingWallpaper> = {};
  if (await fileExists(infoFilePath)) {
    const infoContent = await fsPromises.readFile(infoFilePath, 'utf-8');
    wallpapersInfo = JSON.parse(infoContent);
  }

  // 检查是否已经存在该日期的壁纸信息
  if (wallpapersInfo[date]) {
    console.log(`Wallpaper info for ${date} already exists. Skipping save.`);
    return false;
  }

  // 添加新的壁纸信息
  wallpapersInfo[date] = wallpaper;

  // 保存更新后的 JSON 文件
  await fsPromises.writeFile(infoFilePath, JSON.stringify(wallpapersInfo, null, 2), 'utf-8');
  console.log(`Wallpaper info for ${date} saved to ${infoFilePath}`);
  return true; // 更新成功
}
