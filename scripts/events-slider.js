let culturalTarget = 0;
let culturalCurrent = 0;
let culturalEase = 0.075;

// Velocity-based settings
let velocity = 0; // current speed
let friction = 0.8; // how quickly the velocity slows
let velocityMultiplier = 0.2; // scales how much deltaY affects velocity
let mobileVelocityMultiplier = 0.15; // Slows down velocity for mobile

const culturalSlider = document.querySelector(".slider");
const culturalSliderWrapper = document.querySelector(".slider-wrapper");
let slides = Array.from(document.querySelectorAll(".slide"));
let singleSetWidth = 0;
let totalSlides = slides.length;

// Variables for touch events
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchDeltaX = 0;
let touchDeltaY = 0;
let isMobile = false;

function detectMobileDevice() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
  }
}

/* 1) Duplicate slides to create a seamless "double" set */
function duplicateSlides() {
  slides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    culturalSliderWrapper.appendChild(clone);
  });
}

/* 2) Measure the width of one full set of slides */
function measureSingleSetWidth() {
  singleSetWidth = 0;
  for (let i = 0; i < totalSlides; i++) {
    singleSetWidth += slides[i].offsetWidth;
  }
  // Add the gap between slides: (totalSlides - 1) gaps of 100px each
  singleSetWidth += (totalSlides - 1) * 100;
}

/* Simple LERP function for smooth transitions */
function culturalLerp(start, end, factor) {
  return start + (end - start) * factor;
}

/* 3) Scale each slide + add 3D depth */
function culturalUpdateScaleAndPosition() {
  const allSlides = document.querySelectorAll(".slide");
  allSlides.forEach((slide) => {
    const rect = slide.getBoundingClientRect();
    const centerPosition = (rect.left + rect.right) / 2;
    const distanceFromCenter = centerPosition - window.innerWidth / 2;

    // Basic scale logic (unchanged)
    let scale, offsetX;
    if (distanceFromCenter > 0) {
      scale = Math.min(1.75, 1 + distanceFromCenter / window.innerWidth);
      offsetX = (scale - 1) * 300;
    } else {
      scale = Math.max(0.5, 1 - Math.abs(distanceFromCenter) / window.innerWidth);
      offsetX = 0;
    }

    // ====== 3D Depth + optional rotation ======
    const zOffset = -0.1 * Math.abs(distanceFromCenter);
    const rotateY = 0.03 * distanceFromCenter;

    gsap.set(slide, {
      scale: scale,
      x: offsetX,
      z: zOffset,
      rotationY: rotateY,
      transformOrigin: "center center",
    });
  });
}

/* 4) Main animation loop */
function culturalUpdate() {
  // Dampen the velocity for a smoother "inertia" effect
  velocity *= friction;

  // Apply velocity to the target
  culturalTarget += velocity;

  // Smoothly move current towards target
  culturalCurrent = culturalLerp(culturalCurrent, culturalTarget, culturalEase);

  // Wrap-around logic
  if (culturalCurrent > singleSetWidth) {
    culturalCurrent -= singleSetWidth;
    culturalTarget -= singleSetWidth;
  } else if (culturalCurrent < 0) {
    culturalCurrent += singleSetWidth;
    culturalTarget += singleSetWidth;
  }

  // Position the slider
  gsap.set(culturalSliderWrapper, {
    x: -culturalCurrent,
  });

  // Update slides scale/position with 3D effect
  culturalUpdateScaleAndPosition();

  requestAnimationFrame(culturalUpdate);
}

/* 5) Event listeners */

// Recompute set width on resize
window.addEventListener("resize", () => {
  measureSingleSetWidth();
});

// Mouse wheel -> adjust velocity
window.addEventListener("wheel", (e) => {
  velocity += e.deltaY * velocityMultiplier;
});

// Touch events -> adjust velocity for mobile
window.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

window.addEventListener("touchmove", (e) => {
  touchEndX = e.touches[0].clientX;
  touchEndY = e.touches[0].clientY;

  // Calculate swipe delta (how much the user moved their finger)
  touchDeltaX = touchStartX - touchEndX;
  touchDeltaY = touchStartY - touchEndY;

  // Use a slower velocity on mobile for smoother scroll
  const multiplier = isMobile ? mobileVelocityMultiplier : velocityMultiplier;

  // Check if it's a horizontal or vertical swipe
  if (Math.abs(touchDeltaX) > Math.abs(touchDeltaY)) {
    // Horizontal swipe (adjust slider)
    velocity += touchDeltaX * multiplier;
  } else {
    // Vertical swipe (also adjust slider, or perform other logic)
    velocity += touchDeltaY * multiplier;
  }
});

window.addEventListener("touchend", () => {
  // Reset touch values after touch ends
  touchStartX = 0;
  touchStartY = 0;
  touchEndX = 0;
  touchEndY = 0;
  touchDeltaX = 0;
  touchDeltaY = 0;
});

/* 7) Initialize */
detectMobileDevice(); // Check if user is on mobile
duplicateSlides(); // Duplicate slides
slides = Array.from(document.querySelectorAll(".slide"));
measureSingleSetWidth(); // Measure the original set width

// Optionally set the total wrapper width
culturalSliderWrapper.style.width = 2 * singleSetWidth + 560 * 2 + "px";

// Start animation
culturalUpdate();
