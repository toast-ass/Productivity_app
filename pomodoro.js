let WORK_TIME = 25 * 60; // default 25 minutes
let BREAK_TIME = 5 * 60; // default 5 minutes

let totalSessions = parseInt(localStorage.getItem('pomodoroTotalSessions')) || 4;
let currentSession = parseInt(localStorage.getItem('pomodoroCurrentSession')) || 1;
if (currentSession > totalSessions) currentSession = 1;

let isWorking = true; // true = work session, false = break
let isRunning = false;
let timeRemaining = WORK_TIME;
let lastTimestamp = 0;
let flips = 0;

// DOM Elements
const timeDisplay = document.getElementById('time-display');
const btnPlayPause = document.getElementById('btn-play-pause');
const btnReset = document.getElementById('btn-reset');
const sessionInfo = document.getElementById('session-info');
const sessionSelector = document.getElementById('session-selector');
const distractionPad = document.getElementById('distraction-pad');

// SVG Elements
const hgContainer = document.getElementById('hg-container');
const clipTop = document.getElementById('clip-top');
const clipBottom = document.getElementById('clip-bottom');
const sandStream = document.getElementById('sand-stream');

// Initialize
sessionSelector.value = totalSessions;
updateSessionText();
formatTime(timeRemaining);
updateHourglass(0);

// LocalStorage for Notepad
distractionPad.value = localStorage.getItem('pomodoroDistractions') || '';
distractionPad.addEventListener('input', () => {
  localStorage.setItem('pomodoroDistractions', distractionPad.value);
});

// Session Selector Event
sessionSelector.addEventListener('change', (e) => {
  totalSessions = parseInt(e.target.value);
  localStorage.setItem('pomodoroTotalSessions', totalSessions);
  if (currentSession > totalSessions) {
    currentSession = 1;
    localStorage.setItem('pomodoroCurrentSession', currentSession);
    resetTimer();
  }
  updateSessionText();
});

// Play/Pause Button
btnPlayPause.addEventListener('click', () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

// Reset Button
btnReset.addEventListener('click', () => {
  resetTimer();
});

// Input handling for custom times
function getTimeFromInputs(containerId) {
  const container = document.getElementById(containerId);
  const inputs = container.querySelectorAll('input');
  const h = parseInt(inputs[0].value) || 0;
  const m1 = parseInt(inputs[1].value) || 0;
  const m2 = parseInt(inputs[2].value) || 0;
  const s1 = parseInt(inputs[3].value) || 0;
  const s2 = parseInt(inputs[4].value) || 0;
  
  const minutes = (m1 * 10) + m2;
  const seconds = (s1 * 10) + s2;
  return (h * 3600) + (minutes * 60) + seconds;
}

function attachInputListeners(containerId) {
  const container = document.getElementById(containerId);
  const inputs = container.querySelectorAll('input');
  
  inputs.forEach((input, index) => {
    // Select all text on focus
    input.addEventListener('focus', () => input.select());
    
    // Auto-advance
    input.addEventListener('input', (e) => {
      // Allow only numbers
      input.value = input.value.replace(/[^0-9]/g, '');
      if (input.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
      updateTimesFromInputs();
    });
    
    // Backspace handling
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value === '' && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

function updateTimesFromInputs() {
  WORK_TIME = getTimeFromInputs('work-inputs') || 1; // min 1 second
  BREAK_TIME = getTimeFromInputs('break-inputs') || 1;
  
  // If not running, update current display
  if (!isRunning) {
    timeRemaining = isWorking ? WORK_TIME : BREAK_TIME;
    formatTime(timeRemaining);
  }
}

attachInputListeners('work-inputs');
attachInputListeners('break-inputs');

function updateSessionText() {
  let modeStr = isWorking ? "Session" : "Break";
  sessionInfo.textContent = `${modeStr} ${currentSession} of ${totalSessions}`;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  timeDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function startTimer() {
  isRunning = true;
  btnPlayPause.textContent = "Pause";
  lastTimestamp = Date.now();
  sandStream.style.opacity = '1';
  requestAnimationFrame(timerLoop);
}

function pauseTimer() {
  isRunning = false;
  btnPlayPause.textContent = "Start";
  sandStream.style.opacity = '0';
}

function resetTimer() {
  pauseTimer();
  isWorking = true;
  timeRemaining = WORK_TIME;
  flips = 0;
  hgContainer.style.transform = `rotate(0deg)`;
  updateSessionText();
  formatTime(timeRemaining);
  updateHourglass(0);
}

function timerLoop() {
  if (!isRunning) return;
  
  const now = Date.now();
  const delta = (now - lastTimestamp) / 1000; // seconds
  lastTimestamp = now;
  
  timeRemaining -= delta;
  
  if (timeRemaining <= 0) {
    timeRemaining = 0;
    handleSessionEnd();
  } else {
    formatTime(timeRemaining);
    
    // Calculate progress (0 to 1)
    const total = isWorking ? WORK_TIME : BREAK_TIME;
    const progress = 1 - (timeRemaining / total);
    updateHourglass(progress);
    
    requestAnimationFrame(timerLoop);
  }
}

function handleSessionEnd() {
  pauseTimer();
  playBeep();
  
  flips++;
  hgContainer.style.transform = `rotate(${flips * 180}deg)`;
  
  if (isWorking) {
    isWorking = false;
    timeRemaining = BREAK_TIME;
  } else {
    isWorking = true;
    timeRemaining = WORK_TIME;
    currentSession++;
    
    if (currentSession > totalSessions) {
      currentSession = 1;
    }
    localStorage.setItem('pomodoroCurrentSession', currentSession);
  }
  
  updateSessionText();
  formatTime(timeRemaining);
  updateHourglass(0); // Reset visual sand state
}

function updateHourglass(progress) {
  let isUpsideDown = (flips % 2 === 1);
  let topY, topHeight, bottomY, bottomHeight;
  
  if (!isUpsideDown) {
    // Normal orientation
    topY = 10 + (65 * progress);
    topHeight = 65 * (1 - progress);
    
    bottomHeight = 65 * progress;
    bottomY = 140 - bottomHeight;
    
    sandStream.setAttribute('y1', 75);
    sandStream.setAttribute('y2', bottomY);
  } else {
    // Upside down orientation (rotated 180deg visually)
    // The visual "bottom" is the SVG's top bulb (y=10 to 75)
    topY = 10;
    topHeight = 65 * progress;
    
    // The visual "top" is the SVG's bottom bulb (y=75 to 140)
    bottomY = 75;
    bottomHeight = 65 * (1 - progress);
    
    sandStream.setAttribute('y1', 75);
    sandStream.setAttribute('y2', 10 + topHeight);
  }
  
  clipTop.setAttribute('y', topY);
  clipTop.setAttribute('height', topHeight > 0 ? topHeight : 0);
  
  clipBottom.setAttribute('y', bottomY);
  clipBottom.setAttribute('height', bottomHeight > 0 ? bottomHeight : 0);
}

// 4-second beep using Web Audio API
function playBeep() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return; 
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  
  // Fade in/out to avoid clicking and make it gentle
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.5);
  gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3.5);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 4.0);
  
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + 4.0);
}

// Custom cursor logic
const cursor = document.getElementById('cursor');
if (cursor) {
  window.addEventListener('mousemove', (e) => {
    if (cursor.style.opacity === "0" || cursor.style.opacity === "") cursor.style.opacity = "1";
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
  document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
  document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
}
