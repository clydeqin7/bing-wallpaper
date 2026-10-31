import axios from 'axios';
import { BingImage, BingWallpaper } from '@/types';

const API_URL = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN';
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 1_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 把 Bing 返回的 1920x1080 链接改写为 UHD 原图，并去掉追踪参数 */
export function normalizeImageUrl(rawUrl: string): string {
  const cleaned = rawUrl
    .replace(/_\d+x\d+\.jpg/, '_UHD.jpg')
    .replace(/[&?](rf|pid)=[^&]*/g, '')
    // 接口返回的是相对路径；若意外带了域名，统一收敛到 cn.bing.com
    .replace(/^https?:\/\/[^/]+/, '');
  const pathPart = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  return `https://cn.bing.com${pathPart}`;
}

async function fetchLatestImage(): Promise<BingImage> {
  const response = await axios.get<{ images?: BingImage[] }>(API_URL, {
    timeout: REQUEST_TIMEOUT_MS,
  });
  const image = response.data?.images?.[0];
  if (!image?.url || !image.enddate) {
    throw new Error('Bing API returned an unexpected payload');
  }
  return image;
}

export async function getBingWallpaper(): Promise<BingWallpaper> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const image = await fetchLatestImage();
      return {
        url: normalizeImageUrl(image.url as string),
        copyright: image.copyright ?? '',
        date: image.enddate as string,
      };
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Bing request failed (attempt ${attempt}/${MAX_ATTEMPTS}): ${message}`);
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
