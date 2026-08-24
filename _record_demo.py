#!/usr/bin/env python3
"""Record Cogram Open demo (Playwright). Server: python -m http.server 8766"""
from __future__ import annotations

import asyncio
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "demo"
URL = "http://127.0.0.1:8766/"


async def main() -> None:
    try:
        from playwright.async_api import async_playwright
    except ImportError as exc:
        raise SystemExit("pip install playwright && playwright install chromium") from exc

    OUT.mkdir(exist_ok=True)
    out_path = OUT / "cogram_open_demo.webm"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            record_video_dir=str(OUT),
            record_video_size={"width": 1280, "height": 720},
        )
        page = await context.new_page()
        await page.goto(URL, wait_until="networkidle")
        await page.wait_for_timeout(1200)

        await page.locator("#memory-input").fill("25-min blocks, phone in drawer, hardest problem first")
        await page.locator("#memory-form button").click()
        await page.wait_for_timeout(1000)

        await page.locator("#s-phone").fill("8")
        await page.locator("#r-phone").fill("0.35")
        await page.wait_for_timeout(1500)

        await page.locator("#s-task").fill("9")
        await page.wait_for_timeout(1500)

        await page.wait_for_timeout(2000)
        video = page.video
        await page.close()
        if video:
            await video.save_as(str(out_path))
            print(f"Saved {out_path}")
        await context.close()
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
