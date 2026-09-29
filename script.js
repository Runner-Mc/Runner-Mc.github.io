// Tab switching for the projects section.
// Handles the active tab state, panel visibility, and the fade/slide
// transition between panels.

(function () {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  const indicator = document.querySelector('.tab-indicator');
  const tabBar = document.querySelector('.projects__tabs');

  function moveIndicatorTo(tab) {
    if (!indicator || !tabBar) return;
    const barLeft = tabBar.getBoundingClientRect().left;
    const tabRect = tab.getBoundingClientRect();
    const offset = tabRect.left - barLeft;

    indicator.style.width = `${tabRect.width}px`;
    indicator.style.transform = `translateX(${offset}px)`;
  }

  function activatePanel(targetId) {
    const targetPanel = document.getElementById(`panel-${targetId}`);
    const currentPanel = document.querySelector('.panel.is-active');

    if (!targetPanel || targetPanel === currentPanel) return;

    // fade the current panel out, then swap
    if (currentPanel) {
      currentPanel.classList.remove('is-visible');
      currentPanel.addEventListener('transitionend', function handler() {
        currentPanel.classList.remove('is-active');
        currentPanel.hidden = true;
        currentPanel.removeEventListener('transitionend', handler);
      }, { once: true });
    }

    targetPanel.hidden = false;
    targetPanel.classList.add('is-active');

    // next frame, trigger the fade/slide in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        targetPanel.classList.add('is-visible');
      });
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      moveIndicatorTo(tab);
      activatePanel(tab.dataset.tab);
    });
  });

  // show the initial active panel on load, and place the indicator
  const initialPanel = document.querySelector('.panel.is-active');
  if (initialPanel) {
    initialPanel.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initialPanel.classList.add('is-visible');
      });
    });
  }

  const initialTab = document.querySelector('.tab.is-active');
  if (initialTab) {
    // set instantly on load (no slide-in from nowhere)
    indicator.style.transition = 'none';
    moveIndicatorTo(initialTab);
    requestAnimationFrame(() => {
      indicator.style.transition = '';
    });
  }

  // keep the indicator aligned if the window resizes (font reflow etc.)
  window.addEventListener('resize', () => {
    const activeTab = document.querySelector('.tab.is-active');
    if (activeTab) moveIndicatorTo(activeTab);
  });


  //Handles the mouse trail
  document.addEventListener("mousemove", (event) => {

    // Prevent multiple particle systems from being created
    if (document.getElementById("cursor-pixel")) {
       return; 
    }

    // Create canvas (efficient particle drawing)
    const canvas = document.createElement("canvas");
    canvas.id = "cursor-pixel";
    document.body.appendChild(canvas);

    //Canvas rendering context (references the current screen)
    const ctx = canvas.getContext("2d");

    let width;
    let height;

    // Keep the number of particles under control
    const MAX_PARTICLES = 250;

    const particles = [];

    let mouseX = 0;
    let mouseY = 0;
    let mouseMoving = false;

    // Resize canvas to match the window
    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track cursor
    document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        mouseMoving = true;
    });

    // Create a particle
    function spawnParticle() {

        if (particles.length >= MAX_PARTICLES) {
            return;
        }

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 10;

        particles.push({
            x: mouseX + 10 + Math.cos(angle) * distance,
            y: mouseY + Math.sin(angle) * distance,

            // Small random movement
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,

            // Random size
            size: 1 + Math.random() * 3,

            // Particle lifetime
            life: 0,
            maxLife: 15 + Math.random() * 10
        });
    }

    // Animation loop
    function animate() {

        ctx.clearRect(0, 0, width, height);

        // Spawn a few particles while the mouse is moving
        if (mouseMoving) {

            const amount = 4 + Math.floor(Math.random() * 5);

            for (let i = 0; i < amount; i++) {
                spawnParticle();
            }

            mouseMoving = false;
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {

            const particle = particles[i];

            particle.x += particle.vx;
            particle.y += particle.vy;

            particle.life++;

            // Fade out over lifetime
            const opacity = 1 - particle.life / particle.maxLife;

            ctx.globalAlpha = opacity;

            ctx.fillStyle = "#21ff33";

            ctx.fillRect(
                particle.x,
                particle.y,
                particle.size,
                particle.size
            );

            // Remove dead particles
            if (particle.life >= particle.maxLife) {
                particles.splice(i, 1);
            }
        }

        ctx.globalAlpha = 1;

        requestAnimationFrame(animate);
    }

    animate();

  });
  
})();