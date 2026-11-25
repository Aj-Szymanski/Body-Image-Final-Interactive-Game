// 0. Top-Right "Change Character" & Ending "Go Back to the Home Page" Buttons
const backHomeBtn = document.getElementById('back-home-btn');
const confirmBackModal = document.getElementById('confirm-back-modal');
const confirmYesBtn = document.getElementById('confirm-yes-btn');
const confirmNoBtn = document.getElementById('confirm-no-btn');
const endHomeBtn = document.getElementById('end-home-btn');

if (backHomeBtn && confirmBackModal) {
  backHomeBtn.addEventListener('click', () => {
    confirmBackModal.classList.remove('hidden');
  });
}

if (confirmNoBtn && confirmBackModal) {
  confirmNoBtn.addEventListener('click', () => {
    confirmBackModal.classList.add('hidden');
  });
}

if (confirmYesBtn) {
  confirmYesBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

if (endHomeBtn) {
  endHomeBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

// Main Story Elements
const gameStage = document.getElementById('game-stage');
const speakerBadge = document.getElementById('speaker-badge');
const speakerName = document.getElementById('speaker-name');
const playerAvatar = document.getElementById('player-avatar');
const mirrorImg = document.getElementById('mirror-reflection-img');
const nextBtn = document.getElementById('next-btn');
const memoryToast = document.getElementById('memory-toast');

const nameModal = document.getElementById('name-modal');
const namePromptLabel = document.getElementById('name-prompt-label');
const nameInput = document.getElementById('player-name-input');
const submitNameBtn = document.getElementById('submit-name-btn');
const finalMessage = document.getElementById('final-message');
const finalMessageText = document.getElementById('final-message-text');

// 1. Load chosen character image for avatar & mirror
const savedAvatar = localStorage.getItem('selectedAvatar');
if (savedAvatar) {
  playerAvatar.src = savedAvatar;
  if (mirrorImg) mirrorImg.src = savedAvatar;
}

let playerName = 'You';
let currentScene = document.getElementById('scene-neighbor-1');
let activeLines = currentScene.querySelectorAll('.dialogue-line');
let currentIndex = 0;

function showVisual(visualClass) {
  document.querySelectorAll('.top-left-img, .mid-right-img').forEach((img) => {
    img.classList.add('hidden');
  });
  if (visualClass) {
    document.querySelectorAll(`.${visualClass}`).forEach((img) => {
      img.classList.remove('hidden');
    });
  }
}

function showMemoryNotice(text) {
  if (!text) return;
  memoryToast.textContent = text;
  memoryToast.classList.remove('hidden');
  memoryToast.style.animation = 'none';
  memoryToast.offsetHeight;
  memoryToast.style.animation = '';
}

function updateSpeaker(lineElement) {
  if (!lineElement) return;
  const rawSpeaker = lineElement.getAttribute('data-speaker');
  if (!rawSpeaker) {
    speakerBadge.classList.add('hidden');
    return;
  }

  speakerBadge.classList.remove('hidden');
  if (rawSpeaker === '{{player}}') {
    speakerName.textContent = playerName;
    playerAvatar.classList.remove('hidden');
  } else {
    speakerName.textContent = rawSpeaker;
    playerAvatar.classList.add('hidden');
  }
}

function loadScene(sceneId) {
  const nextScene = document.getElementById(sceneId);
  if (!nextScene) return;

  currentScene.classList.add('hidden');
  currentScene = nextScene;
  currentScene.classList.remove('hidden');

  activeLines = currentScene.querySelectorAll('.dialogue-line');
  currentIndex = 0;

  activeLines.forEach((line, idx) => {
    line.classList.toggle('hidden', idx !== 0);
  });

  updateSpeaker(activeLines.item(0));
  checkEndOfScene();
}

function checkEndOfScene() {
  const currentLine = activeLines.item(currentIndex);
  const sceneChoices = currentScene.querySelector('.choice-container');

  // Trigger line-specific memory notice (Mirror realization)
  const lineMemory = currentLine.getAttribute('data-memory');
  if (lineMemory) {
    showMemoryNotice(lineMemory);
  }

  // Final Mirror Ending: Wait 10s, fade out, then show final message + home button
  if (currentLine.getAttribute('data-trigger-ending') === 'true') {
    nextBtn.classList.add('hidden');
    setTimeout(() => {
      gameStage.classList.add('fade-out');
      if (backHomeBtn) backHomeBtn.classList.add('fade-out');
      setTimeout(() => {
        gameStage.classList.add('hidden');
        if (backHomeBtn) backHomeBtn.classList.add('hidden');
        finalMessage.classList.remove('hidden');
      }, 2500);
    }, 10000);
    return;
  }

  if (currentIndex === activeLines.length - 1 && sceneChoices) {
    nextBtn.classList.add('hidden');
    sceneChoices.classList.remove('hidden');
  } else {
    nextBtn.classList.remove('hidden');
  }
}

// 2. Next Button Click Handler
nextBtn.addEventListener('click', () => {
  const currentLine = activeLines.item(currentIndex);

  if (currentLine.getAttribute('data-action') === 'closer-neighbor') {
    showVisual('visual-neighbor-close');
    nameModal.classList.remove('hidden');
    nameInput.focus();
    return;
  }

  const autoNextScene = currentLine.getAttribute('data-next-scene');
  if (autoNextScene) {
    const nextVisual = currentLine.getAttribute('data-visual');
    if (nextVisual) showVisual(nextVisual);
    loadScene(autoNextScene);
    return;
  }

  if (currentIndex < activeLines.length - 1) {
    currentLine.classList.add('hidden');
    currentIndex++;
    const nextLine = activeLines.item(currentIndex);
    nextLine.classList.remove('hidden');
    updateSpeaker(nextLine);
    checkEndOfScene();
  }
});

// 3. Player Name Submission + "Alek" Easter Egg
function confirmName() {
  const typed = nameInput.value.trim();

  if (typed.toLowerCase() === 'alek') {
    nameModal.classList.add('hidden');
    document.body.classList.add('screen-glitch');

    setTimeout(() => {
      document.body.classList.remove('screen-glitch');
      namePromptLabel.textContent = 'Now that is not your name, is it? Try again.';
      namePromptLabel.classList.add('easter-egg-text');
      nameInput.value = '';
      nameModal.classList.remove('hidden');
      nameInput.focus();
    }, 900);
    return;
  }

  if (typed !== '') playerName = typed;

  document.querySelectorAll('.dialogue-line').forEach((line) => {
    line.textContent = line.textContent.replaceAll('{{player}}', playerName);
  });
  if (finalMessageText) {
    finalMessageText.textContent = finalMessageText.textContent.replaceAll('{{player}}', playerName);
  }

  nameModal.classList.add('hidden');
  loadScene('scene-neighbor-2');
}

submitNameBtn.addEventListener('click', confirmName);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') confirmName();
});

