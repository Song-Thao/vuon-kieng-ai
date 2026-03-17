'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CanvasElement { id: string; type: 'image'|'draw'; label?: string; imageUrl?: string; imgObj?: HTMLImageElement; x: number; y: number; rotation: number; scale: number; tint?: string; opacity?: number; flipX?: boolean; flipY?: boolean }
interface Point { x: number; y: number }
interface HistoryState { elements: CanvasElement[]; drawData: string }

// ─── PHAN TICH AI ────────────────────────────────────────
function PhanTichTab({ info, image }: { info: any; image: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const analyze = async () => {
    if (!info.ten_cay) return alert('Vui long nhap ten cay!')
    if (!image) return alert('Vui long upload anh!')
    setLoading(true); setResult(null); setError('')
    try {
      const res = await fetch('/api/phai-dinh-huong', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({info,image}) })
      const data = await res.json()
      if (data.success) setResult(data.result)
      else setError(data.error||'Co loi')
    } catch { setError('Loi ket noi') }
    setLoading(false)
  }
  return (
    <div className="space-y-4">
      <button onClick={analyze} disabled={loading} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-xl p-4 font-bold text-base">
        {loading ? '⏳ AI dang phan tich...' : '✂️ Phan Tich Day The Voi AI'}
      </button>
      {error && <div className="bg-red-900/40 border border-red-500 rounded-xl p-3 text-red-300 text-sm">⚠️ {error}</div>}
      {result && (
        <div className="space-y-3">
          {result.nhan_dinh_chung && <div className="bg-gray-800 rounded-xl p-4 border-l-4 border-green-500"><div className="text-xs text-gray-400 mb-1">NHAN DINH TONG QUAN</div><p className="text-gray-200 text-sm">{result.nhan_dinh_chung}</p>{result.dac_diem_than&&<p className="text-green-300 text-xs mt-2">🌿 {result.dac_diem_than}</p>}</div>}
          {result.diem_manh_noi_bat && <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-xl p-3"><div className="text-yellow-400 text-xs font-semibold mb-1">⭐ Diem doc dao</div><p className="text-gray-200 text-sm">{result.diem_manh_noi_bat}</p></div>}
          {result.dang_the_goi_y?.length>0 && <div className="bg-gray-800 rounded-xl p-4"><div className="text-xs text-gray-400 mb-3">DANG THE PHU HOP</div>{result.dang_the_goi_y.map((t:any,i:number)=><div key={i} className={`rounded-lg p-3 mb-2 border ${i===0?'border-green-500 bg-green-900/20':'border-gray-600 bg-gray-700/50'}`}><div className="flex justify-between mb-1"><span className="font-bold text-green-300 text-sm">{i===0?'🥇':i===1?'🥈':'🥉'} {t.ten_the}</span><span className="text-yellow-400 text-xs">{t.do_phu_hop}</span></div><p className="text-gray-300 text-xs mb-2">{t.mo_ta}</p><div className="grid grid-cols-2 gap-2 text-xs"><div className="bg-green-900/30 rounded p-2"><span className="text-green-400">✅ </span>{t.uu_diem}</div><div className="bg-red-900/30 rounded p-2"><span className="text-red-400">⚠️ </span>{t.kho_khan}</div></div></div>)}</div>}
          {result.ke_hoach_uon_canh?.length>0 && <div className="bg-gray-800 rounded-xl p-4"><div className="text-xs text-gray-400 mb-3">KE HOACH UON CANH</div>{result.ke_hoach_uon_canh.map((s:any,i:number)=><div key={i} className="flex gap-3 mb-3"><div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</div><div><div className="font-semibold text-green-300 text-xs">{s.giai_doan}</div><div className="text-gray-300 text-xs">{s.viec_can_lam}</div>{s.ky_thuat&&<div className="text-blue-300 text-xs mt-1">🔧 {s.ky_thuat}</div>}{s.luu_y&&<div className="text-yellow-300 text-xs mt-1">⚠️ {s.luu_y}</div>}</div></div>)}</div>}
          {result.du_bao_gia_tri && <div className="bg-gray-800 rounded-xl p-4"><div className="text-xs text-gray-400 mb-2">💰 DU BAO GIA TRI</div><div className="grid grid-cols-2 gap-2">{[{l:'Hien tai',v:result.du_bao_gia_tri.gia_tri_hien_tai,c:'text-gray-300'},{l:'Sau 1 nam',v:result.du_bao_gia_tri.gia_tri_sau_1_nam,c:'text-blue-300'},{l:'Hoan thien',v:result.du_bao_gia_tri.gia_tri_hoan_thien,c:'text-green-300'},{l:'He so tang',v:result.du_bao_gia_tri.he_so_tang,c:'text-yellow-400'}].map(x=><div key={x.l} className="bg-gray-700 rounded-lg p-2"><div className="text-xs text-gray-400">{x.l}</div><div className={`font-bold text-sm ${x.c}`}>{x.v}</div></div>)}</div></div>}
          {result.canh_bao && <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3"><div className="text-red-400 font-semibold text-xs mb-1">⚠️ TUYET DOI KHONG NEN LAM</div><p className="text-gray-200 text-sm">{result.canh_bao}</p></div>}
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center"><p className="text-green-300 text-sm mb-2">Luu ket qua vao Ho Chieu!</p><Link href="/passport" className="bg-green-600 hover:bg-green-500 text-white rounded-xl px-6 py-2 inline-block text-sm font-semibold">📋 Tao Ho Chieu</Link></div>
        </div>
      )}
    </div>
  )
}

// ─── BONSAI EDITOR ───────────────────────────────────────
function BonsaiEditor({ bgImage }: { bgImage: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawLayerRef = useRef<HTMLCanvasElement>(null)
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selected, setSelected] = useState<string|null>(null)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Point>({x:0,y:0})
  const [bgImgObj, setBgImgObj] = useState<HTMLImageElement|null>(null)
  const [bgOffset, setBgOffset] = useState<Point>({x:0,y:0})
  const [bgScale, setBgScale] = useState(1)
  const [draggingBg, setDraggingBg] = useState(false)
  const [bgDragStart, setBgDragStart] = useState<Point>({x:0,y:0})
  const [tool, setTool] = useState<'select'|'bg'|'pen'|'eraser'|'lasso'>('select')
  const [penColor, setPenColor] = useState('#22c55e')
  const [penSize, setPenSize] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPt, setLastPt] = useState<Point|null>(null)
  const [lassoPoints, setLassoPoints] = useState<Point[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [showLib, setShowLib] = useState(false)
  const [libFilter, setLibFilter] = useState('all')
  const [showCutModal, setShowCutModal] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const cutCanvasRef = useRef<HTMLCanvasElement>(null)
  const [cutImg, setCutImg] = useState<HTMLImageElement|null>(null)
  const [cutPts, setCutPts] = useState<Point[]>([])
  const [cutDone, setCutDone] = useState(false)
  const [cutResult, setCutResult] = useState('')
  const [cutForm, setCutForm] = useState({ten:'',loai:'canh',nguoi:''})
  const [cutMsg, setCutMsg] = useState('')

  useEffect(() => {
    if (bgImage) { const i=new Image(); i.onload=()=>setBgImgObj(i); i.src=bgImage }
  }, [bgImage])

  useEffect(() => { redraw() }, [elements, selected, bgImgObj, bgOffset, bgScale])
  useEffect(() => { if(showLib) loadTemplates() }, [showLib, libFilter])
  useEffect(() => { if(cutImg) drawCutCanvas() }, [cutPts, cutImg, cutDone])

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current; const draw = drawLayerRef.current
    if(!canvas||!draw) return
    const merged = document.createElement('canvas')
    merged.width=canvas.width; merged.height=canvas.height
    const ctx = merged.getContext('2d')!
    ctx.drawImage(canvas,0,0); ctx.drawImage(draw,0,0)
    const snap = merged.toDataURL()
    setHistory(prev => { const n=[...prev.slice(0,historyIdx+1),snap]; return n.slice(-20) })
    setHistoryIdx(prev => Math.min(prev+1, 19))
  }, [historyIdx])

  const undo = () => {
    if(historyIdx<=0) return
    const idx = historyIdx-1
    setHistoryIdx(idx)
    const img = new Image(); img.onload=()=>{ const ctx=drawLayerRef.current?.getContext('2d'); if(ctx){ctx.clearRect(0,0,800,560);ctx.drawImage(img,0,0)} }; img.src=history[idx]
  }

  const redo = () => {
    if(historyIdx>=history.length-1) return
    const idx = historyIdx+1
    setHistoryIdx(idx)
    const img = new Image(); img.onload=()=>{ const ctx=drawLayerRef.current?.getContext('2d'); if(ctx){ctx.clearRect(0,0,800,560);ctx.drawImage(img,0,0)} }; img.src=history[idx]
  }

  const redraw = useCallback(() => {
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d')!
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height)
    if(bgImgObj){
      ctx.save(); ctx.translate(bgOffset.x,bgOffset.y); ctx.scale(bgScale,bgScale)
      ctx.drawImage(bgImgObj,0,0,canvas.width,canvas.height); ctx.restore()
    }
    elements.forEach(el=>{
      if(!el.imgObj) return
      ctx.save(); ctx.translate(el.x,el.y); ctx.rotate(el.rotation*Math.PI/180)
      const s=el.scale; ctx.globalAlpha=el.opacity??1; ctx.scale(el.flipX?-1:1, el.flipY?-1:1); if(el.tint&&el.tint!=='none'){const off=document.createElement('canvas');off.width=s;off.height=s;const ox=off.getContext('2d')!;ox.drawImage(el.imgObj,0,0,s,s);ox.globalCompositeOperation='source-atop';ox.fillStyle=el.tint;ox.globalAlpha=0.6;ox.fillRect(0,0,s,s);ctx.drawImage(off,-s/2,-s/2,s,s);}else{ctx.drawImage(el.imgObj,-s/2,-s/2,s,s);}ctx.globalAlpha=1;
      if(selected===el.id){
        ctx.strokeStyle='#4ade80'; ctx.lineWidth=2; ctx.setLineDash([4,4])
        ctx.strokeRect(-s/2-4,-s/2-4,s+8,s+8); ctx.setLineDash([])
        ctx.fillStyle='#4ade80'; ctx.font='10px sans-serif'; ctx.textAlign='center'
        ctx.fillText(el.label||'',0,s/2+14)
      }
      ctx.restore()
    })
  }, [elements, selected, bgImgObj, bgOffset, bgScale])

  const getPos = (e: React.MouseEvent, ref: React.RefObject<HTMLCanvasElement>): Point => {
    const canvas=ref.current!; const rect=canvas.getBoundingClientRect()
    return { x:(e.clientX-rect.left)*(canvas.width/rect.width), y:(e.clientY-rect.top)*(canvas.height/rect.height) }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e, canvasRef)
    if(tool==='bg'){ setDraggingBg(true); setBgDragStart({x:pos.x-bgOffset.x,y:pos.y-bgOffset.y}); return }
    if(tool==='pen'||tool==='eraser'){ setIsDrawing(true); setLastPt(pos); return }
    if(tool==='lasso'){ setIsDrawing(true); setLassoPoints([pos]); return }
    if(tool==='select'){
      for(let i=elements.length-1;i>=0;i--){
        const el=elements[i]; const s=el.scale/2+8
        if(Math.abs(pos.x-el.x)<s&&Math.abs(pos.y-el.y)<s){
          setSelected(el.id); setDragging(true); setDragOffset({x:pos.x-el.x,y:pos.y-el.y}); return
        }
      }
      setSelected(null)
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const pos = getPos(e, canvasRef)
    if(tool==='bg'&&draggingBg){ setBgOffset({x:pos.x-bgDragStart.x,y:pos.y-bgDragStart.y}); return }
    if(tool==='select'&&dragging&&selected){ setElements(prev=>prev.map(el=>el.id===selected?{...el,x:pos.x-dragOffset.x,y:pos.y-dragOffset.y}:el)); return }
    if((tool==='pen'||tool==='eraser')&&isDrawing&&lastPt){
      const draw=drawLayerRef.current; if(!draw) return
      const ctx=draw.getContext('2d')!
      ctx.beginPath(); ctx.moveTo(lastPt.x,lastPt.y); ctx.lineTo(pos.x,pos.y)
      if(tool==='eraser'){ ctx.globalCompositeOperation='destination-out'; ctx.strokeStyle='rgba(0,0,0,1)'; ctx.lineWidth=penSize*4 }
      else { ctx.globalCompositeOperation='source-over'; ctx.strokeStyle=penColor; ctx.lineWidth=penSize }
      ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke()
      ctx.globalCompositeOperation='source-over'
      setLastPt(pos); return
    }
    if(tool==='lasso'&&isDrawing){ setLassoPoints(prev=>[...prev,pos]) }
  }

  const onMouseUp = () => {
    if(isDrawing) { saveHistory() }
    setDragging(false); setDraggingBg(false); setIsDrawing(false); setLastPt(null)
    if(tool==='lasso'&&lassoPoints.length>5){ applyLasso(); setLassoPoints([]) }
  }

  const applyLasso = () => {
    const draw=drawLayerRef.current; if(!draw) return
    const ctx=draw.getContext('2d')!
    ctx.save(); ctx.beginPath()
    lassoPoints.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y))
    ctx.closePath(); ctx.globalCompositeOperation='destination-out'
    ctx.fillStyle='rgba(0,0,0,1)'; ctx.fill()
    ctx.restore()
    const main=canvasRef.current; if(!main) return
    const mCtx=main.getContext('2d')!
    mCtx.save(); mCtx.beginPath()
    lassoPoints.forEach((p,i)=>i===0?mCtx.moveTo(p.x,p.y):mCtx.lineTo(p.x,p.y))
    mCtx.closePath(); mCtx.globalCompositeOperation='destination-out'
    mCtx.fillStyle='rgba(0,0,0,1)'; mCtx.fill()
    mCtx.restore(); redraw(); saveHistory()
  }

  const loadTemplates = async () => {
    let q=supabase.from('editor_templates').select('*').eq('is_hidden',false).order('created_at',{ascending:false})
    if(libFilter!=='all') q=q.eq('loai',libFilter)
    const {data}=await q; setTemplates(data||[])
  }

  const addFromTemplate = (t: any) => {
    const img=new Image(); img.crossOrigin='anonymous'
    img.onload=()=>{
      const el:CanvasElement={ id:Date.now().toString(), type:'image', label:t.ten, imageUrl:t.image_url, x:300, y:210, rotation:0, scale:150, imgObj:img }
      setElements(prev=>[...prev,el]); setSelected(el.id); setShowLib(false); saveHistory()
    }; img.src=t.image_url
  }

  const updateEl = (key: string, val: number) => {
    if(!selected) return
    setElements(prev=>prev.map(el=>el.id===selected?{...el,[key]:val}:el))
  }

  const deleteSelected = () => { setElements(prev=>prev.filter(el=>el.id!==selected)); setSelected(null); saveHistory() }

  const saveCanvas = () => {
    const canvas=canvasRef.current; const draw=drawLayerRef.current; if(!canvas||!draw) return
    const merged=document.createElement('canvas'); merged.width=canvas.width; merged.height=canvas.height
    const ctx=merged.getContext('2d')!; ctx.drawImage(canvas,0,0); ctx.drawImage(draw,0,0)
    const link=document.createElement('a'); link.download='bonsai-demo.png'; link.href=merged.toDataURL(); link.click()
  }

  // ── CUT MODAL ──
  const drawCutCanvas = () => {
    const c=cutCanvasRef.current; if(!c||!cutImg) return
    const ctx=c.getContext('2d')!; ctx.clearRect(0,0,c.width,c.height)
    ctx.drawImage(cutImg,0,0,c.width,c.height)
    if(cutPts.length>1){
      ctx.beginPath(); ctx.moveTo(cutPts[0].x,cutPts[0].y)
      cutPts.forEach(p=>ctx.lineTo(p.x,p.y))
      if(cutDone) ctx.closePath()
      ctx.strokeStyle='#4ade80'; ctx.lineWidth=2; ctx.setLineDash([5,3]); ctx.stroke(); ctx.setLineDash([])
      if(cutDone){ctx.fillStyle='rgba(74,222,128,0.15)';ctx.fill()}
    }
    cutPts.forEach((p,i)=>{
      ctx.beginPath(); ctx.arc(p.x,p.y,i===0?8:4,0,Math.PI*2)
      ctx.fillStyle=i===0?'#facc15':'#4ade80'; ctx.fill()
    })
  }

  const onCutClick = (e: React.MouseEvent) => {
    if(cutDone||!cutImg) return
    const c=cutCanvasRef.current!; const rect=c.getBoundingClientRect()
    const pos={x:(e.clientX-rect.left)*(c.width/rect.width),y:(e.clientY-rect.top)*(c.height/rect.height)}
    if(cutPts.length>2&&Math.hypot(pos.x-cutPts[0].x,pos.y-cutPts[0].y)<15){setCutDone(true);return}
    setCutPts(prev=>[...prev,pos])
  }

  const doCut = () => {
    if(cutPts.length<3||!cutImg) return
    const c=cutCanvasRef.current!
    const off=document.createElement('canvas'); off.width=c.width; off.height=c.height
    const ctx=off.getContext('2d')!
    ctx.beginPath(); ctx.moveTo(cutPts[0].x,cutPts[0].y)
    cutPts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.closePath(); ctx.clip()
    ctx.drawImage(cutImg,0,0,c.width,c.height)
    const minX=Math.min(...cutPts.map(p=>p.x)),minY=Math.min(...cutPts.map(p=>p.y))
    const maxX=Math.max(...cutPts.map(p=>p.x)),maxY=Math.max(...cutPts.map(p=>p.y))
    const crop=document.createElement('canvas'); crop.width=maxX-minX; crop.height=maxY-minY
    crop.getContext('2d')!.drawImage(off,minX,minY,crop.width,crop.height,0,0,crop.width,crop.height)
    setCutResult(crop.toDataURL('image/png'))
  }

  const addCutToCanvas = () => {
    if(!cutResult) return
    const img=new Image(); img.onload=()=>{
      const el:CanvasElement={id:Date.now().toString(),type:'image',label:cutForm.ten||'Anh cat',x:300,y:210,rotation:0,scale:150,imgObj:img}
      setElements(prev=>[...prev,el]); setSelected(el.id); setShowCutModal(false)
      setCutPts([]); setCutDone(false); setCutResult(''); setCutImg(null); saveHistory()
    }; img.src=cutResult
  }

  const uploadCut = async () => {
    if(!cutResult||!cutForm.ten||!cutForm.nguoi) return alert('Dien day du thong tin!')
    try {
      const res=await fetch(cutResult); const blob=await res.blob()
      const fn=`cut-${Date.now()}.png`
      const {error:se}=await supabase.storage.from('editor-templates').upload(fn,blob,{contentType:'image/png'})
      if(se) throw new Error(se.message)
      const {data:ud}=supabase.storage.from('editor-templates').getPublicUrl(fn)
      const {error:de}=await supabase.from('editor_templates').insert({ten:cutForm.ten,loai:cutForm.loai,image_url:ud.publicUrl,ten_nguoi_upload:cutForm.nguoi,is_default:false,is_hidden:false})
      if(de) throw new Error(de.message)
      setCutMsg('✅ Da luu vao thu vien!')
    } catch(e:any){setCutMsg('❌ '+e.message)}
  }

  const handleCutUpload = (e:any) => {
    const file=e.target.files[0]; if(!file) return
    const reader=new FileReader(); reader.onload=ev=>{
      const img=new Image(); img.onload=()=>{ setCutImg(img); setCutPts([]); setCutDone(false); setCutResult('') }
      img.src=ev.target?.result as string
    }; reader.readAsDataURL(file)
  }

  const selEl = elements.find(el=>el.id===selected)
  const TOOLS = [
    {id:'select',icon:'👆',label:'Chon'},
    {id:'bg',icon:'🖼️',label:'Di chuyen nen'},
    {id:'pen',icon:'✏️',label:'But ve'},
    {id:'eraser',icon:'🧹',label:'Tay'},
    {id:'lasso',icon:'🔵',label:'Xoa vung'},
  ]
  const COLORS = ['#22c55e','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#ffffff','#000000','#92400e','#164e63']
  const LOAI = [{v:'all',l:'Tat ca'},{v:'canh',l:'🌿 Canh'},{v:'tan',l:'🍃 Tan'},{v:'chau',l:'🪴 Chau'},{v:'trang_tri',l:'🪨 Trang tri'}]

  return (
    <div className="space-y-3">
      {/* TOOLBAR */}
      <div className="bg-gray-800 rounded-xl p-3">
        <div className="flex gap-2 flex-wrap items-center">
          {TOOLS.map(t=>(
            <button key={t.id} onClick={()=>setTool(t.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${tool===t.id?'bg-green-600 text-white':'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
              {t.icon} {t.label}
            </button>
          ))}
          <div className="h-6 w-px bg-gray-600 mx-1" />
          <button onClick={()=>setBgScale(s=>Math.min(s+0.15,3))} className="px-2 py-2 rounded-lg text-xs bg-gray-700 hover:bg-gray-600">🔍+</button>
          <button onClick={()=>setBgScale(s=>Math.max(s-0.15,0.2))} className="px-2 py-2 rounded-lg text-xs bg-gray-700 hover:bg-gray-600">🔍-</button>
          <button onClick={()=>{setBgOffset({x:0,y:0});setBgScale(1)}} className="px-2 py-2 rounded-lg text-xs bg-gray-700 hover:bg-gray-600">⟳</button>
          <div className="h-6 w-px bg-gray-600 mx-1" />
          <button onClick={undo} disabled={historyIdx<=0} className="px-2 py-2 rounded-lg text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-40">↩ Undo</button>
          <button onClick={redo} disabled={historyIdx>=history.length-1} className="px-2 py-2 rounded-lg text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-40">↪ Redo</button>
          <div className="h-6 w-px bg-gray-600 mx-1" />
          <button onClick={()=>{setShowLib(!showLib);setShowCutModal(false)}} className={`px-3 py-2 rounded-lg text-xs font-semibold ${showLib?'bg-purple-600':'bg-purple-700 hover:bg-purple-600'}`}>📚 Thu vien</button>
          <button onClick={()=>{setShowCutModal(!showCutModal);setShowLib(false)}} className={`px-3 py-2 rounded-lg text-xs font-semibold ${showCutModal?'bg-yellow-600':'bg-yellow-700 hover:bg-yellow-600'}`}>✂️ Cat anh</button>
        </div>

        {/* PEN OPTIONS */}
        {(tool==='pen'||tool==='eraser') && (
          <div className="mt-3 flex gap-3 items-center flex-wrap border-t border-gray-700 pt-3">
            <span className="text-xs text-gray-400">Do day: {penSize}px</span>
            <input type="range" min="1" max="30" value={penSize} onChange={e=>setPenSize(Number(e.target.value))} className="w-24" />
            {tool==='pen' && (
              <>
                <span className="text-xs text-gray-400">Mau:</span>
                <div className="flex gap-1 flex-wrap">
                  {COLORS.map(c=>(
                    <button key={c} onClick={()=>setPenColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${penColor===c?'border-white scale-125':'border-transparent'}`}
                      style={{background:c}} />
                  ))}
                  <input type="color" value={penColor} onChange={e=>setPenColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0" title="Chon mau tuy chinh" />
                </div>
              </>
            )}
          </div>
        )}
        {tool==='lasso' && <p className="text-yellow-300 text-xs mt-2 border-t border-gray-700 pt-2">🔵 Ve quanh vung muon xoa → tha chuot de xoa vung do</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* SIDEBAR */}
        <div className="space-y-3">
          {/* THU VIEN */}
          {showLib && (
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-purple-300 font-semibold text-xs mb-2">📚 Chon Template:</p>
              <div className="flex gap-1 flex-wrap mb-2">
                {LOAI.map(l=><button key={l.v} onClick={()=>{setLibFilter(l.v);loadTemplates()}} className={`px-2 py-1 rounded text-xs ${libFilter===l.v?'bg-purple-600':'bg-gray-700'}`}>{l.l}</button>)}
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {templates.map(t=>(
                  <button key={t.id} onClick={()=>addFromTemplate(t)} className="bg-gray-700 hover:bg-gray-600 rounded-lg p-2 text-center">
                    <div className="h-16 flex items-center justify-center mb-1" style={{background:'repeating-conic-gradient(#374151 0% 25%,#4b5563 0% 50%) 0 0/10px 10px'}}>
                      <img src={t.image_url} className="max-h-14 max-w-full object-contain" crossOrigin="anonymous" />
                    </div>
                    <p className="text-white text-xs truncate">{t.ten}</p>
                  </button>
                ))}
                {templates.length===0&&<p className="text-gray-500 text-xs col-span-2 py-4 text-center">Chua co template</p>}
              </div>
              <Link href="/editor-templates" target="_blank" className="block text-center text-purple-400 text-xs mt-2 hover:underline">+ Them template moi</Link>
            </div>
          )}

          {/* CHINH SUA ELEMENT */}
          {selEl && tool==='select' && (
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-green-300 font-semibold text-xs mb-3">⚙️ {selEl.label}</p>
              <label className="text-xs text-gray-400">Xoay ({selEl.rotation}°)</label>
              <input type="range" min="-180" max="180" value={selEl.rotation} onChange={e=>updateEl('rotation',Number(e.target.value))} className="w-full mb-3" />
              <label className="text-xs text-gray-400">Kich co ({selEl.scale}px)</label>
              <input type="range" min="30" max="500" value={selEl.scale} onChange={e=>updateEl('scale',Number(e.target.value))} className="w-full mb-3" />
              <div className="mb-3"><label className="text-xs text-gray-400">🎨 To mau canh:</label><div className="flex gap-1 flex-wrap mt-1">{"none#4ade80#92400e#15803d#854d0e#166534#ffffff#000000".split("#").map((c,i)=><button key={i} onClick={()=>setElements(prev=>prev.map(el=>el.id===selected?{...el,tint:i===0?"none":"#"+c}:el))} className={`w-6 h-6 rounded-full border-2 ${(selEl?.tint??"none")===(i===0?"none":"#"+c)?"border-white scale-110":"border-transparent"}`} style={{background:i===0?"transparent":"#"+c}} title={i===0?"Giu nguyen":"To mau"}>{i===0?<span className="text-xs">✕</span>:""}</button>)}</div></div><div className="mb-3"><label className="text-xs text-gray-400">Trong suot ({Math.round((selEl?.opacity??1)*100)}%)</label><input type="range" min="0.1" max="1" step="0.05" value={selEl?.opacity??1} onChange={e=>setElements(prev=>prev.map(el=>el.id===selected?{...el,opacity:Number(e.target.value)}:el))} className="w-full"/></div><div className="flex gap-2 mb-3"><button onClick={()=>setElements(prev=>prev.map(el=>el.id===selected?{...el,flipX:!el.flipX}:el))} className="flex-1 bg-blue-700 hover:bg-blue-600 rounded-lg py-2 text-xs font-semibold">↔️ Lat ngang</button><button onClick={()=>setElements(prev=>prev.map(el=>el.id===selected?{...el,flipY:!el.flipY}:el))} className="flex-1 bg-blue-700 hover:bg-blue-600 rounded-lg py-2 text-xs font-semibold">↕️ Lat doc</button></div><button onClick={deleteSelected} className="w-full bg-red-700 hover:bg-red-600 rounded-lg py-2 text-xs font-semibold">🗑️ Xoa</button>
            </div>
          )}

          {elements.length>0 && (
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-2">Layers ({elements.length}):</p>
              {[...elements].reverse().map(el=>(
                <button key={el.id} onClick={()=>{setSelected(el.id);setTool('select')}}
                  className={`w-full text-left rounded p-2 text-xs mb-1 truncate ${selected===el.id?'bg-green-700 text-white':'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                  {el.label||'Element'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CANVAS AREA */}
        <div className="lg:col-span-3 space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-gray-600">
            <canvas ref={canvasRef} width={600} height={420} className="w-full block" style={{background:'#ffffff'}}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />
            <canvas ref={drawLayerRef} width={600} height={420}
              className="absolute inset-0 w-full h-full"
              style={{cursor: tool==='pen'?'crosshair': tool==='eraser'?'cell': tool==='lasso'?'crosshair': tool==='bg'?'move': dragging?'grabbing':'default', background:'transparent'}}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />
            {/* LASSO PREVIEW */}
            {tool==='lasso'&&lassoPoints.length>0&&(
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 420">
                <polyline points={lassoPoints.map(p=>`${p.x},${p.y}`).join(' ')} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,3" />
              </svg>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={saveCanvas} className="flex-1 bg-purple-600 hover:bg-purple-500 rounded-xl py-2 text-sm font-bold">💾 Luu PNG</button>
            <button onClick={()=>{ const ctx=drawLayerRef.current?.getContext('2d'); ctx?.clearRect(0,0,600,420); saveHistory() }} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl text-xs">Xoa net ve</button>
            <button onClick={()=>{setElements([]);setSelected(null);saveHistory()}} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl text-xs">Xoa het</button>
          </div>
        </div>
      </div>

      {/* CUT MODAL FULL SCREEN */}
      {showCutModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-5xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-white font-bold text-lg">✂️ Cong Cu Cat Anh</h2>
              <button onClick={()=>setShowCutModal(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
            </div>
            <div className="p-4">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 mb-4">
                <p className="text-blue-300 text-xs font-semibold mb-1">📌 Huong dan:</p>
                <p className="text-gray-400 text-xs">1. Upload anh → 2. Bam tung diem xung quanh phan muon giu → 3. Bam vao diem VANG dau tien de dong vung → 4. Bam "Cat" → 5. Them vao canvas hoac luu vao thu vien</p>
              </div>
              <div className="mb-3">
                <input type="file" accept="image/*" onChange={handleCutUpload} className="w-full text-gray-300 text-sm" />
              </div>
              {cutImg && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${cutDone?'bg-blue-600':'bg-green-600'}`}>
                        {cutDone?'✅ Da dong vung':'✏️ Dang ve — bam diem VANG de dong'}
                      </div>
                      <span className="text-gray-400 text-xs">{cutPts.length} diem</span>
                    </div>
                    <canvas ref={cutCanvasRef} width={500} height={380}
                      className="w-full rounded-xl border border-gray-600 cursor-crosshair"
                      style={{background:'#ffffff'}} onClick={onCutClick} />
                    <div className="flex gap-2 mt-2">
                      <button onClick={doCut} disabled={cutPts.length<3} className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 rounded-xl py-2 text-sm font-bold">✂️ Cat Anh</button>
                      <button onClick={()=>{setCutPts([]);setCutDone(false);setCutResult('')}} className="flex-1 bg-gray-600 hover:bg-gray-500 rounded-xl py-2 text-sm">🔄 Ve Lai</button>
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-2">Ket qua:</p>
                    <div className="h-48 flex items-center justify-center rounded-xl border border-gray-600 mb-3" style={{background:'repeating-conic-gradient(#374151 0% 25%,#4b5563 0% 50%) 0 0/16px 16px'}}>
                      {cutResult?<img src={cutResult} className="max-h-44 max-w-full object-contain" />:<p className="text-gray-500 text-sm">Chua cat</p>}
                    </div>
                    {cutResult && (
                      <div className="space-y-2">
                        <button onClick={addCutToCanvas} className="w-full bg-green-600 hover:bg-green-500 rounded-xl py-3 text-sm font-bold">➕ Them Vao Canvas Editor</button>
                        <div className="bg-gray-800 rounded-xl p-3 border border-gray-600">
                          <p className="text-gray-400 text-xs mb-2">Luu vao Community Library:</p>
                          <input className="w-full bg-gray-700 rounded p-2 mb-2 text-white text-xs placeholder-gray-500" placeholder="Ten template *" value={cutForm.ten} onChange={e=>setCutForm({...cutForm,ten:e.target.value})} />
                          <select className="w-full bg-gray-700 rounded p-2 mb-2 text-white text-xs" value={cutForm.loai} onChange={e=>setCutForm({...cutForm,loai:e.target.value})}>
                            <option value="canh">🌿 Canh bonsai</option>
                            <option value="tan">🍃 Tan la</option>
                            <option value="chau">🪴 Chau cay</option>
                            <option value="trang_tri">🪨 Trang tri</option>
                          </select>
                          <input className="w-full bg-gray-700 rounded p-2 mb-2 text-white text-xs placeholder-gray-500" placeholder="Ten cua ban *" value={cutForm.nguoi} onChange={e=>setCutForm({...cutForm,nguoi:e.target.value})} />
                          <button onClick={uploadCut} className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-2 text-xs font-bold">⬆️ Luu Vao Thu Vien</button>
                          {cutMsg&&<p className={`text-xs mt-1 ${cutMsg.startsWith('✅')?'text-green-400':'text-red-400'}`}>{cutMsg}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TRANG CHINH ─────────────────────────────────────────
export default function PhaiDinhHuong() {
  const [tab, setTab] = useState<'phan-tich'|'editor'>('phan-tich')
  const [info, setInfo] = useState({ten_cay:'',chieu_cao:'',hoanh_goc:'',tuoi_cay:'',mo_ta:''})
  const [image, setImage] = useState('')

  const handleImage = (e: any) => {
    const file=e.target.files[0]; if(!file) return
    const reader=new FileReader(); reader.onload=ev=>{
      const img=new Image(); img.onload=()=>{
        const canvas=document.createElement('canvas')
        const max=800; let w=img.width,h=img.height
        if(w>max){h=h*max/w;w=max} if(h>max){w=w*max/h;h=max}
        canvas.width=w; canvas.height=h; canvas.getContext('2d')!.drawImage(img,0,0,w,h)
        setImage(canvas.toDataURL('image/jpeg',0.8))
      }; img.src=ev.target?.result as string
    }; reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
        <div>
          <h1 className="text-xl font-bold text-green-400">✂️ AI Master Designer</h1>
          <p className="text-gray-400 text-xs">Phan tich day the + Bonsai Editor chuyen nghiep</p>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl p-4 mb-4">
        <h2 className="text-green-300 font-semibold text-sm mb-3">📋 Thong tin cay phoi</h2>
        <div className="grid grid-cols-2 gap-3">
          {[{key:'ten_cay',label:'Ten cay *',ph:'VD: Mai Chieu Thuy'},{key:'chieu_cao',label:'Chieu cao',ph:'VD: 90cm'},{key:'hoanh_goc',label:'Hoanh goc',ph:'VD: 60cm'},{key:'tuoi_cay',label:'Tuoi cay',ph:'VD: 5 nam'}].map(f=>(
            <div key={f.key}>
              <label className="text-xs text-gray-400">{f.label}</label>
              <input className="w-full bg-gray-700 rounded p-2 mt-1 text-white placeholder-gray-500 text-sm" placeholder={f.ph} value={(info as any)[f.key]} onChange={e=>setInfo({...info,[f.key]:e.target.value})} />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-400">Mo ta them</label>
          <textarea className="w-full bg-gray-700 rounded p-2 mt-1 h-14 text-white placeholder-gray-500 text-sm" placeholder="VD: Than nghieng tu nhien..." value={info.mo_ta} onChange={e=>setInfo({...info,mo_ta:e.target.value})} />
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-400">📸 Anh cay phoi *</label>
          {image&&<img src={image} className="w-full rounded-lg max-h-40 object-contain bg-gray-700 my-2" />}
          <input type="file" accept="image/*" onChange={handleImage} className="w-full text-gray-300 text-sm mt-1" />
          {image&&<p className="text-green-400 text-xs mt-1">✅ Anh san sang</p>}
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab('phan-tich')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${tab==='phan-tich'?'bg-green-600':'bg-gray-700 hover:bg-gray-600'}`}>🔍 Phan Tich AI</button>
        <button onClick={()=>setTab('editor')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${tab==='editor'?'bg-purple-600':'bg-gray-700 hover:bg-gray-600'}`}>🎨 Bonsai Editor</button>
      </div>
      {tab==='phan-tich'&&<PhanTichTab info={info} image={image} />}
      {tab==='editor'&&<BonsaiEditor bgImage={image} />}
    </div>
  )
}
