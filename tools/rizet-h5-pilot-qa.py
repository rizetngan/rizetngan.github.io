import os,sys,time,json,threading,subprocess,tempfile,urllib.request,base64
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import websocket
root=Path(__file__).resolve().parents[1]
out=root.parent/'rizet-h5-art'
out.mkdir(exist_ok=True)
os.chdir(root)
class H(SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
    def do_POST(self):
        if self.path!='/h5-export':self.send_error(404);return
        n=int(self.headers['Content-Length'])
        if not 0<n<100_000_000:self.send_error(400);return
        data=self.rfile.read(n)
        assert data[:4]==b'glTF'
        (out/'v8-exact-reference.glb').write_bytes(data)
        self.send_response(200);self.end_headers();self.wfile.write(b'ok')

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
    call('Page.navigate',{'url':f'http://127.0.0.1:{port}/h5-local.html'})
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


    ev('__atelierQA.gotoChapter("lab")');time.sleep(3);shot('pilot-before')
    result=ev("""new Promise((resolve,reject)=>{
      const world=window.__h5world,scene=world.scene,old=world.deskTopMesh||scene.getObjectByName('DeskSurface');
      if(!old){reject(Error('desk missing'));return}
      const loader=new THREE.TextureLoader();
      Promise.all([
        new Promise((ok,fail)=>new THREE.GLTFLoader().load('h5-pilot-local/exact-desk.glb',ok,undefined,fail)),
        ...['ao','indirect'].map(k=>new Promise((ok,fail)=>loader.load('h5-pilot-local/exact-desk-'+k+'.png',ok,undefined,fail)))
      ]).then(([g,ao,indirect])=>{
        let mesh;g.scene.traverse(x=>{if(x.isMesh)mesh=x;});
        if(!mesh||!mesh.geometry.attributes.uv2)throw Error('missing independent UV2');
        scene.updateMatrixWorld(true);g.scene.updateMatrixWorld(true);
        const a=new THREE.Box3().setFromObject(old),b=new THREE.Box3().setFromObject(mesh);
        const error=Math.max(a.min.distanceTo(b.min),a.max.distanceTo(b.max));
        if(error>.001)throw Error('bounds mismatch '+error);
        // Preserve the exact original desk object for picking, and install
        // its new render mesh in identical world space for this LOCAL test.
        const m=old.material.clone();m.aoMap=ao;m.lightMap=indirect;
        ao.encoding=indirect.encoding=THREE.LinearEncoding;
        // glTF UVs are vertically flipped; textures imported separately must match.
        ao.flipY=indirect.flipY=false;ao.needsUpdate=indirect.needsUpdate=true;
        m.aoMapIntensity=.72;m.lightMapIntensity=1.8;m.needsUpdate=true;
        mesh.material=m;mesh.castShadow=mesh.receiveShadow=true;
        old.visible=false;scene.add(g.scene);
        resolve({boundsError:error,uv1:mesh.geometry.attributes.uv.count,uv2:mesh.geometry.attributes.uv2.count,
          aoSize:[ao.image.width,ao.image.height],indirectSize:[indirect.image.width,indirect.image.height]});
      }).catch(reject);
    })""")
    print('WEBGL_EXACT_UV',result,flush=True)
    time.sleep(1.5);shot('pilot-after')
    print('ERRORS',len(errors),flush=True);assert not errors
finally:
    p.terminate();server.shutdown();log.close()
