#!/usr/bin/env python3
import json
import asyncio
from playwright.async_api import async_playwright

async def check_glb_error():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Collect console messages
        console_messages = []
        page.on('console', lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))

        # Collect errors
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))

        # Navigate to the viewer
        await page.goto('http://localhost:8080/no3d-tools-website/3d-viewer/model-viewer-test.html')
        await page.wait_for_timeout(2000)

        # Check if GLTFLoader is ready
        gltf_ready = await page.evaluate('window.gltfLoaderReady')
        threemf_ready = await page.evaluate('window.threemfLoaderReady')

        print(f"GLTFLoader ready: {gltf_ready}")
        print(f"ThreeMFLoader ready: {threemf_ready}")

        print("\n=== Console Messages ===")
        for msg in console_messages:
            print(msg)

        if errors:
            print("\n=== Errors ===")
            for err in errors:
                print(err)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(check_glb_error())
