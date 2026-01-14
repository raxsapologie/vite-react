import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Folder, Settings, Plus, Trash2, Power, HardDrive, Shield, Terminal, Upload, File, Download, X, Lock, LogOut, User, Activity, Clock } from 'lucide-react';

// KRYNOS OMNI-COMMAND v3.0
// AUTH + PROJECTS + TEAM + STORAGE (BY PROJ) + SECURITY + TERMINAL + DISCORD

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // DATA STATES
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [files, setFiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [webhook, setWebhook] = useState('');
  
  // MODALS & FORMS
  const [modals, setModals] = useState({ project: false, member: false });
  const [forms, setForms] = useState({ 
    project: { name: '', desc: '', progress: 0 },
    member: { name: '', role: '', status: 'active' }
  });
  const [termData, setTermData] = useState({ input: '', output: ['> KRYNOS Intelligence Hub Online', '> Type "help" for protocols'] });

  // PERSISTENCE
  useEffect(() => {
    const load = (key, def = '[]') => JSON.parse(localStorage.getItem(`k3_${key}`) || def);
    setProjects(load('projects'));
    setTeam(load('team'));
    setFiles(load('files'));
    setLogs(load('logs'));
    setWebhook(localStorage.getItem('k3_webhook') || '');
    const session = localStorage.getItem('k3_session');
    if (session) { setIsAuthenticated(true); setCurrentUser(JSON.parse(session)); }
  }, []);

  useEffect(() => {
    localStorage.setItem('k3_projects', JSON.stringify(projects));
    localStorage.setItem('k3_team', JSON.stringify(team));
    localStorage.setItem('k3_files', JSON.stringify(files));
    localStorage.setItem('k3_logs', JSON.stringify(logs));
    localStorage.setItem('k3_webhook', webhook);
  }, [projects, team, files, logs, webhook]);

  // SYSTEM LOGIC
  const addLog = (action, details) => {
    const newLog = { id: Date.now(), timestamp: new Date().toISOString(), user: currentUser?.name || 'System', action, details };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const sendDiscord = async (title, message, color = 0x00F2FF) => {
    if (!webhook) return;
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{ title: `[KRYNOS] ${title}`, description: `${message}\n**Operative:** ${currentUser?.name || 'System'}`, color, timestamp: new Date().toISOString() }]
        })
      });
    } catch (e) { console.error("Discord error", e); }
  };

  // HANDLERS
  const handleLogin = (e) => {
    e.preventDefault();
    if (authForm.username && authForm.password === 'krynos2026') {
      const u = { name: authForm.username };
      setIsAuthenticated(true); setCurrentUser(u);
      localStorage.setItem('k3_session', JSON.stringify(u));
      addLog('ACCESS_GRANTED', `${u.name} logged in`);
      sendDiscord('SECURITY', `**${u.name}** accessed the system.`, 0x00FF88);
    } else { alert("ACCESS DENIED"); }
  };

  const handleTerminal = (v) => {
    const cmd = v.toLowerCase().trim();
    let res = [`> ${v}`];
    if (cmd === 'help') res.push('status, clear, alert [msg], projects');
    else if (cmd === 'status') res.push(`READY | P:${projects.length} | T:${team.length} | F:${files.length}`);
    else if (cmd.startsWith('alert ')) {
      const m = v.substring(6); sendDiscord('COMMAND_ALERT', m, 0xFF0055);
      res.push(`Broadcasting: ${m}`);
    } else if (cmd === 'clear') { setTermData({ input: '', output: ['> Terminal Reset'] }); return; }
    setTermData({ input: '', output: [...termData.output, ...res] });
    addLog('TERM_CMD', cmd);
  };

  const fileUpload = (e, pId) => {
    Array.from(e.target.files).forEach(file => {
      const r = new FileReader();
      r.onload = (ev) => {
        const nf = { id: Math.random(), name: file.name, size: (file.size/1024).toFixed(1)+'KB', data: ev.target.result, projectId: pId, uploader: currentUser.name, date: new Date().toISOString() };
        setFiles(p => [...p, nf]);
        addLog('FILE_ADD', `${file.name} -> ${projects.find(x=>x.id===pId)?.name}`);
        sendDiscord('FILES', `**${currentUser.name}** uploaded **${file.name}**.`);
      };
      r.readAsDataURL(file);
    });
  };

  // UI
  if (!isAuthenticated) return (
    <div style={{ height: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleLogin} style={{ background: '#0D0D0E', padding: '40px', borderRadius: '16px', border: '1px solid #1F1F21', width: '320px', textAlign: 'center' }}>
        <Shield size={48} color="#00F2FF" style={{ marginBottom: '20px' }} />
        <h2 style={{ color: '#FFF', marginBottom: '25px', letterSpacing: '2px' }}>KRYNOS AUTH</h2>
        <input type="text" placeholder="Username" style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #222', borderRadius: '8px', color: '#FFF', marginBottom: '10px' }} onChange={e=>setAuthForm({...authForm, username: e.target.value})}/>
        <input type="password" placeholder="Passkey" style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #222', borderRadius: '8px', color: '#FFF', marginBottom: '20px' }} onChange={e=>setAuthForm({...authForm, password: e.target.value})}/>
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#00F2FF', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>ENTER</button>
      </form>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#E5E5E5', fontFamily: 'Inter, sans-serif' }}>
      {/* SIDEBAR */}
      <aside style={{ width: '260px', background: '#0D0D0E', borderRight: '1px solid #1F1F21', padding: '30px 20px', position: 'fixed', height: '100vh' }}>
        <div style={{ color: '#00F2FF', fontWeight: 800, fontSize: '22px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={24}/> KRYNOS</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            {id:'dashboard', icon:BarChart3, label:'Overview'}, {id:'projects', icon:Folder, label:'Projects'},
            {id:'team', icon:Users, label:'Team'}, {id:'storage', icon:HardDrive, label:'Storage'},
            {id:'security', icon:Shield, label:'Security'}, {id:'terminal', icon:Terminal, label:'Terminal'},
            {id:'settings', icon:Settings, label:'Settings'}
          ].map(i => (
            <button key={i.id} onClick={()=>setCurrentPage(i.id)} style={{ padding:'12px', background:currentPage===i.id?'#161618':'transparent', border:'none', color:currentPage===i.id?'#00F2FF':'#888', borderRadius:'8px', cursor:'pointer', textAlign:'left', display:'flex', gap:'10px', fontSize:'14px' }}><i.icon size={18}/> {i.label}</button>
          ))}
        </nav>
        <div style={{ position:'absolute', bottom:'30px', width:'220px', padding:'15px', background:'#111', borderRadius:'12px', border:'1px solid #222' }}>
          <div style={{ fontSize:'12px', color:'#FFF', marginBottom:'8px' }}>USER: {currentUser.name}</div>
          <button onClick={()=>{localStorage.removeItem('k3_session'); window.location.reload();}} style={{ width:'100%', padding:'6px', background:'#FF4B2B22', color:'#FF4B2B', border:'1px solid #FF4B2B44', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}><LogOut size={12}/> LOGOUT</button>
        </div>
      </aside>

      {/* CONTENT */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '40px 60px' }}>
        {currentPage === 'dashboard' && (
          <div>
            <h1 style={{ fontSize:'32px', marginBottom:'30px' }}>Dashboard</h1>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px', marginBottom:'40px' }}>
              <div style={{ background:'#161618', padding:'24px', borderRadius:'12px', border:'1px solid #262629' }}>
                <div style={{ color:'#888', fontSize:'12px' }}>PROJECTS</div><div style={{ fontSize:'32px', fontWeight:700 }}>{projects.length}</div>
              </div>
              <div style={{ background:'#161618', padding:'24px', borderRadius:'12px', border:'1px solid #262629' }}>
                <div style={{ color:'#888', fontSize:'12px' }}>ACTIVE TEAM</div><div style={{ fontSize:'32px', fontWeight:700, color:'#00FF88' }}>{team.filter(m=>m.status==='active').length}</div>
              </div>
              <div style={{ background:'#161618', padding:'24px', borderRadius:'12px', border:'1px solid #262629' }}>
                <div style={{ color:'#888', fontSize:'12px' }}>FILES</div><div style={{ fontSize:'32px', fontWeight:700 }}>{files.length}</div>
              </div>
            </div>
            <h2 style={{ fontSize:'18px', color:'#888', marginBottom:'15px' }}>Live Logs</h2>
            <div style={{ background:'#161618', borderRadius:'12px', border:'1px solid #262629' }}>
              {logs.slice(0, 8).map(l=>(
                <div key={l.id} style={{ padding:'12px 20px', borderBottom:'1px solid #1F1F21', fontSize:'13px', display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'#00F2FF', width:'100px' }}>{l.action}</span>
                  <span style={{ flex:1 }}>{l.details}</span>
                  <span style={{ color:'#444' }}>{new Date(l.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'projects' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'30px' }}>
              <h1 style={{ fontSize:'32px' }}>Projects</h1>
              <button onClick={()=>setModals({...modals, project:true})} style={{ background:'#00F2FF', padding:'10px 20px', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer' }}>+ NEW</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'20px' }}>
              {projects.map(p=>(
                <div key={p.id} style={{ background:'#161618', padding:'24px', borderRadius:'12px', border:'1px solid #262629' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                    <h3 style={{ fontSize:'20px' }}>{p.name}</h3>
                    <button onClick={()=>{setProjects(projects.filter(x=>x.id!==p.id)); addLog('DELETE', `Project ${p.name} removed`);}} style={{ background:'none', border:'none', color:'#444', cursor:'pointer' }}><Trash2 size={16}/></button>
                  </div>
                  <p style={{ color:'#888', fontSize:'14px', marginBottom:'20px' }}>{p.desc}</p>
                  <div style={{ height:'6px', background:'#262629', borderRadius:'3px', overflow:'hidden', marginBottom:'15px' }}>
                    <div style={{ width:`${p.progress}%`, height:'100%', background:'#00F2FF' }}></div>
                  </div>
                  <label style={{ display:'block', textAlign:'center', padding:'10px', background:'#050505', border:'1px solid #262629', borderRadius:'8px', cursor:'pointer', fontSize:'13px' }}>
                    <Upload size={14} style={{ verticalAlign:'middle', marginRight:'5px' }}/> Upload to {p.name}
                    <input type="file" hidden onChange={e=>fileUpload(e, p.id)} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'team' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'30px' }}>
              <h1 style={{ fontSize:'32px' }}>Team</h1>
              <button onClick={()=>setModals({...modals, member:true})} style={{ background:'#00F2FF', padding:'10px 20px', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer' }}>+ ADD</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px' }}>
              {team.map(m=>(
                <div key={m.id} style={{ background:'#161618', padding:'24px', borderRadius:'12px', border:'1px solid #262629', textAlign:'center' }}>
                  <div style={{ width:'8px', height:'8px', background:m.status==='active'?'#00FF88':'#444', borderRadius:'50%', margin:'0 auto 10px', boxShadow:m.status==='active'?'0 0 10px #00FF88':'none' }}></div>
                  <h3 style={{ fontWeight:700 }}>{m.name}</h3><div style={{ color:'#888', fontSize:'12px', marginBottom:'20px' }}>{m.role}</div>
                  <button onClick={()=>{
                    const s = m.status==='active'?'idle':'active';
                    setTeam(team.map(x=>x.id===m.id?{...x, status:s}:x));
                    addLog('STATUS', `${m.name} -> ${s}`);
                    sendDiscord('TEAM UPDATE', `**${m.name}** is now **${s.toUpperCase()}**.`);
                  }} style={{ width:'100%', padding:'10px', background:'transparent', border:'1px solid #262629', borderRadius:'8px', color:m.status==='active'?'#00FF88':'#888', cursor:'pointer' }}>{m.status==='active'?'Mark Idle':'Activate'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'storage' && (
          <div>
            <h1 style={{ fontSize:'32px', marginBottom:'30px' }}>Storage (Categorized)</h1>
            {projects.map(proj=>(
              <div key={proj.id} style={{ marginBottom:'30px' }}>
                <h3 style={{ color:'#00F2FF', marginBottom:'15px', borderBottom:'1px solid #262629', paddingBottom:'8px' }}>{proj.name}</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'10px' }}>
                  {files.filter(f=>f.projectId===proj.id).map(f=>(
                    <div key={f.id} style={{ background:'#161618', padding:'15px', borderRadius:'10px', border:'1px solid #262629', display:'flex', alignItems:'center', gap:'15px' }}>
                      <File size={20} color="#00F2FF"/><div style={{ flex:1 }}><div style={{ fontSize:'14px' }}>{f.name}</div><div style={{ fontSize:'10px', color:'#444' }}>By {f.uploader} • {f.size}</div></div>
                      <button onClick={()=>{const l=document.createElement('a'); l.href=f.data; l.download=f.name; l.click();}} style={{ background:'none', border:'none', color:'#888', cursor:'pointer' }}><Download size={18}/></button>
                      <button onClick={()=>setFiles(files.filter(x=>x.id!==f.id))} style={{ background:'none', border:'none', color:'#FF5050', cursor:'pointer' }}><X size={18}/></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {currentPage === 'security' && (
          <div>
            <h1 style={{ fontSize:'32px', marginBottom:'30px' }}>Audit Trail</h1>
            <div style={{ background:'#161618', borderRadius:'12px', border:'1px solid #262629' }}>
              {logs.map(log=>(
                <div key={log.id} style={{ padding:'15px 20px', borderBottom:'1px solid #1F1F21', fontSize:'13px', display:'flex', gap:'20px' }}>
                  <span style={{ color:'#444', width:'150px' }}>{new Date(log.timestamp).toLocaleString()}</span>
                  <span style={{ color:'#00F2FF', fontWeight:700, width:'100px' }}>{log.user}</span>
                  <span style={{ color:'#FFF' }}>{log.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'terminal' && (
          <div>
            <h1 style={{ fontSize:'32px', marginBottom:'30px' }}>Console</h1>
            <div style={{ background:'#000', borderRadius:'12px', border:'1px solid #262629', padding:'20px', fontFamily:'monospace' }}>
              <div style={{ height:'300px', overflowY:'auto', color:'#AAA', marginBottom:'20px' }}>{termData.output.map((l,i)=><div key={i}>{l}</div>)}</div>
              <div style={{ display:'flex', gap:'10px' }}><span style={{ color:'#00F2FF' }}>$</span><input autoFocus style={{ flex:1, background:'none', border:'none', color:'#FFF', outline:'none' }} value={termData.input} onChange={e=>setTermData({...termData, input:e.target.value})} onKeyDown={e=>e.key==='Enter'&&handleTerminal(termData.input)}/></div>
            </div>
          </div>
        )}

        {currentPage === 'settings' && (
          <div>
            <h1 style={{ fontSize:'32px', marginBottom:'30px' }}>Settings</h1>
            <div style={{ background:'#161618', padding:'30px', borderRadius:'12px', border:'1px solid #262629', maxWidth:'600px' }}>
              <label style={{ color:'#888', fontSize:'12px', display:'block', marginBottom:'10px' }}>DISCORD WEBHOOK</label>
              <input type="password" value={webhook} onChange={e=>setWebhook(e.target.value)} style={{ width:'100%', padding:'12px', background:'#050505', border:'1px solid #262629', borderRadius:'8px', color:'#00F2FF', marginBottom:'20px', outline:'none' }} />
              <button onClick={()=>sendDiscord('SYNC TEST', `**${currentUser.name}** verified connectivity.`, 0x00FF88)} style={{ background:'transparent', border:'1px solid #00F2FF', color:'#00F2FF', padding:'10px 20px', borderRadius:'8px', cursor:'pointer' }}>TEST</button>
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {modals.project && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#111', padding:'30px', borderRadius:'16px', border:'1px solid #222', width:'400px' }}>
            <h2 style={{ marginBottom:'20px' }}>New Proj</h2>
            <input placeholder="Name" style={{ width:'100%', padding:'12px', background:'#000', border:'1px solid #333', borderRadius:'8px', color:'#FFF', marginBottom:'15px' }} onChange={e=>setForms({...forms, project:{...forms.project, name:e.target.value}})}/>
            <textarea placeholder="Desc" style={{ width:'100%', padding:'12px', background:'#000', border:'1px solid #333', borderRadius:'8px', color:'#FFF', marginBottom:'15px', height:'80px' }} onChange={e=>setForms({...forms, project:{...forms.project, desc:e.target.value}})}/>
            <input type="number" placeholder="Progress %" style={{ width:'100%', padding:'12px', background:'#000', border:'1px solid #333', borderRadius:'8px', color:'#FFF', marginBottom:'20px' }} onChange={e=>setForms({...forms, project:{...forms.project, progress:parseInt(e.target.value)}})}/>
            <div style={{ display:'flex', gap:'10px' }}><button style={{ flex:1, padding:'12px', background:'#00F2FF', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer' }} onClick={()=>{setProjects([...projects,{...forms.project, id:Date.now()}]); setModals({...modals, project:false}); addLog('PROJ_ADD', forms.project.name); sendDiscord('PROJECT_LAUNCH', `Project **${forms.project.name}** initiated.`);}}>LAUNCH</button><button style={{ flex:1, padding:'12px', background:'transparent', color:'#FFF', border:'1px solid #333', borderRadius:'8px' }} onClick={()=>setModals({...modals, project:false})}>CANCEL</button></div>
          </div>
        </div>
      )}

      {modals.member && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#111', padding:'30px', borderRadius:'16px', border:'1px solid #222', width:'400px' }}>
            <h2 style={{ marginBottom:'20px' }}>Add Op</h2>
            <input placeholder="Name" style={{ width:'100%', padding:'12px', background:'#000', border:'1px solid #333', borderRadius:'8px', color:'#FFF', marginBottom:'15px' }} onChange={e=>setForms({...forms, member:{...forms.member, name:e.target.value}})}/>
            <input placeholder="Role" style={{ width:'100%', padding:'12px', background:'#000', border:'1px solid #333', borderRadius:'8px', color:'#FFF', marginBottom:'25px' }} onChange={e=>setForms({...forms, member:{...forms.member, role:e.target.value}})}/>
            <div style={{ display:'flex', gap:'10px' }}><button style={{ flex:1, padding:'12px', background:'#00F2FF', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer' }} onClick={()=>{setTeam([...team,{...forms.member, id:Date.now()}]); setModals({...modals, member:false}); addLog('TEAM_ADD', forms.member.name); sendDiscord('MEMBER_ENROLL', `**${forms.member.name}** added.`);}}>ENROLL</button><button style={{ flex:1, padding:'12px', background:'transparent', color:'#FFF', border:'1px solid #333', borderRadius:'8px' }} onClick={()=>setModals({...modals, member:false})}>CANCEL</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
