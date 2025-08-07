import { promises as fsPromises } from 'fs';
import { fileExists, getJsonFilePath } from '../utils/file';
import { formatDate } from '../utils/date';
import { BingWallpaper } from '../types';

/**
 * 更新 Markdown 文件
 * @param mdFilePath Markdown 文件路径
 */
export async function updateMarkdownFile(mdFilePath: string): Promise<void> {
  // 从 JSON 文件路径中提取年份和月份
  const jsonFilePath = mdFilePath.replace(/\.md$/, '.json');
  if (!(await fileExists(jsonFilePath))) {
    console.log(`No wallpaper info file found at ${jsonFilePath}. Skipping update.`);
    return;
  }

  // 读取每月的壁纸信息文件
  const infoContent = await fsPromises.readFile(jsonFilePath, 'utf-8');
  const wallpapersInfo = JSON.parse(infoContent) as Record<string, BingWallpaper>;

  // 按日期排序（降序）
  const sortedDates = Object.keys(wallpapersInfo).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

  // 获取最新日期（即第一个条目）
  const latestDate = sortedDates[0];
  const latestWallpaper = wallpapersInfo[latestDate];
  const formattedDate = formatDate(latestDate);

  // 生成 Markdown 文件内容
  let content = '';

  // 添加最新壁纸信息
  content += `\n  ## Bing Wallpaper (${formattedDate})\n  ![Wallpaper](${latestWallpaper.url}&w=1024) **Today**: ${latestWallpaper.copyright}\n  \n\n`;

  // 添加表头
  content += `\n  | Date       | Image      | Download Links    | Copyright    |\n  |------------|------------|-------------------|--------------|`;

  // 遍历排序后的日期，生成 Markdown 条目
  for (const fullDate of sortedDates) {
    const wallpaper = wallpapersInfo[fullDate];
    const formattedDate = formatDate(fullDate);
    content += `\n  | ${formattedDate} | ![Thumbnail](${wallpaper.url}&w=384&h=216) | [2K](${wallpaper.url}&w=2560&h=1440) [4K](${wallpaper.url}&w=3840&h=2160) | ${wallpaper.copyright} |`;
  }

  // 写入 Markdown 文件
  await fsPromises.writeFile(mdFilePath, content, 'utf-8');
  console.log(`Updated Markdown file at ${mdFilePath}`);
}
