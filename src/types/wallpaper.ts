export interface BingWallpaper {
  url: string;
  copyright: string;
  date: string;
}

/** 按日期（YYYYMMDD）索引的壁纸集合，也是每月 JSON 文件的结构 */
export type WallpaperMap = Record<string, BingWallpaper>;

/** Bing HPImageArchive 接口返回的图片信息（只声明用到的字段） */
export interface BingImage {
  url?: string;
  copyright?: string;
  enddate?: string;
}
