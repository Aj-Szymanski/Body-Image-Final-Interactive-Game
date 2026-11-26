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
// Body Image Bar Elements & State
const bodyImageHud = document.getElementById('body-image-hud');
const bodyImageFill = document.getElementById('body-image-fill');
const bodyImageValue = document.getElementById('body-image-value');
let bodyImageLevel = 100;

function updateBodyImageBar(amountChange, isCrash = false) {
  bodyImageLevel = Math.max(0, Math.min(100, bodyImageLevel + amountChange));

  if (bodyImageFill) {
    bodyImageFill.style.width = `${bodyImageLevel}%`;
    if (bodyImageLevel <= 50) {
      bodyImageFill.classList.add('low');
    }
  }
  if (bodyImageValue) {
    bodyImageValue.textContent = `${bodyImageLevel}%`;
  }
  if (isCrash && bodyImageHud) {
    bodyImageHud.classList.add('hud-critical');
  }
}
// Main Story Elements
const gameStage = document.getElementById('game-stage');
const speakerBadge = document.getElementById('speaker-badge');
const speakerName = document.getElementById('speaker-name');
const playerAvatar = document.getElementById('player-avatar');
const mirrorImg = document.getElementById('mirror-reflection-img');
const strangerImg = document.getElementById('stranger-img');
const nextBtn = document.getElementById('next-btn');
const memoryToast = document.getElementById('memory-toast');

const nameModal = document.getElementById('name-modal');
const namePromptLabel = document.getElementById('name-prompt-label');
const nameInput = document.getElementById('player-name-input');
const submitNameBtn = document.getElementById('submit-name-btn');
const finalMessage = document.getElementById('final-message');
const finalMessageText = document.getElementById('final-message-text');


// 1. Load the chosen character's specific Avatar, Stranger, and Mirror images
const savedAvatar = localStorage.getItem('selectedAvatar');
const savedStranger = localStorage.getItem('selectedStranger');
const savedMirror = localStorage.getItem('selectedMirror');

if (savedAvatar && savedAvatar !== 'null' && playerAvatar) {
  playerAvatar.src = savedAvatar;
}
if (savedStranger && savedStranger !== 'null' && strangerImg) {
  strangerImg.src = savedStranger;
}
if (savedMirror && savedMirror !== 'null' && mirrorImg) {
  mirrorImg.src = savedMirror;
}
let playerName = 'You';
let currentScene = document.getElementById('scene-neighbor-1');
let activeLines = currentScene.querySelectorAll('.dialogue-line');
let currentIndex = 0;

