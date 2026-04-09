
    const circumference = 2 * Math.PI * 54;
    document.querySelectorAll('.ring-wrap').forEach((wrap, index) => {
      const progress = Number(wrap.dataset.progress || 0);
      const circle = wrap.querySelector('.ring-progress');
      const offset = circumference * (1 - progress / 100);
      requestAnimationFrame(() => {
        circle.style.strokeDashoffset = offset.toFixed(3);
        circle.style.filter = 'drop-shadow(0 0 8px rgba(47,109,246,.16))';
      });
    });

    const taskItems = Array.from(document.querySelectorAll('#protocolList .protocol-item'));
    const actionButtons = Array.from(document.querySelectorAll('.task-action-btn'));
    const protocolSummary = document.getElementById('protocolSummary');
    const adherenceValue = document.getElementById('adherenceValue');
    const dailyStatusLine = document.getElementById('dailyStatusLine');
    const protocolComplete = document.getElementById('protocolComplete');

    const injectionCard = document.getElementById('injectionCard');
    const injectionTopAnchor = document.getElementById('injectionTopAnchor');
    const injectionBottomAnchor = document.getElementById('injectionBottomAnchor');
    const statusMedLayout = document.getElementById('statusMedLayout');
        const injectionTitle = injectionCard.querySelector('.injection-title');
    const injectionCopy = injectionCard.querySelector('.injection-copy');
    const injectionActions = document.getElementById('injectionActions');
    const injectionLogKey = 'heartyInjectionLogged:';

    function taskIsComplete(item){
      return item.classList.contains('completed');
    }

    function syncTaskVisual(item){
      const btn = item.querySelector('.task-action-btn');
      const done = item.classList.contains('completed');
      if(btn){
        btn.classList.toggle('done', done);
        const defaultIcon = btn.querySelector('.icon-default');
        const chk = btn.querySelector('.icon-check');
        if(defaultIcon && chk){
          defaultIcon.style.display = done ? 'none' : 'block';
          chk.style.display = done ? 'block' : 'none';
        }
      }
      const doneLine = document.getElementById(item.id + 'Done');
      if(doneLine){
        doneLine.classList.toggle('active', done);
        doneLine.style.visibility = done ? 'visible' : 'hidden';
      }
    }

    function setTaskComplete(item, done=true){
      item.classList.toggle('completed', done);
      syncTaskVisual(item);
      refreshProtocol();
    }

    function readInjectionSchedule(){
      let stored = {};
      try {
        stored = JSON.parse(localStorage.getItem('heartyInjectionSchedule') || '{}') || {};
      } catch (e) {}
      return {
        dueWeekday: stored.dueWeekday || injectionCard.dataset.dueWeekday || 'Thursday',
        nextDate: stored.nextDate || injectionCard.dataset.nextDate || '2026-04-07',
        lastDate: stored.lastDate || injectionCard.dataset.lastDate || '2026-03-28',
        medication: stored.medication || injectionCard.dataset.medication || 'Mounjaro',
        type: stored.type || injectionCard.dataset.type || 'Injection',
        dosage: stored.dosage || injectionCard.dataset.dosage || '5 mg weekly'
      };
    }

    function formatShortDate(dateStr){
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d)) return dateStr;
      return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' }).replace(' ', ' ');
    }

    function formatLongDate(dateStr){
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d)) return dateStr;
      return d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'short' });
    }

    function placeInjectionCard(){
      const schedule = readInjectionSchedule();
      const currentWeekday = (document.body.dataset.mockWeekday || document.querySelector('.day-pill').textContent.split('•')[0].trim() || new Date().toLocaleDateString('en-US',{weekday:'long'})).trim();
      const dueNow = currentWeekday === schedule.dueWeekday;
      const logKey = injectionLogKey + schedule.nextDate;
      const logged = localStorage.getItem(logKey) === '1';

      injectionCard.classList.toggle('due', dueNow && !logged);
      injectionCard.classList.toggle('logged', dueNow && logged);
      injectionTitle.textContent = formatLongDate(schedule.nextDate);
      injectionCopy.textContent = `${schedule.medication} • ${schedule.type} • ${schedule.dosage}`;

      let actions = '';
      if(dueNow){
        actions = `
          <button class="dose-icon-btn ${logged ? 'active' : ''}" type="button" id="doseCheckBtn" aria-pressed="${logged ? 'true' : 'false'}" aria-label="${logged ? 'Dose logged' : 'Log dose'}">
            <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </button>`;
      }
      injectionActions.innerHTML = actions;

      const doseCheckBtn = document.getElementById('doseCheckBtn');
      if(doseCheckBtn){
        doseCheckBtn.addEventListener('click', () => {
          const next = !(localStorage.getItem(logKey) === '1');
          localStorage.setItem(logKey, next ? '1' : '0');
          placeInjectionCard();
        });
      }

      if(dueNow){
        injectionTopAnchor.after(statusMedLayout);
      } else {
        injectionBottomAnchor.before(statusMedLayout);
      }
    }

    const photoCheckInInput = document.getElementById('photoCheckInInput');

    function openWeighInDialog(){
      const current = localStorage.getItem('heartyTodayWeightKg') || '';
      const value = window.prompt("Enter today's weight in kg.", current);
      if(value === null) return;
      const parsed = parseFloat(String(value).replace(',', '.'));
      if(Number.isFinite(parsed) && parsed > 0){
        localStorage.setItem('heartyTodayWeightKg', parsed.toFixed(1));
        setTaskComplete(document.getElementById('weighInTask'), true);
      }
    }

    function openPhotoCheckInDialog(){
      if(photoCheckInInput){
        photoCheckInInput.value = '';
        photoCheckInInput.click();
      }
    }

    function completeWalkTask(){
      const ok = window.confirm('Mark your 20–30 min walk as complete?');
      if(ok){
        setTaskComplete(document.getElementById('walkTask'), true);
      }
    }

    actionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action || '';
        if(action === 'weigh-in') return openWeighInDialog();
        if(action === 'photos') return openPhotoCheckInDialog();
        if(action === 'walk') return completeWalkTask();
        const item = document.getElementById(btn.dataset.taskId);
        setTaskComplete(item, !item.classList.contains('completed'));
      });
    });

    if(photoCheckInInput){
      photoCheckInInput.addEventListener('change', () => {
        if(photoCheckInInput.files && photoCheckInInput.files.length){
          localStorage.setItem('heartyLastPhotoCheckInAt', new Date().toISOString());
          localStorage.setItem('heartyLastPhotoCheckInCount', String(photoCheckInInput.files.length));
          setTaskComplete(document.getElementById('photoTask'), true);
        }
      });
    }

    document.querySelectorAll('.task-done').forEach(el => el.style.visibility = 'hidden');
    actionButtons.forEach(btn => syncTaskVisual(document.getElementById(btn.dataset.taskId)));

    function refreshProtocol(){
      const completed = taskItems.filter(taskIsComplete).length;
      const total = taskItems.length;
      protocolSummary.textContent = `${completed} of ${total} complete`;
      const pct = Math.round((completed / total) * 100);
      adherenceValue.textContent = pct + '%';


      if(completed === total){
        protocolComplete.classList.add('show');
        dailyStatusLine.textContent = 'Daily status: Protocol complete';
      } else {
        protocolComplete.classList.remove('show');
        if(!document.getElementById('supportLed').classList.contains('active')){
          dailyStatusLine.textContent = 'Daily status: On track';
        }
      }

      const firstRing = document.querySelector('.ring-wrap[data-progress]');
      const firstCircle = firstRing.querySelector('.ring-progress.blue');
      const offset = circumference * (1 - pct / 100);
      firstCircle.style.strokeDashoffset = offset.toFixed(3);
      firstRing.dataset.progress = pct;
    }


    const latestMarker = document.getElementById('latestMarker');
    const latestMarkerKey = 'heartyLatestMarkerAt';
    if(latestMarker){
      let achievedAt = localStorage.getItem(latestMarkerKey);
      if(!achievedAt){
        achievedAt = new Date().toISOString();
        localStorage.setItem(latestMarkerKey, achievedAt);
      }
      const hoursSince = (Date.now() - new Date(achievedAt).getTime()) / 36e5;
      if(hoursSince <= 4){
        latestMarker.classList.add('latest-glow');
      }
    }

    placeInjectionCard();
    refreshProtocol();

    const lessonCard = document.getElementById('lessonCard');
    document.getElementById('toggleLesson').addEventListener('click', () => {
      lessonCard.classList.toggle('open');
      document.getElementById('toggleLesson').textContent = lessonCard.classList.contains('open') ? 'Close lesson' : 'Open lesson';
    });

    document.getElementById('completeLesson').addEventListener('click', () => {
      lessonCard.classList.add('open');
      document.getElementById('toggleLesson').textContent = 'Close lesson';
      setTaskComplete(document.getElementById('lessonTaskItem'), true);
      document.getElementById('completeLesson').textContent = 'Lesson complete';
    });

    const sliderConfig = {
      energySlider: {
        output: 'energyValue',
        fill: ['#2f6df6','#9fc1ff'],
        label: (v) => v < 20 ? 'Very low' : v < 40 ? 'Low' : v < 60 ? 'Moderate' : v < 80 ? 'Good' : 'Strong'
      },
      appetiteSlider: {
        output: 'appetiteValue',
        fill: ['#f59e0b','#ffd79a'],
        label: (v) => v < 20 ? 'Very low' : v < 40 ? 'Low' : v < 60 ? 'Low–moderate' : v < 80 ? 'Moderate' : 'Good appetite'
      },
      sleepSlider: {
        output: 'sleepValue',
        fill: ['#8b5cf6','#d8c8ff'],
        label: (v) => v < 20 ? 'Poor' : v < 40 ? 'Light' : v < 60 ? 'Moderate' : v < 80 ? 'Good' : 'Very good'
      }
    };

    Object.entries(sliderConfig).forEach(([id, config]) => {
      const el = document.getElementById(id);
      if(!el) return;
      const valueEl = document.getElementById(config.output);
      const row = el.closest('.slider-row');
      const paint = () => {
        const v = Number(el.value);
        const pct = `${v}%`;
        if(valueEl) valueEl.textContent = config.label(v);
        el.style.background = `linear-gradient(90deg, ${config.fill[0]} 0%, ${config.fill[1]} ${pct}, #e6edf7 ${pct}, #e6edf7 100%)`;
        if(row){
          row.style.borderColor = 'rgba(156,177,200,.16)';
          row.style.boxShadow = 'none';
        }
      };
      el.addEventListener('input', () => {
        paint();
        if(row) row.classList.add('complete');
        const confirm = document.getElementById('checkinConfirm');
        if(confirm) confirm.classList.add('show');
      });
      paint();
    });

    const waterGlass = document.getElementById('waterGlass');
    const hydrationRingWrap = document.querySelectorAll('.ring-wrap')[1];
    const hydrationCircle = hydrationRingWrap ? hydrationRingWrap.querySelector('.ring-progress.teal') : null;
    let currentLiters = 1.9;
    const targetLiters = 3.0;

    function updateHydrationUI(){
      const pct = Math.min(100, Math.round((currentLiters / targetLiters) * 100));
      if(hydrationRingWrap) hydrationRingWrap.dataset.progress = pct;
      if(hydrationCircle){
        const offset = circumference * (1 - pct / 100);
        hydrationCircle.style.strokeDashoffset = offset.toFixed(3);
      }
    }

    if(waterGlass){
      waterGlass.addEventListener('click', () => {
        currentLiters = Math.min(targetLiters, currentLiters + 0.25);
        waterGlass.classList.remove('pressed');
        void waterGlass.offsetWidth;
        waterGlass.classList.add('pressed');
        setTimeout(() => waterGlass.classList.remove('pressed'), 360);
        updateHydrationUI();
      });
    }
    updateHydrationUI();

    const supportLed = document.getElementById('supportLed');
    const supportStateText = document.getElementById('supportStateText');
    const supportBanner = document.getElementById('supportBanner');
    const supportChips = Array.from(document.querySelectorAll('.support-chip[data-mode]'));
    const supportOffBtn = document.getElementById('supportOff');
    const pageRoot = document.getElementById('pageRoot');

    function clearSupport(){
      supportChips.forEach(chip => chip.classList.remove('active'));
      supportOffBtn.classList.add('is-off');
      supportLed.classList.remove('active');
      supportStateText.textContent = 'Support inactive';
      if(supportBanner){ supportBanner.innerHTML = '<strong>Support ready</strong><p>Tap a symptom if you are having a harder day. Meals and activity can then shift to a lighter support state.</p>'; }
      pageRoot.classList.remove('support-active-theme');
      if(protocolComplete.classList.contains('show')){
        dailyStatusLine.textContent = 'Daily status: Protocol complete';
      } else {
        dailyStatusLine.textContent = 'Daily status: On track';
      }
    }

    supportChips.forEach(chip => {
      chip.addEventListener('click', () => {
        supportChips.forEach(btn => btn.classList.remove('active'));
        chip.classList.add('active');
        supportLed.classList.add('active');
        const mode = chip.dataset.mode;
        supportStateText.textContent = 'Support active';
        if(supportBanner){ supportBanner.innerHTML = `<strong>${mode} support active</strong><p>${mode === 'Exhaustion' ? "Today's movement target has been softened to support recovery. Meals and expectations shift to a lighter support state." : 'Program adjusted for a lighter day. Meals, walking, and expectations shift to a more tolerable support state.'}</p>`; }
        pageRoot.classList.add('support-active-theme');
        dailyStatusLine.textContent = 'Daily status: Support mode active';
      });
    });

    document.getElementById('supportOff').addEventListener('click', clearSupport);

    refreshProtocol();
    
