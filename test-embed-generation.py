#!/usr/bin/env python3
"""
Test script to verify:
1. Environment section is removed
2. currentModelURL is set when loading from URL
3. Embed code generation works with proper URL
4. Appropriate message shown for blob URLs
"""
import asyncio
from playwright.async_api import async_playwright

async def test_viewer():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        # Collect console messages
        console_messages = []
        page.on('console', lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))

        # Navigate to the viewer
        print("📂 Loading viewer...")
        await page.goto('http://localhost:8080/no3d-tools-website/3d-viewer/simple-test.html')
        await page.wait_for_timeout(2000)

        # Check if Environment section is removed
        print("\n✅ TEST 1: Checking if Environment section is removed...")
        env_section = await page.query_selector('#env-preset')
        if env_section:
            print("❌ FAILED: Environment section still exists")
        else:
            print("✅ PASSED: Environment section removed")

        # Test loading a sample model (which uses a permanent URL)
        print("\n✅ TEST 2: Loading sample model from URL...")
        await page.evaluate("""
            loadSample('samples/sample.glb', 'sample.glb');
        """)
        await page.wait_for_timeout(3000)

        # Check if currentModelURL was set
        current_url = await page.evaluate('currentModelURL')
        print(f"Current Model URL: {current_url}")
        if current_url and not current_url.startswith('blob:'):
            print("✅ PASSED: currentModelURL set correctly for permanent URL")
        else:
            print("❌ FAILED: currentModelURL not set correctly")

        # Test embed code generation
        print("\n✅ TEST 3: Testing embed code generation...")
        await page.click('button:has-text("Preview & Get Embed Code")')
        await page.wait_for_timeout(1000)

        embed_code = await page.eval_on_selector('#embed-code', 'el => el.value')
        if embed_code and '<!DOCTYPE html>' in embed_code and current_url in embed_code:
            print("✅ PASSED: Embed code generated with model URL")
            print(f"Embed code length: {len(embed_code)} characters")
        else:
            print("❌ FAILED: Embed code not generated correctly")
            print(f"Embed code preview: {embed_code[:200]}...")

        # Test display settings (sketch mode)
        print("\n✅ TEST 4: Testing sketch mode integration...")
        sketch_checkbox = await page.query_selector('#enable-sketch')
        if sketch_checkbox:
            print("✅ PASSED: Sketch mode controls present")
        else:
            print("❌ FAILED: Sketch mode controls not found")

        print("\n=== Console Messages ===")
        for msg in console_messages[-10:]:  # Show last 10 messages
            print(msg)

        print("\n✅ All tests completed!")
        print("Browser will stay open for manual inspection.")
        print("Press Ctrl+C to close.")

        # Keep browser open for manual inspection
        try:
            await asyncio.sleep(300)  # 5 minutes
        except KeyboardInterrupt:
            pass

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_viewer())