function showVisual(visualClass) {
  document.querySelectorAll('.top-left-img, .mid-right-img').forEach((img) => {
    // Smoothly fade out visual-stranger instead of leaving it behind the smaller mirror
    if (visualClass === 'visual-mirror' && img.classList.contains('visual-stranger')) {
      img.classList.add('stranger-fade-out');
      setTimeout(() => {
        img.classList.add('hidden');
        img.classList.remove('stranger-fade-out');
      }, 2500);
      return;
    }

    img.classList.remove('stranger-fade-out');
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

  if (currentLine.getAttribute('data-trigger-ending') === 'true') {
    nextBtn.classList.add('hidden');

    setTimeout(() => {
      updateBodyImageBar(-100, true); // Drops remaining bar to 0%
      document.body.classList.add('red-glitch-crash');

      setTimeout(() => {
        document.body.classList.remove('red-glitch-crash');
        gameStage.classList.add('fade-out');
        if (backHomeBtn) backHomeBtn.classList.add('fade-out');
        if (bodyImageHud) bodyImageHud.classList.add('fade-out');

        setTimeout(() => {
          gameStage.classList.add('hidden');
          if (backHomeBtn) backHomeBtn.classList.add('hidden');
          if (bodyImageHud) bodyImageHud.classList.add('hidden');
          finalMessage.classList.remove('hidden');
        }, 1500);
      }, 1800);
    }, 2500);
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
     // Triggers the mirror cross-fade when "You step forward..." appears
     const lineVisual = nextLine.getAttribute('data-visual');
     if (lineVisual) showVisual(lineVisual);
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
// 3.5 Load Dialogue & Choice Options Based on Selected Character
const storyThemes = {
  appearance: {
    nReply: "Nice to meet you, {{player}}! Sorry I look a bit messy from unpacking.",
    nThought: "Look at how... exposed they look... I know its hot out but is that really what they should be wearing?",
    nBtn1Normal: "Oh don't worry about that! You're doing heavy work! You look great anyhow!",
    nBtn1Glitch: "I know its hot but you should still cover up. People might see you",
    nBtn2: "I could never be outside dressed like that and getting all sweaty.",
    nGlitchReply:"Oh... I didn't even think of that. Well, sorry to bother you, {{player}}, have a good day...",
    nRudeReply:"I didn't ask for your opinion, {{player}}. I'll just go inside.",

    fOpening: "Hey {{player}}! It's so good to see you! What do you think of my new pants?",
    fThought: "It's been a bit since I've seen MopBoby.... but what would people think of those pants",
    fBtn1Normal: "It's so good to see you! They look so cool! That's your vibe exactly!",
    fBtn1Glitch: "Where the heck did you get those? The swamp?",
    fBtn2: "It's so good to see you! They look cool! Although I don't it's flatering for your... shape",
    nGlitchReply:"Oh...wow... okay... why would you...never mind then, {{player}}. I'll see you around..",
    nRudeReply:"Oh umm... I didn't think so... is it really that bad? I'll grab something from your closet then, thanks for telling me {{player}}..",

    mThought: "Look at every flaw on their face and posture...",
    mBtn1: '"They look completely unkempt and unattractive."',
    mBtn2: '"Honestly, I wouldn\'t want to be seen looking like that."',
    ending: "The way we scrutinize others often echoes how harshly we judge ourselves, {{player}}. You wouldn't say this to others, so why would you say it to yourself?",
    
  },
  worth: {
    nReply: "Welcome to the neighborhood, {{player}}! I'm still settling in.",
    nThought: "Nobody respects someone who doesn't look put-together.",
    nBtn1Normal: "Welcome to the neighborhood!",
    nBtn1Glitch: "People only respect neighbors who actually look attractive.",
    nBtn2: "You won't make many friends here looking that unpolished.",
    nGlitchReply: "What a strange thing to say, {{player}}... I didn't realize looks were a requirement to live here.",
    nRudeReply: "If that's how you measure people, {{player}}, I'm fine keeping to myself.",

    fOpening: "Hey {{player}}! It's always great hanging out with you!",
    fThought: "Why would anyone want to be seen next to someone shaped like that?",
    fBtn1Normal: "It's great hanging out with you too!",
    fBtn1Glitch: "Honestly, you're lucky anyone talks to you when you look like that.",
    fBtn2: "Nobody takes someone seriously if they don't fit the ideal body shape.",
    fGlitchReply: "Out of pity...? I hang out with you because I care about you, {{player}}. That really hurt.",
    fRudeReply: "I can't believe you think that way, {{player}}. I'm going to head home.",

    mThought: "Look at their shape... nobody would ever choose someone who looks like that.",
    mBtn1: '"Why would anyone care about someone shaped like that?"',
    mBtn2: '"They haven\'t earned the right to be liked looking like that."',
    ending: "Your worth was never measured by your body shape or reflection, {{player}}."
  },

  rejection: {
    nReply: "Nice to meet you, {{player}}! Sorry I'm a bit distracted—I'm trying to figure out where all these boxes go.",
    nThought: "Did you see how quickly their eyes scanned me? They're already judging how I look.",
    nBtn1Normal: "It's great to meet you!",
    nBtn1Glitch: "Don't pretend you want to talk to someone who looks like me.",
    nBtn2: "Save the fake politeness—I know you're already judging how I look.",
    nGlitchReply: "Wait—I wasn't judging you at all, {{player}}! I was just looking for my keys...",
    nRudeReply: "I wasn't being fake, {{player}}, I was genuinely trying to say hi. I'll leave you alone.",

    fOpening: "Hey {{player}}! It's good to see you—how has your week been?",
    fThought: "Why are they staring like that? They probably don't even want to be seen standing next to me.",
    fBtn1Normal: "I'm really glad we ran into each other!",
    fBtn1Glitch: "You don't have to hang out with me out of pity.",
    fBtn2: "Just go—I can tell you're embarrassed to be seen with me.",
    fGlitchReply: "Pity? {{player}}, you're my friend—why would you think I don't want to be around you?",
    fRudeReply: "I'm not embarrassed of you at all, {{player}}... it hurts that you'd push me away like that.",

    mThought: "Look at the way they're staring back... I can already tell they're disgusted.",
    mBtn1: '"Why are they looking at me like I don\'t belong here?"',
    mBtn2: '"Nobody would ever choose someone who looks like that."',
    ending: "The rejection you feared from everyone else was coming from inside your own head, {{player}}. You deserve connection without needing to look 'perfect' first."
  }
};

const chosenThemeKey = localStorage.getItem('selectedTheme') || 'appearance';
const t = storyThemes[chosenThemeKey] || storyThemes.appearance;

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text) el.innerHTML = text;
}

// Round 1 (Neighbor)
setText('n-reply', t.nReply);
setText('n-thought', t.nThought);
setText('n-glitch-reply', t.nGlitchReply);
setText('n-rude-reply', t.nRudeReply);

// Round 2 (Friend)
setText('f-opening', t.fOpening);
setText('f-thought', t.fThought);
setText('f-glitch-reply', t.fGlitchReply);
setText('f-rude-reply', t.fRudeReply);

// Round 3 (Mirror) & Ending
setText('m-thought', t.mThought);
setText('final-message-text', t.ending);

const nBtns = document.querySelectorAll('#scene-neighbor-2 .choice-btn');
if (nBtns.length === 2) {
  nBtns.item(0).textContent = t.nBtn1Normal;
  nBtns.item(0).setAttribute('data-glitch-text', t.nBtn1Glitch);
  nBtns.item(1).textContent = t.nBtn2;
}

const fBtns = document.querySelectorAll('#scene-friend .choice-btn');
if (fBtns.length === 2) {
  fBtns.item(0).textContent = t.fBtn1Normal;
  fBtns.item(0).setAttribute('data-glitch-text', t.fBtn1Glitch);
  fBtns.item(1).textContent = t.fBtn2;
}

const mBtns = document.querySelectorAll('#scene-mirror .choice-btn');
if (mBtns.length === 2) {
  mBtns.item(0).textContent = t.mBtn1;
  mBtns.item(1).textContent = t.mBtn2;
}
// 4. All Choice Containers: Randomize button order + Glitch hover + Print player choice
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
      updateBodyImageBar(-25);
      
      const visualClass = button.getAttribute('data-visual');
      const memoryText = button.getAttribute('data-memory');
      const nextSceneId = button.getAttribute('data-next-scene');
      const chosenText = button.textContent.trim();

      if (nextSceneId) {
        const targetScene = document.getElementById(nextSceneId);

        // Remove any previous injected line
        const oldInjected = targetScene.querySelector('.injected-player-line');
        if (oldInjected) oldInjected.remove();

        // Create and insert the player's chosen dialogue line with their avatar & name tag
        const playerLine = document.createElement('p');
        playerLine.className = 'dialogue-line injected-player-line';
        playerLine.setAttribute('data-speaker', '{{player}}');
        playerLine.textContent = chosenText;

        targetScene.prepend(playerLine);
      }

      if (visualClass) showVisual(visualClass);
      if (memoryText) showMemoryNotice(memoryText);
      if (nextSceneId) loadScene(nextSceneId);
    });
  });
});

// Initialize first line
updateSpeaker(activeLines.item(0));
checkEndOfScene();