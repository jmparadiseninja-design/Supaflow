"use client"
import { useRouter } from 'next/navigation'
export default function LoginPage(){
  const router = useRouter()
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0a',color:'white'}}>
      <div style={{width:400,padding:32,background:'#171717',borderRadius:16}}>
        <h1 style={{fontSize:28,fontWeight:'bold'}}>Login to SupaFlow</h1>
        <p style={{color:'#999',marginTop:8}}>Demo mode</p>
        <button onClick={()=>router.push('/dashboard')} style={{marginTop:24,width:'100%',padding:12,borderRadius:8,background:'white',color:'black',fontWeight:'bold',cursor:'pointer'}}>Enter Dashboard</button>
      </div>
    </div>
  )
}
