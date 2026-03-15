'use client'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  return (
    <div style={{minHeight:'100vh',background:'#0f1117',color:'white',padding:'24px'}}>
      <div style={{maxWidth:'1200px',margin:'0 auto'}}>
        
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
          <div>
            <h1 style={{fontSize:'24px',fontWeight:'700',color:'#10b981'}}>🌿 Vườn Kiểng AI</h1>
            <p style={{color:'#6b7280',fontSize:'14px'}}>Chào mừng bạn trở lại!</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'32px'}}>
          {[
            {label:'Số cây của tôi',value:'0',icon:'🌱',color:'#10b981'},
            {label:'Chẩn đoán hôm nay',value:'0',icon:'🔬',color:'#f59e0b'},
            {label:'Giá trị vườn ảo',value:'0đ',icon:'💰',color:'#6366f1'},
            {label:'Nhắc nhở hôm nay',value:'0',icon:'⏰',color:'#ec4899'},
          ].map((card,i) => (
            <div key={i} style={{background:'#1a1d2e',borderRadius:'12px',padding:'20px',border:'1px solid #2d2f3e'}}>
              <div style={{fontSize:'28px',marginBottom:'8px'}}>{card.icon}</div>
              <div style={{fontSize:'28px',fontWeight:'700',color:card.color}}>{card.value}</div>
              <div style={{color:'#6b7280',fontSize:'13px',marginTop:'4px'}}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
          {[
            {label:'Chẩn đoán bệnh cây',desc:'Upload ảnh → AI phân tích',icon:'📷',href:'/chan-doan'},
            {label:'Thêm cây mới',desc:'Thêm vào vườn ảo của bạn',icon:'➕',href:'/them-cay'},
            {label:'Hộ chiếu cây',desc:'Xem thông tin & QR code',icon:'📋',href:'/passport'},
          ].map((btn,i) => (
            <a key={i} href={btn.href} style={{background:'#1a1d2e',borderRadius:'12px',padding:'24px',border:'1px solid #2d2f3e',textDecoration:'none',display:'block',cursor:'pointer'}}>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>{btn.icon}</div>
              <div style={{color:'white',fontWeight:'600',fontSize:'16px'}}>{btn.label}</div>
              <div style={{color:'#6b7280',fontSize:'13px',marginTop:'4px'}}>{btn.desc}</div>
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}
