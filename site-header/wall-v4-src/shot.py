import asyncio,sys
from playwright.async_api import async_playwright
async def main(src,out,w=2400,h=800):
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':w,'height':h})
        await pg.goto('http://127.0.0.1:8766/'+src); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=out); await b.close()
asyncio.run(main(sys.argv[1],sys.argv[2]))