// 4. All Choice Containers: Randomize button order + Glitch hover effect
document.querySelectorAll('.choice-container').forEach((container) => {
  const buttons = container.querySelectorAll('.choice-btn');

  // Safely move the first button after the second 50% of the time
  if (buttons.length === 2 && Math.random() < 0.5) {
    container.appendChild(buttons.item(0));
  }

  buttons.forEach((button) => {
    const originalText = button.textContent.trim();
    const glitchText = button.getAttribute('data-glitch-text');

    if (glitchText) {
      button.addEventListener('mouseenter', () => {
        button.classList.add('glitch-active');
        button.textContent = '#@%!&?';
        setTimeout(() => {
          if (button.matches(':hover')) {
            button.textContent = glitchText;
          }
        }, 120);
      });

      button.addEventListener('mouseleave', () => {
        button.classList.remove('glitch-active');
        button.textContent = originalText;
      });
    }

    button.addEventListener('click', () => {
      const visualClass = button.getAttribute('data-visual');
      const memoryText = button.getAttribute('data-memory');
      const nextSceneId = button.getAttribute('data-next-scene');

      if (visualClass) showVisual(visualClass);
      if (memoryText) showMemoryNotice(memoryText);
      if (nextSceneId) loadScene(nextSceneId);
    });
  });
});

// Initialize first line
updateSpeaker(activeLines.item(0));
checkEndOfScene();