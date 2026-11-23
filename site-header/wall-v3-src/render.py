import asyncio,sys
from playwright.async_api import async_playwright
opts=sys.argv[1] if len(sys.argv)>1 else 'abc'
passes=sys.argv[2].split(',') if len(sys.argv)>2 else ['base','tubes','glow']
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        for o in opts:
            for ps in passes:
                w,h=(2496,848) if ps=='glow' else (2400,800)
                pg=await b.new_page(viewport={'width':w,'height':h})
                await pg.goto(f'http://127.0.0.1:8765/wall.html?opt={o}&pass={ps}')
                await pg.wait_for_function("document.title==='ready'",timeout=60000)
                await pg.wait_for_timeout(800)
                await pg.screenshot(path=f'../renders/{o}-{ps}.png')
                await pg.close()
        await b.close()
asyncio.run(main())
