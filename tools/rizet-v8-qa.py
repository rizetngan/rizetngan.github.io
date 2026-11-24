import os,sys,time,json,threading,subprocess,tempfile,urllib.request,base64
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import websocket
root=Path(__file__).resolve().parents[1]
out=root.parent/'rizet-v8-qa'
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
    time.sleep(2);shot('01-entrance')
    ev('__atelierQA.gotoChapter("lab")');time.sleep(3);shot('02-lab')
    ev('__atelierQA.gotoChapter("work")');time.sleep(3);shot('03-archive')
    ev('__atelierQA.gotoChapter("lab")');time.sleep(.8)
    tap('f','KeyF',70)
    mini=wait_for(lambda st:st['mode']=='MINI_WALKING');time.sleep(.9)
    print('MINI',mini,flush=True);shot('04-mini')
    if mini['mouseCaptured']:
        mouse('mouseMoved',970,500)
    else:drag(250,70)
    orbit=wait_for(lambda st:abs(st['orbitPitch']-mini['orbitPitch'])>.1)
    print('ORBIT',orbit,flush=True);time.sleep(.7);shot('05-orbit')
    call('Input.dispatchMouseEvent',{'type':'mouseWheel','x':800,'y':450,'deltaX':0,'deltaY':-180})
    zoom=wait_for(lambda st:st['orbitDist']<orbit['orbitDist'])
    tap('r','KeyR',82);time.sleep(.5)
    mounted=hold('w','KeyW',87,lambda st:st['surface']=='desk' and st['mode']=='MINI_WALKING',35)
    print('REAL_MOUNT',mounted,flush=True);time.sleep(1);shot('06-desk')
    time.sleep(2)
    dismounted=hold('s','KeyS',83,lambda st:st['surface']=='floor' and st['mode']=='MINI_WALKING',35)
    print('REAL_DISMOUNT',dismounted,flush=True);time.sleep(.8)
    before=state();tap('f','KeyF',70);wait_for(lambda st:st['mode']=='GUIDED');time.sleep(.5)
    tap('f','KeyF',70);resumed=wait_for(lambda st:st['mode']=='MINI_WALKING')
    assert max(abs(a-b) for a,b in zip(resumed['charPos'],before['charPos']))<.08,(before,resumed)
    assert abs(resumed['orbitYaw']-before['orbitYaw'])<.01,(before,resumed)
    print('RESUME_OK',resumed,flush=True)
    ev('__atelierQA.gotoChapter("work")');time.sleep(.8);tap('f','KeyF',70)
    wait_for(lambda st:st['mode']=='MINI_WALKING');time.sleep(.6)
    hold('a','KeyA',65,lambda st:st['charPos'][0]<-1.9,30);time.sleep(.6)
    hold('w','KeyW',87,lambda st:st['nearbyExhibit']=='actape',25)
    time.sleep(.8);near=state()
    assert near['mode']=='MINI_WALKING' and near['nearbyExhibit']=='actape',near
    print('NEAR_NO_AUTO_LIFT',near,flush=True)
    tap('e','KeyE',69);lift=wait_for(lambda st:st['mode']=='OBJECT_PREVIEW')
    print('REAL_E_LIFT',lift,flush=True);time.sleep(1);shot('07-exhibit')
    tap('e','KeyE',69);wait_for(lambda st:st['mode']=='READING')
    assert ev('document.querySelector(".product-image img").complete && document.querySelector(".product-image img").naturalWidth>0')
    time.sleep(.7);shot('08-reading')
    ev('__atelierQA.closeReading()');wait_for(lambda st:st['mode']=='OBJECT_PREVIEW')
    tap('s','KeyS',83);returned=wait_for(lambda st:st['mode']=='MINI_WALKING' and st['activeExhibit']==None)
    assert abs(returned['orbitYaw']-near['orbitYaw'])<.01
    print('LIFT_RETURN',returned,flush=True)
    ev('__atelierQA.exitMiniExplore()')
    call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
    call('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':1})
    ev('__atelierQA.gotoChapter("entrance")');time.sleep(2);shot('09-mobile')
    print('ERRORS',json.dumps(errors,ensure_ascii=True)[:4000],flush=True)
    assert not errors, errors
finally:
    p.terminate();server.shutdown();log.close()
