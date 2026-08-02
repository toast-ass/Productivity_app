const svg = document.getElementById('tree-svg');
const btn = document.getElementById('lets-go-btn');
const treeContainer = document.getElementById('tree-container');
const closeMsg = document.getElementById('close-msg');

let leafSlots = [];
const TOTAL_LEAVES = 50;
let leavesPlaced = 0;

// Initialize layout
function init() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  
  // Start tree from top center
  const startX = width / 2;
  const startY = 50; // root near the very top
  const initialLength = height * 0.15; // 15% of screen height for main trunk
  
  // Math.PI/2 is straight downwards
  drawTree(startX, startY, Math.PI / 2, initialLength, TOTAL_LEAVES, 0);
  
  // Shuffle leaf slots to make them appear randomly across the tree when clicking
  shuffleArray(leafSlots);
  
  // Show the first button after a short delay
  setTimeout(spawnButton, 1000);
}

function drawTree(x, y, angle, length, leavesToDistribute, depth) {
  if (leavesToDistribute === 0) return;
  
  // Calculate end of this branch
  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;
  
  // Draw branch (skeleton)
  const branch = document.createElementNS("http://www.w3.org/2000/svg", "line");
  branch.setAttribute('x1', x);
  branch.setAttribute('y1', y);
  branch.setAttribute('x2', endX);
  branch.setAttribute('y2', endY);
  branch.setAttribute('stroke', 'rgba(255, 255, 255, 0.4)');
  branch.setAttribute('stroke-width', Math.max(1, 6 - (depth * 0.8)));
  branch.setAttribute('stroke-linecap', 'round');
  svg.appendChild(branch);
  
  if (leavesToDistribute === 1) {
    // This is a terminal node, record a leaf slot
    leafSlots.push({ x: endX, y: endY, angle: angle });
  } else {
    // Split remaining leaves into left and right branches
    // This creates a perfect binary tree with exactly 50 terminal nodes
    const leftLeaves = Math.floor(leavesToDistribute / 2);
    const rightLeaves = leavesToDistribute - leftLeaves;
    
    // Spread angle. Base is ~25 degrees (Math.PI/7) + some organic randomness
    const angleOffsetLeft = Math.PI / 7 + (Math.random() * 0.1 - 0.05);
    const angleOffsetRight = Math.PI / 7 + (Math.random() * 0.1 - 0.05);
    
    // Length shrinks as we go deeper (e.g., 75% to 85% of parent)
    const nextLengthLeft = length * (0.75 + Math.random() * 0.1); 
    const nextLengthRight = length * (0.75 + Math.random() * 0.1); 
    
    drawTree(endX, endY, angle - angleOffsetLeft, nextLengthLeft, leftLeaves, depth + 1);
    drawTree(endX, endY, angle + angleOffsetRight, nextLengthRight, rightLeaves, depth + 1);
  }
}

function spawnButton() {
  const btnWidth = 120;
  const btnHeight = 50;
  
  // Random coordinates within safe window bounds
  const x = Math.random() * (window.innerWidth - btnWidth);
  const y = Math.random() * (window.innerHeight - btnHeight);
  
  btn.style.left = `${x}px`;
  btn.style.top = `${y}px`;
  
  // Remove hidden class to trigger fade-in transition
  btn.classList.remove('hidden');
}

btn.addEventListener('click', () => {
  // Hide button
  btn.classList.add('hidden');
  
  // Add leaf
  if (leavesPlaced < TOTAL_LEAVES) {
    const slot = leafSlots[leavesPlaced];
    addLeaf(slot.x, slot.y, slot.angle);
    leavesPlaced++;
    
    if (leavesPlaced < TOTAL_LEAVES) {
      // Spawn next button after a short delay to let fade-out happen smoothly
      setTimeout(spawnButton, 2000); 
    } else {
      // Endgame sequence
      endGame();
    }
  }
});

function addLeaf(x, y, angle) {
  // Leaf shape using an SVG path
  const leaf = document.createElementNS("http://www.w3.org/2000/svg", "path");
  
  // A simple elegant leaf shape pointing along the angle
  const d = "M 0,0 C 10,-10 20,-10 30,0 C 20,10 10,10 0,0";
  leaf.setAttribute('d', d);
  leaf.setAttribute('fill', '#00ff00'); // Bright green
  
  // Convert radians to degrees. 
  // Path points to 0 degrees naturally.
  const deg = angle * (180 / Math.PI);
  leaf.setAttribute('transform', `translate(${x}, ${y}) rotate(${deg}) scale(0)`);
  
  // Add CSS animation for popping in
  leaf.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  
  svg.appendChild(leaf);
  
  // Trigger animation next frame
  requestAnimationFrame(() => {
    leaf.setAttribute('transform', `translate(${x}, ${y}) rotate(${deg}) scale(1)`);
  });
}

function endGame() {
  // Wait a moment so the final leaf can pop in, then start 10s fade-out
  setTimeout(() => {
    treeContainer.classList.add('fade-out');
  }, 1000);
  
  // After 12s total (1s delay + 10s fade + 1s buffer), close tab
  setTimeout(() => {
    closeMsg.classList.remove('hidden');
    // Try to close tab (may be blocked by browser)
    window.close(); 
  }, 12000);
}

// Utility to randomly shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Draw tree on load
window.onload = init;
