const words = ["生き甲斐", "集中", "成長", "幸福", "平和", "穏やか", "努力", "目標", "魂", "人間", "機会", "挑戦", "成功", "情熱", "希望", "静寂", "癒やし", "忍耐", "改善", "夢", "目的", "意識", "精神", "心", "絆", "笑顔", "感謝", "閃き", "創造", "発見", "進歩", "達成", "歓喜", "安らぎ", "自律", "覚悟", "光", "未来", "変化", "決意", "勇気", "習慣", "効率", "生産性", "瞑想", "呼吸", "調和", "自由", "愛", "優しさ", "思いやり", "仲間", "運命", "奇跡", "才能", "可能性", "開花", "飛躍", "突破", "継続", "根気", "集中力", "探求", "深遠", "平常心", "安心", "満足", "祝福", "活力", "輝き", "導き", "理念", "志", "使命", "存在", "生命", "共感", "温もり", "休息", "静けさ", "秩序", "整理", "実現", "成果", "前進", "展開", "好機", "飛翔", "覚醒", "直感", "元気", "鼓舞", "奮闘", "探究心", "向上心", "自己実現", "悠々", "一期一会", "余裕", "邁進"];

// State
let emotionalData = JSON.parse(localStorage.getItem('emotionalJournal')) || [];
let productivityData = JSON.parse(localStorage.getItem('productivityJournal')) || [];

const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

// Initialize missing today's entry
function initData(dataArray) {
  if (dataArray.length === 0 || dataArray[dataArray.length - 1].date !== today) {
    dataArray.push({ date: today, text: '' });
  }
}

initData(emotionalData);
initData(productivityData);

// Save to localStorage
function saveData() {
  localStorage.setItem('emotionalJournal', JSON.stringify(emotionalData));
  localStorage.setItem('productivityJournal', JSON.stringify(productivityData));
}
saveData(); // Save initially in case we added today's entry

// DOM Elements
const emotionalScroll = document.getElementById('emotional-scroll');
const productivityScroll = document.getElementById('productivity-scroll');
const bgContainer = document.getElementById('bg-container');

// Render entries
function renderEntries(dataArray, container, isEmotional) {
  container.innerHTML = ''; // Clear
  
  // Render in reverse order so today is at the top
  const reversed = [...dataArray].reverse();
  
  reversed.forEach((entry) => {
    const box = document.createElement('div');
    box.className = 'entry-box';
    
    const header = document.createElement('div');
    header.className = 'entry-date';
    
    const dateSpan = document.createElement('span');
    dateSpan.textContent = entry.date;
    
    const charCount = document.createElement('span');
    charCount.className = 'char-count';
    charCount.textContent = `${entry.text.length}/250`;
    
    header.appendChild(dateSpan);
    header.appendChild(charCount);
    
    const textarea = document.createElement('textarea');
    textarea.className = 'entry-textarea';
    textarea.maxLength = 250;
    textarea.value = entry.text;
    
    // Auto save on input
    textarea.addEventListener('input', (e) => {
      entry.text = e.target.value;
      charCount.textContent = `${entry.text.length}/250`;
      saveData();
    });
    
    box.appendChild(header);
    box.appendChild(textarea);
    container.appendChild(box);
  });
}

renderEntries(emotionalData, emotionalScroll, true);
renderEntries(productivityData, productivityScroll, false);

// Downloads
function downloadText(dataArray, filename) {
  let content = '';
  dataArray.forEach(entry => {
    content += `[${entry.date}]\n${entry.text}\n\n`;
  });
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}

document.getElementById('btn-dl-emotional').addEventListener('click', () => {
  downloadText(emotionalData, 'emotional_journal.txt');
});

document.getElementById('btn-dl-productivity').addEventListener('click', () => {
  downloadText(productivityData, 'productivity_journal.txt');
});

// Background Animation
function spawnJapaneseWord() {
  const word = words[Math.floor(Math.random() * words.length)];
  const wrapper = document.createElement('div');
  wrapper.className = 'jap-word';
  
  // Random pos (keep it somewhat away from edges to prevent overflow)
  const x = 50 + Math.random() * (window.innerWidth - 300);
  const y = 50 + Math.random() * (window.innerHeight - 100);
  
  wrapper.style.left = `${x}px`;
  wrapper.style.top = `${y}px`;
  
  // Append characters with delay
  for (let i = 0; i < word.length; i++) {
    const span = document.createElement('span');
    span.className = 'jap-char';
    span.textContent = word[i];
    span.style.animationDelay = `${i * 0.4}s`; // Stagger appearance
    wrapper.appendChild(span);
  }
  
  bgContainer.appendChild(wrapper);
  
  // Remove after animation finishes
  const totalDuration = (2.5 + word.length * 0.4) * 1000;
  setTimeout(() => {
    if (bgContainer.contains(wrapper)) {
      bgContainer.removeChild(wrapper);
    }
  }, totalDuration);
}

// Every 2 seconds
setInterval(spawnJapaneseWord, 2000);
// Spawn first one immediately
spawnJapaneseWord();
