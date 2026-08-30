"use client";
import { useRouter } from "next/navigation"
export default function AuthPage() {
  const router = useRouter()
  return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',flexDirection:'column',background:'#0a0a0a',color:'white'}}>
      <h1 style={{fontSize:'28px',marginBottom:'20px'}}>Login to SupaFlow</h1>
      <p style={{marginBottom:'16px',opacity:0.6}}>Click to enter builder</p>
      <button onClick={()=>router.push('/builder')} style={{padding:'12px 24px',background:'#3b82f6',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'bold'}}>Continue Anonymously</button>
    </div>
  )
}
