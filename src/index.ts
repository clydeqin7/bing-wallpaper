import { getBingWallpaper } from './bing';
import { promises as fsPromises } from 'fs';
import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

async function downloadWallpaper() {
  try {
    const wallpaper = await getBingWallpaper();
    const mdFilePath = getMdFilePath(wallpaper.date);

    // Update the Markdown file
    await updateMarkdownFile(mdFilePath, wallpaper.url, wallpaper.copyright);
    console.log(`Wallpaper for ${wallpaper.date} added to Markdown file successfully.`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error downloading wallpaper: ${error.message}`);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

/**
 * 
 * @param date '20250213'
 * @returns 
 */
function getMdFilePath(date: string): string {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const formattedMonth = `${year}-${month}`;
  const wallpapersPath = process.env.WALLPAPERS_PATH || '../public/wallpapers';
  const yearFolderPath = path.resolve(__dirname, wallpapersPath, `${year}`);

  // 创建年份文件夹
  if (!fs.existsSync(yearFolderPath)) {
    fs.mkdirSync(yearFolderPath, { recursive: true });
  }

  // 文件名格式为 "2025-02.md"
  return path.join(yearFolderPath, `${formattedMonth}.md`);
}

async function updateMarkdownFile(mdFilePath: string, wallpaperUrl: string, copyright: string): Promise<void> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  let content = '';
  if (await fileExists(mdFilePath)) {
    content = await fsPromises.readFile(mdFilePath, 'utf-8');
  }

  // 检查是否已经存在相同日期的条目
  const existingDateRegex = new RegExp(`\\|\\s*${formattedDate}\\s*\\|`, 'm');
  if (existingDateRegex.test(content)) {
    console.log(`Entry for ${formattedDate} already exists. Skipping update.`);
    return; // 如果已经存在相同日期的条目，则直接退出
  }

  // 匹配分隔符行的位置
  const separatorLine = "|------------|------------|-------------------|--------------|";
  const separatorIndex = content.indexOf(separatorLine);

  let existingContent = '';
  if (separatorIndex !== -1) {
    // 从分隔符行之后的内容开始截取
    const nextLineIndex = content.indexOf("\n", separatorIndex);
    if (nextLineIndex !== -1) {
      existingContent = content.slice(nextLineIndex + 1); // 跳过分隔符行和换行符
    }
  } else {
    console.log("No existing table found. Creating a new table.");
  }

  // 添加新的壁纸信息
  const newEntry = `
  ## Bing Wallpaper (${formattedDate})
  ![](${wallpaperUrl}&w=1024) **Today**: ${copyright}
  | Date       | Image      | Download Links    | Copyright    |
  |------------|------------|-------------------|--------------|
  | ${formattedDate} | ![Thumbnail](${wallpaperUrl}&w=384&h=216) | [2K](${wallpaperUrl}&w=2560&h=1440) [4K](${wallpaperUrl}&w=3840&h=2160) | ${copyright} |
  `;

  // 将新条目添加到文件顶部
  content = newEntry + existingContent;

  await fsPromises.writeFile(mdFilePath, content, 'utf-8');
  console.log(`Updated Markdown file with new entry for ${formattedDate}`);
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