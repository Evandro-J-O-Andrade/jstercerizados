"""Cria capturas navegáveis do protótipo visual sem visitar sites nem consultar Supabase."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time,re
root=Path(__file__).resolve().parents[1]
assets=root/'03_codigo_react'
base=(assets/'preview.html').read_text(encoding='utf8').replace('<link rel="stylesheet" href="./styles.css"/>','<style>'+(assets/'styles.css').read_text(encoding='utf8')+'</style>')
mods=json.loads((assets/'moduleCatalog.json').read_text())
views={'dashboard':'01_dashboards_26_celulas','list':'02_crud_e_jornadas/01_listagem','new':'02_crud_e_jornadas/02_criacao','detail':'02_crud_e_jornadas/03_detalhes','edit':'02_crud_e_jornadas/04_edicao'}
with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'])
  pg=browser.new_page(viewport={'width':1680,'height':1020},device_scale_factor=1)
  html=base
  pg.set_content(html,wait_until='domcontentloaded',timeout=20000)
  errs=[]
  pg.on('pageerror',lambda x: errs.append(str(x)))
  for v,subdir in views.items():
    dest=root/subdir;dest.mkdir(parents=True,exist_ok=True)
    start=time.time()
    for i,m in enumerate(mods,1):
      pg.evaluate("([id,view])=>window.renderPreview(id,view)",[m["id"],v])
      pg.locator('h1').wait_for(timeout=4000)
      filename=f'{i:02d}_{m["id"]}_{v}.png'
      pg.screenshot(path=str(dest/filename),full_page=True,animations='disabled',timeout=15000)
    print(f'{v}: {len(mods)} imagens em {time.time()-start:.1f}s',flush=True)
  browser.close()
  print('JS errors:',len(errs),errs[:4],flush=True)
