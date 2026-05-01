/* ============================================
   LIVE DEMO LOGIC
   ============================================ */
(function(){
  'use strict';

  // ---------- Modal control ----------
  const modal = document.getElementById('demoModal');
  const modalTitle = document.getElementById('demoTitle');
  const modalBody = document.getElementById('demoBody');
  const closeBtn = document.getElementById('demoClose');
  let activeDemoTeardown = null;

  function openModal(which){
    if(!modal) return;
    if(which === 'dental'){
      modalTitle.textContent = 'Live demo · Dental clinic operations workflow';
      modalBody.innerHTML = '';
      modalBody.appendChild(buildDentalDemo());
      activeDemoTeardown = startDentalDemo();
    } else if(which === 'lead'){
      modalTitle.textContent = 'Live demo · Lead capture & follow-up dashboard';
      modalBody.innerHTML = '';
      modalBody.appendChild(buildLeadDemo());
      activeDemoTeardown = startLeadDemo();
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if(activeDemoTeardown){activeDemoTeardown(); activeDemoTeardown=null;}
    setTimeout(()=>{ modalBody.innerHTML=''; }, 250);
  }
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  if(modal) modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

  document.querySelectorAll('[data-demo]').forEach(btn=>{
    btn.addEventListener('click', ()=> openModal(btn.dataset.demo));
  });

  // ============================================
  // DEMO 1: Dental clinic workflow
  // ============================================
  function buildDentalDemo(){
    const wrap = document.createElement('div');
    wrap.className = 'dental-demo';
    wrap.dataset.mode = 'after';
    wrap.innerHTML = `
      <div class="dental-controls">
        <div class="dental-toggle" role="tablist" aria-label="Demo mode">
          <button data-mode="before">Before automation</button>
          <button data-mode="after" class="active">After automation</button>
        </div>
        <button class="dental-replay" id="dentalReplay">↻ Replay</button>
      </div>

      <div class="workflow" id="wfStage">
        <svg class="wf-lines" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="20" y1="50" x2="38" y2="50"/>
          <line x1="40" y1="50" x2="58" y2="50"/>
          <line x1="60" y1="50" x2="78" y2="50"/>
          <line x1="80" y1="50" x2="98" y2="50"/>
        </svg>
        <div class="wf-node" data-step="0">
          <div class="wf-icon">@</div>
          <div class="wf-label">Enquiry</div>
          <div class="wf-sub">Email · Web · Phone</div>
        </div>
        <div class="wf-node before-faded" data-step="1">
          <div class="wf-icon">⚙</div>
          <div class="wf-label">Auto-route</div>
          <div class="wf-sub">Triage by intent</div>
        </div>
        <div class="wf-node before-faded" data-step="2">
          <div class="wf-icon">✦</div>
          <div class="wf-label">AI reply</div>
          <div class="wf-sub">Templated response</div>
        </div>
        <div class="wf-node before-faded" data-step="3">
          <div class="wf-icon">📅</div>
          <div class="wf-label">Booking</div>
          <div class="wf-sub">Calendar match</div>
        </div>
        <div class="wf-node" data-step="4">
          <div class="wf-icon">✓</div>
          <div class="wf-label">Confirmed</div>
          <div class="wf-sub">Patient + staff</div>
        </div>
      </div>

      <div class="dental-split">
        <div class="dental-card">
          <h4>Live patient enquiry</h4>
          <div id="dentalPatient"></div>
        </div>
        <div class="dental-card">
          <h4>Activity log</h4>
          <div class="log-list" id="dentalLog"></div>
        </div>
      </div>

      <div class="dental-stats">
        <div class="stat">
          <div class="stat-label">Avg first response</div>
          <div class="stat-value" id="stat1">2 min</div>
          <div class="stat-delta">↓ from 6 hrs</div>
        </div>
        <div class="stat">
          <div class="stat-label">Bookings this week</div>
          <div class="stat-value" id="stat2">37</div>
          <div class="stat-delta">+42% vs prior</div>
        </div>
        <div class="stat">
          <div class="stat-label">Missed enquiries</div>
          <div class="stat-value" id="stat3">0</div>
          <div class="stat-delta">↓ from 11/wk</div>
        </div>
        <div class="stat">
          <div class="stat-label">Staff admin time</div>
          <div class="stat-value" id="stat4">−68%</div>
          <div class="stat-delta">7 hrs/week saved</div>
        </div>
      </div>
    `;
    return wrap;
  }

  function startDentalDemo(){
    const wrap = document.querySelector('.dental-demo');
    if(!wrap) return ()=>{};
    const stage = wrap.querySelector('#wfStage');
    const nodes = stage.querySelectorAll('.wf-node');
    const lines = stage.querySelectorAll('.wf-lines line');
    const log = wrap.querySelector('#dentalLog');
    const patient = wrap.querySelector('#dentalPatient');
    const replay = wrap.querySelector('#dentalReplay');
    const toggleBtns = wrap.querySelectorAll('.dental-toggle button');
    const stats = {
      s1: wrap.querySelector('#stat1'),
      s2: wrap.querySelector('#stat2'),
      s3: wrap.querySelector('#stat3'),
      s4: wrap.querySelector('#stat4')
    };

    const patients = [
      {n:'Sarah M.', initials:'SM', msg:'Hi, my filling fell out last night — can I get an emergency appointment today?', tag:'Urgent', tagCls:'urgent'},
      {n:'James K.', initials:'JK', msg:'Looking to book a routine check-up and clean for me and my partner.', tag:'Routine', tagCls:'routine'},
      {n:'Priya R.', initials:'PR', msg:'Tooth pain on the lower right side, throbbing for 2 days now.', tag:'Urgent', tagCls:'urgent'},
      {n:'Tom W.',   initials:'TW', msg:'Following up on the invisalign consultation enquiry from last week.', tag:'Follow-up', tagCls:''}
    ];

    const stepsAfter = [
      {step:0, line:-1, icon:'📨', text:'<strong>Enquiry received</strong> via website form'},
      {step:1, line:0,  icon:'⚙',  text:'Auto-routed: <strong>urgent</strong> case → emergency queue'},
      {step:2, line:1,  icon:'✦',  text:'AI drafted personalised reply; queued for staff approval'},
      {step:2, line:1,  icon:'📤', text:'Reply sent: <strong>2 min</strong> after enquiry'},
      {step:3, line:2,  icon:'📅', text:'Booking link offered — patient picked <strong>Today 14:30</strong>'},
      {step:4, line:3,  icon:'✓',  text:'Confirmation sent · staff calendar updated · reminder scheduled'}
    ];
    const stepsBefore = [
      {step:0, line:-1, icon:'📨', text:'<strong>Enquiry received</strong> via website form'},
      {step:0, line:-1, icon:'⏳', text:'Sat in shared inbox — nobody assigned'},
      {step:0, line:-1, icon:'⚠', text:'Receptionist saw it <strong>4 hours later</strong>'},
      {step:0, line:-1, icon:'📤', text:'Manual reply drafted and sent · 6 hrs total'},
      {step:0, line:-1, icon:'📞', text:'Phone tag to find a slot · 2 missed call-backs'},
      {step:0, line:-1, icon:'❌', text:'Patient called another clinic in the meantime'}
    ];

    let cancelled = false;
    let timers = [];
    let currentPatientIdx = 0;

    function setMode(mode){
      wrap.dataset.mode = mode;
      toggleBtns.forEach(b=> b.classList.toggle('active', b.dataset.mode===mode));
      if(mode==='after'){
        stats.s1.textContent='2 min'; stats.s2.textContent='37'; stats.s3.textContent='0'; stats.s4.textContent='−68%';
        wrap.querySelectorAll('.stat-delta').forEach((d,i)=>{
          d.classList.remove('bad');
          d.textContent = ['↓ from 6 hrs','+42% vs prior','↓ from 11/wk','7 hrs/week saved'][i];
        });
      } else {
        stats.s1.textContent='6 hrs'; stats.s2.textContent='26'; stats.s3.textContent='11'; stats.s4.textContent='—';
        wrap.querySelectorAll('.stat-delta').forEach((d,i)=>{
          d.classList.add('bad');
          d.textContent = ['Slow first response','Lower bookings','Lost to other clinics','High admin load'][i];
        });
      }
      runSequence();
    }

    function clearTimers(){timers.forEach(t=>clearTimeout(t)); timers=[];}

    function showPatient(p){
      patient.innerHTML = `
        <div class="patient-card">
          <div class="patient-avatar">${p.initials}</div>
          <div class="patient-info">
            <div class="patient-name">${p.n}</div>
            <div class="patient-msg">${p.msg}</div>
          </div>
          <span class="patient-tag ${p.tagCls}">${p.tag}</span>
        </div>
      `;
    }

    function pushLog(item){
      const time = new Date(); time.setSeconds(time.getSeconds() - Math.floor(Math.random()*40));
      const t = String(time.getHours()).padStart(2,'0')+':'+String(time.getMinutes()).padStart(2,'0');
      const div = document.createElement('div');
      div.className = 'log-item';
      div.innerHTML = `<span class="log-time">${t}</span><span class="log-icon">${item.icon}</span><span class="log-text">${item.text}</span>`;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }

    function resetStage(){
      nodes.forEach(n=>{n.classList.remove('active','done');});
      lines.forEach(l=>l.classList.remove('lit'));
      log.innerHTML = '';
    }

    function runSequence(){
      clearTimers();
      cancelled = false;
      resetStage();
      const p = patients[currentPatientIdx % patients.length];
      currentPatientIdx++;
      showPatient(p);
      const steps = wrap.dataset.mode==='after' ? stepsAfter : stepsBefore;

      steps.forEach((s, i)=>{
        timers.push(setTimeout(()=>{
          if(cancelled) return;
          // mark previous active as done
          nodes.forEach(n=> n.classList.remove('active'));
          if(s.step >= 0){
            // mark prior steps as done
            for(let k=0;k<s.step;k++){nodes[k].classList.add('done')}
            nodes[s.step].classList.add('active');
          }
          if(s.line >= 0 && lines[s.line]) lines[s.line].classList.add('lit');
          pushLog(s);
          if(i === steps.length-1 && wrap.dataset.mode==='after'){
            setTimeout(()=>{
              if(cancelled) return;
              nodes.forEach(n=>{n.classList.remove('active'); n.classList.add('done')});
            }, 600);
          }
        }, 600 + i*1100));
      });

      // auto-loop with a different patient
      timers.push(setTimeout(()=>{
        if(!cancelled) runSequence();
      }, 600 + steps.length*1100 + 4500));
    }

    toggleBtns.forEach(b=> b.addEventListener('click', ()=> setMode(b.dataset.mode)));
    replay.addEventListener('click', ()=> runSequence());
    runSequence();

    return ()=>{ cancelled = true; clearTimers(); };
  }

  // ============================================
  // DEMO 2: Lead capture dashboard
  // ============================================
  function buildLeadDemo(){
    const wrap = document.createElement('div');
    wrap.className = 'lead-demo';
    wrap.innerHTML = `
      <div class="lead-topbar">
        <div class="lead-topbar-left">
          <div class="lead-logo">L</div>
          <div>
            <div class="lead-title">LeadFlow · Acme Plumbing</div>
            <div class="lead-subtitle">Live · last 7 days</div>
          </div>
        </div>
        <div class="lead-search">🔍  Search leads...</div>
      </div>

      <div class="lead-kpis">
        <div class="kpi">
          <div class="kpi-label">New leads · 7d</div>
          <div class="kpi-value">142 <span class="kpi-trend">+38%</span></div>
          <div class="kpi-spark" id="spark1"></div>
        </div>
        <div class="kpi">
          <div class="kpi-label">First-response time</div>
          <div class="kpi-value">2.4m <span class="kpi-trend">−83%</span></div>
          <div class="kpi-spark" id="spark2"></div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Conversion</div>
          <div class="kpi-value">31% <span class="kpi-trend">+11pt</span></div>
          <div class="kpi-spark" id="spark3"></div>
        </div>
        <div class="kpi">
          <div class="kpi-label">Dormant re-engaged</div>
          <div class="kpi-value">18 <span class="kpi-trend warn">auto</span></div>
          <div class="kpi-spark" id="spark4"></div>
        </div>
      </div>

      <div class="lead-pipe">
        <div class="pipe-col" data-stage="new">
          <div class="pipe-head"><span>● New</span><span class="count" id="c-new">0</span></div>
          <div class="pipe-body" id="col-new"></div>
        </div>
        <div class="pipe-col" data-stage="contacted">
          <div class="pipe-head"><span>● Contacted</span><span class="count" id="c-contacted">0</span></div>
          <div class="pipe-body" id="col-contacted"></div>
        </div>
        <div class="pipe-col" data-stage="qualified">
          <div class="pipe-head"><span>● Qualified</span><span class="count" id="c-qualified">0</span></div>
          <div class="pipe-body" id="col-qualified"></div>
        </div>
        <div class="pipe-col" data-stage="booked">
          <div class="pipe-head"><span>● Booked</span><span class="count" id="c-booked">0</span></div>
          <div class="pipe-body" id="col-booked"></div>
        </div>
      </div>

      <div class="lead-feed">
        <h5>Automation activity</h5>
        <div class="feed-list" id="feedList"></div>
      </div>
    `;
    return wrap;
  }

  function startLeadDemo(){
    const wrap = document.querySelector('.lead-demo');
    if(!wrap) return ()=>{};

    // sparklines
    ['spark1','spark2','spark3','spark4'].forEach((id,i)=>{
      const el = wrap.querySelector('#'+id);
      const heights = [
        [30,40,55,45,60,80,95],
        [90,80,70,55,40,30,18],
        [40,45,50,60,65,72,80],
        [20,35,28,40,32,55,48]
      ][i];
      heights.forEach(h=>{
        const s = document.createElement('span');
        s.style.height = '0%';
        el.appendChild(s);
        requestAnimationFrame(()=> s.style.height = h+'%');
      });
    });

    const seedLeads = [
      {name:'Emma Wilson',  src:'Google Ads', msg:'Need a quote for boiler service in SO15', stage:'qualified', auto:'Auto-replied · slot offered'},
      {name:'Michael Chen', src:'Website',    msg:'Leak under kitchen sink — urgent',         stage:'booked',    auto:'Booked · today 16:00'},
      {name:'Aisha Patel',  src:'Facebook',   msg:'Looking for bathroom installation quote',  stage:'contacted', auto:'Drip 1 sent'},
      {name:'David Brown',  src:'Referral',   msg:'Annual check on combi boiler',             stage:'qualified', auto:'Auto-qualified'},
      {name:'Sophie Hughes',src:'Website',    msg:'Tap dripping for 3 days, cant fix it',     stage:'booked',    auto:'Booked · tomorrow 09:00'},
      {name:'Liam Roberts', src:'Google Ads', msg:'Quote for full radiator replacement',      stage:'contacted', auto:'Drip 2 sent'}
    ];
    const newLeads = [
      {name:'Hannah Reid',   src:'Website',    msg:'Hot water not working since this morning',     auto:'Auto-replied · 18s'},
      {name:'Oliver Singh',  src:'Google Ads', msg:'Pricing for new bathroom fit-out · 3 quotes',   auto:'Quote template sent'},
      {name:'Grace Murphy',  src:'Facebook',   msg:'Smell of gas near the boiler — worried',        auto:'Flagged urgent · staff alerted'},
      {name:'Isaac Bennett', src:'Referral',   msg:'Outdoor tap burst overnight',                   auto:'Auto-replied · 12s'},
      {name:'Mia Hassan',    src:'Website',    msg:'Underfloor heating quote for new build',        auto:'Drip sequence started'}
    ];

    const feedTemplates = [
      {dot:'green', text:'<strong>Booking confirmed</strong> · Sophie Hughes → tomorrow 09:00'},
      {dot:'',      text:'<strong>Auto-reply sent</strong> · Hannah Reid · 18s response time'},
      {dot:'blue',  text:'<strong>Dormant lead re-engaged</strong> · 4 follow-ups triggered'},
      {dot:'green', text:'<strong>New booking</strong> · Michael Chen → today 16:00'},
      {dot:'',      text:'<strong>Lead qualified</strong> · Emma Wilson moved to qualified'},
      {dot:'blue',  text:'<strong>Drip 2 sent</strong> · Liam Roberts (no reply 24h)'},
      {dot:'green', text:'<strong>Quote requested</strong> · Oliver Singh · template auto-sent'},
      {dot:'',      text:'<strong>Urgent flag</strong> · Grace Murphy → staff notified instantly'}
    ];

    const cols = {
      new: wrap.querySelector('#col-new'),
      contacted: wrap.querySelector('#col-contacted'),
      qualified: wrap.querySelector('#col-qualified'),
      booked: wrap.querySelector('#col-booked')
    };
    const counters = {
      new: wrap.querySelector('#c-new'),
      contacted: wrap.querySelector('#c-contacted'),
      qualified: wrap.querySelector('#c-qualified'),
      booked: wrap.querySelector('#c-booked')
    };
    const feed = wrap.querySelector('#feedList');

    function updateCounts(){
      Object.keys(cols).forEach(k=>{
        counters[k].textContent = cols[k].children.length;
      });
    }

    function leadHTML(l, isNew){
      return `
        <div class="lead-card ${isNew?'new-lead':''}">
          <div class="lead-card-head">
            <span class="lead-name">${l.name}</span>
            <span class="lead-source">${l.src}</span>
          </div>
          <div class="lead-msg">${l.msg}</div>
          <div class="lead-meta"><span class="auto">${l.auto || 'Automation active'}</span></div>
        </div>
      `;
    }

    function placeLead(l, stage, isNew){
      const el = document.createElement('div');
      el.innerHTML = leadHTML(l, isNew);
      cols[stage].insertBefore(el.firstElementChild, cols[stage].firstChild);
      updateCounts();
    }

    function pushFeed(item){
      const time = new Date();
      const t = String(time.getHours()).padStart(2,'0')+':'+String(time.getMinutes()).padStart(2,'0');
      const div = document.createElement('div');
      div.className = 'feed-item';
      div.innerHTML = `<span class="feed-time">${t}</span><span class="feed-dot ${item.dot}"></span><span class="feed-text">${item.text}</span>`;
      feed.insertBefore(div, feed.firstChild);
      while(feed.children.length > 8) feed.removeChild(feed.lastChild);
    }

    // seed
    seedLeads.forEach(l=> placeLead(l, l.stage, false));

    // initial feed
    for(let i=0;i<4;i++) pushFeed(feedTemplates[i]);

    let cancelled = false;
    let leadIdx = 0;
    let feedIdx = 4;

    // Simulate new leads arriving
    function addNewLead(){
      if(cancelled) return;
      const l = newLeads[leadIdx % newLeads.length];
      leadIdx++;
      placeLead(l, 'new', true);
      pushFeed({dot:'', text:`<strong>New lead</strong> · ${l.name} via ${l.src}`});

      // After 2.5s, move to contacted
      setTimeout(()=>{
        if(cancelled) return;
        const card = cols.new.firstElementChild;
        if(card){
          card.classList.remove('new-lead');
          cols.contacted.insertBefore(card, cols.contacted.firstChild);
          updateCounts();
          pushFeed({dot:'blue', text:`<strong>Auto-reply sent</strong> · ${l.name}`});
        }
      }, 2500);

      // After 5s, qualified
      setTimeout(()=>{
        if(cancelled) return;
        const card = cols.contacted.firstElementChild;
        if(card){
          cols.qualified.insertBefore(card, cols.qualified.firstChild);
          updateCounts();
          pushFeed({dot:'', text:`<strong>Lead qualified</strong> · ${l.name}`});
        }
      }, 5000);

      // 50% chance: 7.5s booked, else stays qualified
      if(Math.random() > 0.4){
        setTimeout(()=>{
          if(cancelled) return;
          const card = cols.qualified.firstElementChild;
          if(card){
            cols.booked.insertBefore(card, cols.booked.firstChild);
            updateCounts();
            pushFeed({dot:'green', text:`<strong>Booking confirmed</strong> · ${l.name}`});
          }
        }, 7500);
      }
    }

    function periodicFeed(){
      if(cancelled) return;
      pushFeed(feedTemplates[feedIdx % feedTemplates.length]);
      feedIdx++;
    }

    // Trim columns so they don't grow forever
    function trim(){
      Object.values(cols).forEach(col=>{
        while(col.children.length > 6) col.removeChild(col.lastChild);
      });
      updateCounts();
    }

    addNewLead();
    const i1 = setInterval(()=>{ addNewLead(); trim(); }, 4500);
    const i2 = setInterval(periodicFeed, 3500);

    return ()=>{ cancelled = true; clearInterval(i1); clearInterval(i2); };
  }

})();
