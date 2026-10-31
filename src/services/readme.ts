import { promises as fsPromises } from 'fs';
import path from 'path';
import { formatDate } from '../utils/date';
import { WallpaperMap } from '../types';
import { readJsonFile, writeFileAtomic } from '../utils/file';

const WALLPAPERS_DIR = path.resolve(process.cwd(), 'public/wallpapers');
const MONTH_FILE_PATTERN = /^\d{4}-\d{2}\.json$/;
const YEAR_DIR_PATTERN = /^\d{4}$/;

/** 扫描全部分区，取全局最新的壁纸，避免依赖「当前月份」文件 */
async function loadAllWallpapers(): Promise<WallpaperMap> {
  const merged: WallpaperMap = {};

  let yearDirs: string[];
  try {
    yearDirs = await fsPromises.readdir(WALLPAPERS_DIR);
  } catch {
    return merged;
  }

  for (const yearDirName of yearDirs.filter((name) => YEAR_DIR_PATTERN.test(name))) {
    const yearDir = path.join(WALLPAPERS_DIR, yearDirName);
    const files = await fsPromises.readdir(yearDir).catch(() => [] as string[]);
    for (const file of files.filter((name) => MONTH_FILE_PATTERN.test(name))) {
      const monthly = await readJsonFile<WallpaperMap>(path.join(yearDir, file), {});
      Object.assign(merged, monthly);
    }
  }

  return merged;
}

// 生成年度-月份归档
async function getArchiveLinks(): Promise<string> {
  let years: string[];
  try {
    years = await fsPromises.readdir(WALLPAPERS_DIR);
  } catch {
    return '';
  }

  let archive = '';
  for (const year of years
    .filter((name) => YEAR_DIR_PATTERN.test(name))
    .sort()
    .reverse()) {
    const yearDir = path.join(WALLPAPERS_DIR, year);
    const months = (await fsPromises.readdir(yearDir).catch(() => [] as string[]))
      .filter((f) => f.endsWith('.md'))
      .sort();
    if (months.length === 0) continue;
    archive += `- ${year}\n`;
    for (const m of months) {
      archive += `  - [${m.replace('.md', '')}](public/wallpapers/${year}/${m})\n`;
    }
  }
  return archive;
}

export async function generateReadme(): Promise<void> {
  const wallpapers = await loadAllWallpapers();
  const sortedDates = Object.keys(wallpapers).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  const latest = sortedDates.length > 0 ? wallpapers[sortedDates[0]] : undefined;
  const archive = await getArchiveLinks();

  const todaySection = latest
    ? `## 今日壁纸 (${formatDate(sortedDates[0])})\n\n![Wallpaper](${latest.url}&w=1024)\n\n${latest.copyright}`
    : '## 今日壁纸\n\n暂无数据';

  const content = `# Bing Wallpaper 今日壁纸\n\n> 自动抓取并归档 Bing 每日壁纸\n\n${todaySection}\n\n---\n\n## 年度归档\n\n${archive}\n> 更多壁纸请在 public/wallpapers/ 目录下查看\n`;

  await writeFileAtomic(path.resolve(process.cwd(), 'README.md'), content);
  console.log('README.md updated');
}
