import os,sys,time,json,threading,subprocess,tempfile,urllib.request,base64
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import websocket
root=Path(__file__).resolve().parents[1]
out=root.parent/'rizet-restoration-native-qa'
out.mkdir(exist_ok=True)
os.chdir(root)
class H(SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
server=ThreadingHTTPServer(('127.0.0.1',0),H)
threading.Thread(target=server.serve_forever,daemon=True).start()
port=server.server_address[1]
profile=tempfile.mkdtemp(prefix='rizet-v7-')
chrome=r'C:\Program Files\Google\Chrome\Application\chrome.exe'
args=[chrome,'--window-position=60,60','--disable-backgrounding-occluded-windows','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--use-angle=d3d11','--disable-background-networking','--window-size=1440,900','about:blank']
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
    call('Page.bringToFront')
    ev('__atelierQA.gotoChapter("lab")');time.sleep(2)
    def state():return ev('__atelierQA.getState()')
    def wait_for(pred,timeout=18):
        deadline=time.time()+timeout
        while time.time()<deadline:
            st=state()
            if pred(st):return st
            time.sleep(.2)
        raise AssertionError(st)
    def mouse(t,x,y,button='none',buttons=0):
        call('Input.dispatchMouseEvent',{'type':t,'x':x,'y':y,'button':button,'buttons':buttons,'clickCount':1 if button!='none' else 0})
    def click(x,y):
        mouse('mousePressed',x,y,'left',1);mouse('mouseReleased',x,y,'left',0)
    def key(t,k,code,vk):
        call('Input.dispatchKeyEvent',{'type':t,'key':k,'code':code,'windowsVirtualKeyCode':vk,'nativeVirtualKeyCode':vk})
    def tap(k,code,vk):
        key('rawKeyDown',k,code,vk);key('keyUp',k,code,vk)
    r=ev('(()=>{const r=document.getElementById("modeSwitch").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()')
    click(r['x'],r['y']);initial=wait_for(lambda st:st['mouseCaptured'])
    print('CAPTURE',initial,flush=True)
    import ctypes,math
    from ctypes import wintypes
    user32=ctypes.windll.user32
    user32.GetForegroundWindow.restype=wintypes.HWND
    user32.GetWindowThreadProcessId.argtypes=[wintypes.HWND,ctypes.POINTER(wintypes.DWORD)]
    def relative(dx,dy):
        # Only send input when our temporary Chrome instance owns the foreground
        # and the actual browser pointer lock is held.
        foreground_pid=wintypes.DWORD()
        user32.GetWindowThreadProcessId(user32.GetForegroundWindow(),ctypes.byref(foreground_pid))
        if foreground_pid.value!=p.pid or not state()['mouseCaptured']:
            raise RuntimeError('Isolated test Chrome lost foreground or mouse capture')
        user32.mouse_event(1,dx,dy,0,0)
    # Wait for the pointer-lock cursor-warp event before measuring.
    time.sleep(2)
    relative(35,0);time.sleep(2)
    tap('r','KeyR',82);time.sleep(1.5)
    ev("""window.__qaMotion={n:0,x:0,y:0,lastYaw:__atelierQA.getState().orbitYaw,yaw:0,maxErr:0};
      document.addEventListener('mousemove',e=>{if(!document.pointerLockElement)return;const m=__qaMotion;
      const yaw=__atelierQA.getState().orbitYaw,delta=Math.atan2(Math.sin(yaw-m.lastYaw),Math.cos(yaw-m.lastYaw));
      m.yaw+=delta;m.x+=e.movementX;m.y+=e.movementY;m.lastYaw=yaw;m.n++;
      const expected=-e.movementX*.0035;
      m.maxErr=Math.max(m.maxErr,Math.abs(Math.atan2(Math.sin(delta-expected),Math.cos(delta-expected))));});
    """)
    def sweep(check_wall=False):
        ev("""__qaMotion.n=0;__qaMotion.x=0;__qaMotion.y=0;__qaMotion.yaw=0;__qaMotion.lastYaw=__atelierQA.getState().orbitYaw;__qaMotion.maxErr=0""")
        minz=999;seen=0
        for i in range(80):
            prev=ev('__qaMotion.n')
            relative(45,0)
            deadline=time.time()+2.8
            while time.time()<deadline:
                data=ev('__qaMotion')
                if data['n']>prev:break
                time.sleep(.15)
            st=state();minz=min(minz,st['cameraPos'][2])
            if abs(data['yaw'])>=2*math.pi:break
        print('SWEEP',data,'min_camera_z',minz,'wall',check_wall,flush=True)
        assert abs(data['yaw'])>=2*math.pi and data['maxErr']<.02,data
        if check_wall:assert minz>-5.42,minz
    sweep();time.sleep(.8);shot('native-360')
    tap('Escape','Escape',27)
    released=wait_for(lambda st:not st['mouseCaptured'])
    print('RELEASED',released,flush=True);time.sleep(1.5)
    click(720,450);again=wait_for(lambda st:st['mouseCaptured'])
    print('REACQUIRED',again,flush=True)
    tap('Escape','Escape',27);wait_for(lambda st:not st['mouseCaptured']);time.sleep(.5)
    ev('__atelierQA.gotoChapter("work")');time.sleep(.9);tap('f','KeyF',70)
    wait_for(lambda st:st['mode']=='MINI_WALKING');time.sleep(.4)
    # Walk toward the rear wall without E; clamp, then verify camera stays in front.
    key('rawKeyDown','w','KeyW',87)
    try: wall=wait_for(lambda st:st['charPos'][2]<=-4.45,40);time.sleep(1)
    finally:key('keyUp','w','KeyW',87)
    wall=state();assert wall['charPos'][2]>=-4.551
    assert wall['mode']=='MINI_WALKING'
    print('REAR_WALL',wall,flush=True);shot('rear-wall')
    if wall['mouseCaptured']:
        time.sleep(1.2)
        sweep(True);shot('wall-sweep')
    print('ERRORS',json.dumps(errors,ensure_ascii=True)[:4000],flush=True)
    assert not errors, errors
finally:
    p.terminate();server.shutdown();log.close()
