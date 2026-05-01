/* ============================================
   BookFlow — booking + client app (vanilla JS)
   ============================================ */
(function(){
  'use strict';

  // ---------- State ----------
  const STORAGE_KEY = 'bookflow.v1';
  const todayStr = (() => {
    const d = new Date(); return d.toISOString().slice(0,10);
  })();
  const tomorrowStr = (() => {
    const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10);
  })();
  const dayPlus = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };

  function uid(){ return 'b_' + Math.random().toString(36).slice(2,9); }

  function seedData(){
    return {
      bookings: [
        {id:uid(),client:'Sarah Mitchell',service:'Boiler service',date:todayStr,time:'09:30',stage:'confirmed',notes:'Annual service · combi boiler'},
        {id:uid(),client:'James Okafor',service:'Bathroom installation',date:todayStr,time:'10:00',stage:'in-progress',notes:'Day 2 of fit-out'},
        {id:uid(),client:'Priya Raman',service:'Routine check-up',date:todayStr,time:'14:00',stage:'confirmed',notes:''},
        {id:uid(),client:'Tom Wallace',service:'Emergency repair',date:todayStr,time:'16:30',stage:'requested',notes:'Leak under kitchen sink'},
        {id:uid(),client:'Hannah Reid',service:'Consultation',date:tomorrowStr,time:'11:00',stage:'requested',notes:'New build heating quote'},
        {id:uid(),client:'Oliver Singh',service:'Annual maintenance',date:tomorrowStr,time:'09:00',stage:'confirmed',notes:''},
        {id:uid(),client:'Grace Murphy',service:'Boiler service',date:dayPlus(2),time:'13:30',stage:'requested',notes:'Smell of gas reported'},
        {id:uid(),client:'Isaac Bennett',service:'Emergency repair',date:dayPlus(-1),time:'15:00',stage:'done',notes:'Outdoor tap fixed'},
        {id:uid(),client:'Mia Hassan',service:'Bathroom installation',date:dayPlus(-3),time:'10:00',stage:'done',notes:'Completed on time'},
        {id:uid(),client:'David Brown',service:'Routine check-up',date:dayPlus(-2),time:'11:00',stage:'done',notes:''},
        {id:uid(),client:'Emma Wilson',service:'Boiler service',date:dayPlus(3),time:'14:00',stage:'confirmed',notes:''},
        {id:uid(),client:'Sophie Hughes',service:'Consultation',date:tomorrowStr,time:'15:30',stage:'requested',notes:'Underfloor heating quote'}
      ]
    };
  }

  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) return JSON.parse(raw);
    } catch(e){}
    const seed = seedData();
    save(seed);
    return seed;
  }
  function save(s){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }catch(e){}
  }

  let state = load();
  let selectedId = null;
  let selectedTone = 'confirmation';
  let pipelineFilter = 'all';
  let searchQuery = '';

  // ---------- Helpers ----------
  function fmtDate(iso){
    const d = new Date(iso+'T00:00:00');
    return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
  }
  function fmtTodayLong(){
    return new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  }
  function initials(name){
    return name.split(/\s+/).map(p=>p[0]||'').slice(0,2).join('').toUpperCase();
  }
  function isThisWeek(iso){
    const d = new Date(iso+'T00:00:00');
    const now = new Date(); now.setHours(0,0,0,0);
    const end = new Date(now); end.setDate(end.getDate()+7);
    return d >= now && d < end;
  }
  function isUpcoming(iso){
    const d = new Date(iso+'T00:00:00');
    const now = new Date(); now.setHours(0,0,0,0);
    return d >= now;
  }
  function matchesFilter(b){
    if(pipelineFilter==='this-week') return isThisWeek(b.date);
    if(pipelineFilter==='upcoming') return isUpcoming(b.date);
    return true;
  }
  function matchesSearch(b){
    if(!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.client.toLowerCase().includes(q) ||
           b.service.toLowerCase().includes(q) ||
           (b.notes||'').toLowerCase().includes(q);
  }

  // ---------- Render: Schedule (today only) ----------
  function renderSchedule(){
    const list = document.getElementById('bfSchedule');
    document.getElementById('bfTodayDate').textContent = fmtTodayLong();
    const today = state.bookings
      .filter(b=> b.date===todayStr && matchesSearch(b))
      .sort((a,b)=> a.time.localeCompare(b.time));
    if(today.length===0){
      list.innerHTML = '<div class="bf-sched-item empty">Nothing on today.<br><span style="font-size:11px;opacity:.7">Hit "+ New booking" to add one.</span></div>';
      return;
    }
    list.innerHTML = today.map(b => `
      <div class="bf-sched-item ${b.id===selectedId?'selected':''}" data-id="${b.id}">
        <div class="bf-sched-time">${b.time}</div>
        <div class="bf-sched-client">${b.client}</div>
        <div class="bf-sched-service">${b.service}</div>
        <span class="bf-sched-stage ${b.stage}">${b.stage.replace('-',' ')}</span>
      </div>
    `).join('');
    list.querySelectorAll('.bf-sched-item').forEach(el=>{
      if(!el.dataset.id) return;
      el.addEventListener('click', ()=> selectBooking(el.dataset.id));
    });
  }

  // ---------- Render: Pipeline ----------
  function renderPipeline(){
    const stages = ['requested','confirmed','in-progress','done'];
    const filtered = state.bookings.filter(b=> matchesFilter(b) && matchesSearch(b));
    stages.forEach(s=>{
      const col = document.querySelector(`[data-col="${s}"]`);
      const count = document.querySelector(`[data-count="${s}"]`);
      const items = filtered.filter(b=> b.stage===s)
        .sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));
      count.textContent = items.length;
      col.innerHTML = items.map(b=> `
        <div class="bf-card ${b.id===selectedId?'selected':''}" data-id="${b.id}">
          <div class="bf-card-actions" data-actions>
            <button class="bf-card-act" data-action="advance" title="Move to next stage">→</button>
            <button class="bf-card-act" data-action="delete" title="Delete">×</button>
          </div>
          <div class="bf-card-client">${b.client}</div>
          <div class="bf-card-service">${b.service}</div>
          <div class="bf-card-foot">
            <span>${fmtDate(b.date)}</span>
            <span class="bf-card-time">${b.time}</span>
          </div>
        </div>
      `).join('');
      col.querySelectorAll('.bf-card').forEach(card=>{
        const id = card.dataset.id;
        card.addEventListener('click', e=>{
          if(e.target.closest('[data-action]')) return;
          selectBooking(id);
        });
        card.querySelectorAll('[data-action]').forEach(btn=>{
          btn.addEventListener('click', e=>{
            e.stopPropagation();
            const action = btn.dataset.action;
            if(action==='advance') advanceStage(id);
            else if(action==='delete') deleteBooking(id);
          });
        });
      });
    });
  }

  // ---------- Render: Clients ----------
  function renderClients(){
    const list = document.getElementById('bfClientList');
    // unique clients
    const map = {};
    state.bookings.forEach(b=>{
      const k = b.client;
      if(!map[k]) map[k] = {name:k,count:0,last:b.date};
      map[k].count++;
      if(b.date > map[k].last) map[k].last = b.date;
    });
    const clients = Object.values(map)
      .filter(c=> !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a,b)=> b.last.localeCompare(a.last));
    document.getElementById('bfClientCount').textContent = clients.length;
    if(clients.length===0){
      list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted);font-size:12px">No matching clients</div>';
      return;
    }
    list.innerHTML = clients.map(c=> `
      <div class="bf-client-item">
        <div class="bf-client-avatar">${initials(c.name)}</div>
        <div class="bf-client-info">
          <div class="bf-client-name">${c.name}</div>
          <div class="bf-client-meta">${c.count} booking${c.count>1?'s':''} · last ${fmtDate(c.last)}</div>
        </div>
      </div>
    `).join('');
  }

  // ---------- Render: Footer stats ----------
  function renderStats(){
    const today = state.bookings.filter(b=> b.date===todayStr).length;
    const week = state.bookings.filter(b=> isThisWeek(b.date)).length;
    const clientsCount = new Set(state.bookings.map(b=>b.client)).size;
    const done = state.bookings.filter(b=> b.stage==='done').length;
    document.getElementById('bfStatToday').textContent = today;
    document.getElementById('bfStatWeek').textContent = week;
    document.getElementById('bfStatClients').textContent = clientsCount;
    document.getElementById('bfStatDone').textContent = done;
  }

  function renderAll(){
    renderSchedule(); renderPipeline(); renderClients(); renderStats();
  }

  // ---------- Booking actions ----------
  function selectBooking(id){
    selectedId = id;
    const b = state.bookings.find(x=>x.id===id);
    const sel = document.getElementById('bfAiSelected');
    if(b){
      sel.classList.add('has-selection');
      sel.innerHTML = `<strong>${b.client}</strong>&nbsp;· ${b.service}, ${fmtDate(b.date)} ${b.time}`;
      generateMessage(); // auto-draft
    } else {
      sel.classList.remove('has-selection');
      sel.textContent = 'Click a booking to draft a message';
    }
    renderAll();
  }
  function advanceStage(id){
    const order = ['requested','confirmed','in-progress','done'];
    const b = state.bookings.find(x=>x.id===id);
    if(!b) return;
    const i = order.indexOf(b.stage);
    if(i < order.length-1) b.stage = order[i+1];
    save(state); renderAll();
  }
  function deleteBooking(id){
    state.bookings = state.bookings.filter(x=>x.id!==id);
    if(selectedId===id) selectedId = null;
    save(state); renderAll();
    if(!selectedId) selectBooking(null);
  }
  function addBooking(data){
    const b = {id:uid(),...data,stage:'requested'};
    state.bookings.push(b);
    save(state); renderAll();
    // flash animation
    setTimeout(()=>{
      const card = document.querySelector(`[data-id="${b.id}"]`);
      if(card){ card.classList.add('added'); }
    },20);
  }

  // ---------- AI message drafter ----------
  function generateMessage(){
    const out = document.getElementById('bfAiOutput');
    if(!selectedId){
      out.innerHTML = '<div class="bf-ai-placeholder">Pick a booking, then a tone — I\'ll draft the message.</div>';
      return;
    }
    const b = state.bookings.find(x=>x.id===selectedId);
    if(!b) return;
    const msg = draftMessage(b, selectedTone);
    typeOut(out, msg);
  }
  function draftMessage(b, tone){
    const first = b.client.split(' ')[0];
    const dateNice = fmtDate(b.date);
    if(tone==='confirmation'){
      return `Hi ${first},\n\nThis is to confirm your ${b.service.toLowerCase()} on ${dateNice} at ${b.time}.\n\nWe'll see you then. If anything changes, just reply to this message.\n\nThanks,\nAcme Services`;
    }
    if(tone==='reminder'){
      return `Hi ${first},\n\nA quick reminder of your ${b.service.toLowerCase()} tomorrow at ${b.time}.\n\nNo action needed — just confirming we're on. Reply if you need to reschedule.\n\nAcme Services`;
    }
    if(tone==='followup'){
      return `Hi ${first},\n\nHope the ${b.service.toLowerCase()} on ${dateNice} went well. If everything's working as expected, no need to reply.\n\nIf anything's off, just let me know and I'll get it sorted.\n\nThanks,\nAcme Services`;
    }
    if(tone==='late'){
      return `Hi ${first},\n\nApologies — I'm running about 10 minutes behind for your ${b.time} appointment. I'll be with you shortly.\n\nThanks for your patience.\n\nAcme Services`;
    }
    return '';
  }
  function typeOut(el, text){
    el.classList.add('bf-ai-typing');
    el.textContent = '';
    let i = 0;
    const speed = 8; // chars per tick
    function step(){
      if(i >= text.length){ el.classList.remove('bf-ai-typing'); return; }
      el.textContent = text.slice(0, Math.min(text.length, i+speed));
      i += speed;
      setTimeout(step, 16);
    }
    step();
  }

  // ---------- Wire UI ----------
  function wire(){
    // search
    const searchInput = document.getElementById('bfSearch');
    searchInput.addEventListener('input', e=>{
      searchQuery = e.target.value.trim();
      renderAll();
    });

    // pipeline tabs
    document.querySelectorAll('.bf-tabs button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.bf-tabs button').forEach(b=> b.classList.remove('active'));
        btn.classList.add('active');
        pipelineFilter = btn.dataset.filter;
        renderPipeline();
      });
    });

    // tone selector
    document.querySelectorAll('.bf-ai-tones button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        document.querySelectorAll('.bf-ai-tones button').forEach(b=> b.classList.remove('active'));
        btn.classList.add('active');
        selectedTone = btn.dataset.tone;
        generateMessage();
      });
    });

    // regenerate
    document.getElementById('bfAiRegenerate').addEventListener('click', generateMessage);
    document.getElementById('bfAiSend').addEventListener('click', ()=>{
      const out = document.getElementById('bfAiOutput');
      if(!selectedId){ out.classList.add('bf-shake'); return; }
      // simulate send
      const orig = document.getElementById('bfAiSend');
      const original = orig.textContent;
      orig.textContent = '✓ Sent';
      orig.disabled = true;
      setTimeout(()=>{ orig.textContent = original; orig.disabled = false; }, 1600);
    });

    // add booking modal
    const modal = document.getElementById('bfModal');
    const modalClose = document.getElementById('bfModalClose');
    const formCancel = document.getElementById('bfFormCancel');
    document.getElementById('bfAddBtn').addEventListener('click', ()=>{
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      // default to today
      const dInput = modal.querySelector('input[name="date"]');
      if(!dInput.value) dInput.value = todayStr;
      modal.querySelector('input[name="client"]').focus();
    });
    function closeModal(){
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      document.getElementById('bfForm').reset();
    }
    modalClose.addEventListener('click', closeModal);
    formCancel.addEventListener('click', closeModal);
    modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

    document.getElementById('bfForm').addEventListener('submit', e=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      addBooking({
        client:data.client.trim(),
        service:data.service,
        date:data.date,
        time:data.time,
        notes:(data.notes||'').trim()
      });
      closeModal();
    });
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', ()=>{
    wire();
    renderAll();
  });

})();
