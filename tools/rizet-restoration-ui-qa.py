import os,sys,time,json,threading,subprocess,tempfile,urllib.request,base64
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import websocket
root=Path(__file__).resolve().parents[1]
out=root.parent/'rizet-restoration-ui-qa'
out.mkdir(exist_ok=True)
os.chdir(root)
class H(SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),H)
threading.Thread(target=server.serve_forever,daemon=True).start()
port=server.server_address[1]
profile=tempfile.mkdtemp(prefix='rizet-v7-')
chrome=r'C:\Program Files\Google\Chrome\Application\chrome.exe'
args=[chrome,'--headless=new','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--use-angle=d3d11','--disable-background-networking','--window-size=1440,900','about:blank']
log=open(out/'chrome.log','wb')
p=subprocess.Popen(args,stdout=log,stderr=log)
try:
    portfile=Path(profile)/'DevToolsActivePort'
    for _ in range(80):
        if portfile.exists(): break
        if p.poll() is not None: raise RuntimeError('chrome exited: '+str(p.returncode))
        time.sleep(.25)
    dp=portfile.read_text().splitlines()[0]
    tabs=json.load(urllib.request.urlopen('http://127.0.0.1:'+dp+'/json/list',timeout=10))
    tab=next(t for t in tabs if t['type']=='page')
    ws=websocket.create_connection(tab['webSocketDebuggerUrl'],timeout=25,suppress_origin=True)
    seq=0; errors=[]
    def call(method,params=None):
        global seq
        seq+=1;i=seq;ws.send(json.dumps({'id':i,'method':method,'params':params or {}}))
        while True:
            m=json.loads(ws.recv())
            if m.get('method')=='Runtime.exceptionThrown': errors.append(m['params']['exceptionDetails'])
            if m.get('id')==i:
                if 'error' in m: raise RuntimeError(str(m['error']))
                return m.get('result',{})
    def ev(expr,gesture=False):
        r=call('Runtime.evaluate',{'expression':expr,'returnByValue':True,'awaitPromise':True,'userGesture':gesture})
        if r.get('exceptionDetails'): raise RuntimeError(str(r['exceptionDetails']))
        return r.get('result',{}).get('value')
    def shot(name):
        r=call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})
        (out/(name+'.png')).write_bytes(base64.b64decode(r['data']))
        print('SCREENSHOT',name,flush=True)
    call('Page.enable');call('Runtime.enable')
    call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':900,'deviceScaleFactor':1,'mobile':False})
    call('Page.navigate',{'url':f'http://127.0.0.1:{port}/'})
    for _ in range(50):
        time.sleep(.4)
        if ev('Boolean(window.__atelierQA)'):break
    print('APP',ev('({qa:!!window.__atelierQA,three:typeof THREE,webgl:!!document.querySelector("canvas").getContext("webgl2")})'),flush=True)
    assert ev('Boolean(window.__atelierQA)'), 'app failed to initialize'
    def state():return ev('__atelierQA.getState()')
    def wait_for(pred,timeout=25):
        deadline=time.time()+timeout
        while time.time()<deadline:
            st=state()
            if pred(st):return st
            time.sleep(.25)
        raise AssertionError(st)
    def key(t,k,code,vk):
        call('Input.dispatchKeyEvent',{'type':t,'key':k,'code':code,'windowsVirtualKeyCode':vk,'nativeVirtualKeyCode':vk})
    def hold(k,code,vk,pred,timeout=25):
        key('rawKeyDown',k,code,vk)
        try:return wait_for(pred,timeout)
        finally:key('keyUp',k,code,vk)
    def tap(k,code,vk):
        key('rawKeyDown',k,code,vk);key('keyUp',k,code,vk)
    def mouse(t,x,y,button='none',buttons=0):
        call('Input.dispatchMouseEvent',{'type':t,'x':x,'y':y,'button':button,'buttons':buttons,'clickCount':1 if button!='none' else 0})
    def drag(dx,dy):
        mouse('mousePressed',720,400,'right',2)
        mouse('mouseMoved',720+dx,400+dy,'none',2)
        mouse('mouseReleased',720+dx,400+dy,'right',0)
    wait_for(lambda st:all(st['assetStatus'].values()),45)
    print('ALL_ASSETS',state()['assetStatus'],flush=True)
    print('GPU',ev('(()=>{const g=document.querySelector("canvas").getContext("webgl2");const e=g.getExtension("WEBGL_debug_renderer_info");return g.getParameter(e.UNMASKED_RENDERER_WEBGL)})()'),flush=True)
    time.sleep(1.5)
    def click(selector):
        rect=ev('(()=>{let r=document.querySelector('+json.dumps(selector)+').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()')
        mouse('mousePressed',rect['x'],rect['y'],'left',1);mouse('mouseReleased',rect['x'],rect['y'],'left',0)
    start=state();assert start['chapter']=='entrance'
    click('#enterGuided')
    wait_for(lambda st:st['chapter']=='corridor');time.sleep(1.6)
    shot('ui-corridor')
    before=state()['cameraPos']
    call('Input.dispatchMouseEvent',{'type':'mouseWheel','x':800,'y':450,'deltaX':0,'deltaY':180})
    wait_for(lambda st:st['chapter']=='lab');time.sleep(2.2)
    after=state()['cameraPos']
    assert max(abs(a-b) for a,b in zip(before,after))>.6,(before,after)
    shot('ui-lab')
    for name in ('work','notes','about'):
        click('.main-nav [data-goto="'+name+'"]')
        wait_for(lambda st:st['chapter']==name);time.sleep(1.8);shot('ui-'+name)
    click('#brandHome');wait_for(lambda st:st['chapter']=='entrance');time.sleep(1.6)
    shot('ui-home')
    click('#browseWorksDirect');wait_for(lambda st:st['chapter']=='work')
    print('UI_ROUTES_PASS all six chapters, genuine wheel and nav clicks, direct work link, home',flush=True)
    print('ERRORS',json.dumps(errors,ensure_ascii=True),flush=True)
    assert not errors
finally:
    p.terminate();server.shutdown();log.close()
