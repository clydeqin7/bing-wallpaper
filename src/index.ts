import { getBingWallpaper } from './bing';
import { promises as fsPromises } from 'fs';
import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

async function downloadWallpaper() {
  try {
    const wallpaper = await getBingWallpaper();
    const date = wallpaper.date;


    // 保存图片信息到每月的JSON文件，并检查是否更新成功
    const isUpdated = await saveWallpaperInfo(date, wallpaper);

    if (!isUpdated) {
      console.log(`No new wallpaper info for ${date}. Skipping Markdown file update.`);
      return;
    }

    // 更新Markdown文件
    const mdFilePath = getMdFilePath(date);
    await updateMarkdownFile(mdFilePath);
    console.log(`Wallpaper for ${date} added to Markdown file successfully.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error downloading wallpaper: ${error.message}`);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

/**
 * 保存每日壁纸信息到每月的 JSON 文件
 * @param date 壁纸日期，格式为 '20250219'
 * @param wallpaper 壁纸信息
 */
async function saveWallpaperInfo(date: string, wallpaper: { url: string; copyright: string }) {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const formattedMonth = `${year}-${month}`;

  // JSON 文件路径：public/wallpaper/year/year-month.json
  const wallpapersPath = process.env.WALLPAPERS_PATH || '../public/wallpapers';
  const yearFolderPath = path.resolve(__dirname, wallpapersPath, `${year}`);
  const infoFilePath = path.join(yearFolderPath, `${formattedMonth}.json`); // 每月的 JSON 文件

  // 创建年份文件夹
  if (!fs.existsSync(yearFolderPath)) {
    fs.mkdirSync(yearFolderPath, { recursive: true });
  }

  // 读取现有的 JSON 文件内容
  let wallpapersInfo: Record<string, { url: string; copyright: string }> = {};
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

/**
 * 获取Markdown文件路径
 * @param date 壁纸日期，格式为 '20250213'
 * @returns Markdown文件路径
 */
function getMdFilePath(date: string): string {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const formattedMonth = `${year}-${month}`;

  const wallpapersPath = process.env.WALLPAPERS_PATH || '../public/wallpapers';
  const yearFolderPath = path.resolve(__dirname, wallpapersPath, `${year}`);
  return path.join(yearFolderPath, `${formattedMonth}.md`);
}

/**
 * 更新 Markdown 文件
 * @param mdFilePath Markdown 文件路径
 */
async function updateMarkdownFile(mdFilePath: string): Promise<void> {
  // 从 JSON 文件路径中提取年份和月份
  const jsonFilePath = mdFilePath.replace(/\.md$/, ".json");
  if (!await fileExists(jsonFilePath)) {
    console.log(`No wallpaper info file found at ${jsonFilePath}. Skipping update.`);
    return;
  }

  // 读取每月的壁纸信息文件
  const infoContent = await fsPromises.readFile(jsonFilePath, 'utf-8');
  const wallpapersInfo = JSON.parse(infoContent) as Record<string, { url: string; copyright: string }>;

  // 按日期排序（降序）
  const sortedDates = Object.keys(wallpapersInfo).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

  // 获取最新日期（即第一个条目）
  const latestDate = sortedDates[0];
  const latestWallpaper = wallpapersInfo[latestDate];
  const year = latestDate.slice(0, 4);
  const month = latestDate.slice(4, 6);
  const formattedDate = `${year}-${month}-${latestDate.slice(6, 8)}`;

  // 生成 Markdown 文件内容
  let content = ``;

  // 添加最新壁纸信息
  content += `
  ## Bing Wallpaper (${formattedDate})
  ![Wallpaper](${latestWallpaper.url}&w=1024) **Today**: ${latestWallpaper.copyright}
  \n\n`;

  // 添加表头
  content += `
  | Date       | Image      | Download Links    | Copyright    |
  |------------|------------|-------------------|--------------|`;

  // 遍历排序后的日期，生成 Markdown 条目
  for (const fullDate of sortedDates) {
    const wallpaper = wallpapersInfo[fullDate];
    const formattedDate = `${fullDate.slice(0, 4)}-${fullDate.slice(4, 6)}-${fullDate.slice(6, 8)}`;

    content += `
  | ${formattedDate} | ![Thumbnail](${wallpaper.url}&w=384&h=216) | [2K](${wallpaper.url}&w=2560&h=1440) [4K](${wallpaper.url}&w=3840&h=2160) | ${wallpaper.copyright} |`;
  }

  // 写入 Markdown 文件
  await fsPromises.writeFile(mdFilePath, content, 'utf-8');
  console.log(`Updated Markdown file at ${mdFilePath}`);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fsPromises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

downloadWallpaper();