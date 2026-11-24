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

    ev('__atelierQA.gotoChapter("lab")');time.sleep(3)
    shot('v8-lab-reference')
    ws.settimeout(110)
    result=ev("""new Promise((resolve,reject)=>{
      const world=window.__h5world;const source=world.scene;
      source.updateMatrixWorld(true);
      const scene=new THREE.Scene();
      let count=0,triangles=0;
      source.traverseVisible(o=>{
        if(!o.isMesh||o.isSkinnedMesh||!o.material||!o.material.isMeshStandardMaterial)return;
        if(o.material.transparent&&o.material.opacity<.95)return;
        // Actual triangles, world matrix, UV, normals and surface texture.
        // Exclude the interactive character, emissive hints and AO planes.
        let a=o;while(a){if(/mini|character|targetring|mountmarker/i.test(a.name))return;a=a.parent}
        const m=o.material.clone();
        m.aoMap=null;m.lightMap=null;m.envMap=null;
        const geo=o.geometry.clone();
        // Normalize quantized/interleaved attribute formats to GLTFExporter
        // compatible floats. No geometric simplification or AABB replacement.
        for(const key of Object.keys(geo.attributes)){
          if(!['position','normal','uv','uv2','color','tangent'].includes(key)){geo.deleteAttribute(key);continue;}
          const attr=geo.attributes[key],buf=new Float32Array(attr.count*attr.itemSize);
          const original=attr.isInterleavedBufferAttribute?attr.data.array:attr.array;
          const norm=attr.normalized?(original instanceof Uint8Array?255:original instanceof Uint16Array?65535:original instanceof Int8Array?127:original instanceof Int16Array?32767:1):1;
          for(let i=0;i<attr.count;i++)for(let c=0;c<attr.itemSize;c++)buf[i*attr.itemSize+c]=Math.max(attr.normalized?-1:-Infinity,[attr.getX(i),attr.getY(i),attr.getZ(i),attr.getW(i)][c]/norm);
          geo.setAttribute(key,new THREE.BufferAttribute(buf,attr.itemSize));
        }
        if(geo.index)geo.setIndex(new THREE.BufferAttribute(new Uint32Array(geo.index.array),1));
        const copy=new THREE.Mesh(geo,m);
        copy.name=(o.name||'StaticMesh')+'__'+count;
        copy.matrix.copy(o.matrixWorld);copy.matrixAutoUpdate=false;
        copy.matrix.decompose(copy.position,copy.quaternion,copy.scale);
        scene.add(copy);
        count++;triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;
      });
      new THREE.GLTFExporter().parse(scene,async data=>{
        try{
          if(!(data instanceof ArrayBuffer))throw Error('not GLB');
          const r=await fetch('/h5-export',{method:'POST',body:data});
          if(!r.ok)throw Error(r.status);
          resolve({count,triangles,bytes:data.byteLength});
        }catch(e){reject(e);}
      },{binary:true,onlyVisible:true,trs:true,maxTextureSize:1024});
    })""")
    print('EXACT_MESH_EXPORT',result,flush=True)
    assert result['count']>100 and result['triangles']>20000
    assert not errors,errors
finally:
    p.terminate();server.shutdown();log.close()
