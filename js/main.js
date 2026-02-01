/**
 * syscry.com - Main JavaScript
 * Original typewriter effects, hover animations, and timers
 */

// ============================================
// HOVER TEXT EFFECT (jQuery)
// ============================================

$(document).ready(function() {
  // Check if jQuery is loaded
  if (typeof $ === 'undefined') {
    console.error('jQuery is not loaded. Please ensure jQuery is loaded before this script.');
    return;
  }
  // Typewriter effect
  function typeWriter(element, text, i, interval, onComplete) {
    if (i <= text.length) {
      element.text(text.substring(0, i));
      setTimeout(function() {
        typeWriter(element, text, i + 1, interval, onComplete);
      }, interval);
    } else {
      if (onComplete) onComplete();
    }
  }
  // Function to handle hover effect
  function handleHover() {
    var el = $(this);
    var isAnimating = false;
    // On mouse enter
    el.mouseenter(function() {
      if (isAnimating) return;
      isAnimating = true;
      var hoverText = el.attr('data-hover-text');
      if (!el.attr('data-hover-original')) {
        el.attr('data-hover-original', el.text());
      }
      typeWriter(el, hoverText, 0, 20, function() {
        isAnimating = false;
      });
    });
    // On mouse leave
    el.mouseleave(function() {
      if (isAnimating) return;
      isAnimating = true;
      var originalText = el.attr('data-hover-original');
      typeWriter(el, originalText, 0, 20, function() {
        isAnimating = false;
      });
    });
  }
  // Apply the hover effect to all elements with 'data-hover-text'
  $('[data-hover-text]').each(function() {
    handleHover.call(this);
  });
});


// ============================================
// TYPEWRITER CLASS (for sys-typewriter attribute)
// ============================================

!function() {
  "use strict";
  class Typewriter {
    constructor(element, strings, period = 2000, cursor = "|", cursorColor = "black", writingTime = 200) {
      this.element = element;
      this.strings = strings;
      this.period = period;
      this.currentIndex = 0;
      this.text = "";
      this.textWrapper = document.createElement("span");
      this.element.appendChild(this.textWrapper);
      this.writingTime = writingTime;
      this.appendCursor(cursor, cursorColor);
      this.tick();
    }
    appendCursor(cursor, color = "black") {
      const cursorElement = document.createElement("span");
      cursorElement.classList.add(`blinking-cursor-${cursor}`);
      cursorElement.textContent = cursor;
      this.element.appendChild(cursorElement);
      addCursorStyle(cursor, color);
    }
    tick() {
      const currentString = this.strings[this.currentIndex];
      this.text = currentString.substring(0, this.text.length + 1);
      this.textWrapper.textContent = this.text;
      let delay = this.writingTime - 100 * Math.random();
      if (this.text.length < currentString.length) {
        setTimeout(() => { this.tick(); }, delay);
      } else {
        this.currentIndex++;
        if (this.currentIndex < this.strings.length) {
          setTimeout(() => { this.tick(); }, this.period);
        }
      }
    }
  }
  const addCursorStyle = (cursor, color) => {
    const style = `
      .blinking-cursor-${cursor} {
        color: ${color};
        animation: 1s blink step-end infinite;
      }
      @keyframes blink {
        from, to { color: transparent }
        50% { color: ${color} }
      }
    `;
    const styleElement = document.createElement("style");
    styleElement.textContent = style;
    document.head.appendChild(styleElement);
  };
  document.querySelectorAll("[sys-typewriter]").forEach((element) => {
    const strings = element.getAttribute("sys-typewriter").split("|").map(text => text.trim()) || [];
    if (!strings.length || strings[0] === "") {
      return void console.error("Please insert some texts separated by |");
    }
    strings.unshift(element.textContent);
    element.textContent = "";
    const period = parseInt(element.getAttribute("period"), 10) || 1000;
    const cursor = element.getAttribute("cursor") || "";
    const cursorColor = element.getAttribute("color") || "black";
    const writingTime = parseInt(element.getAttribute("writing"), 10) || 200;
    new Typewriter(element, strings, period, cursor, cursorColor, writingTime);
  });
}();


// ============================================
// MATRIX HOVER EFFECT FOR LOGO
// Fluid wave-like scramble animation on hover
// With initial letter-by-letter reveal on page load
// ============================================

(function() {
  'use strict';

  const LOGO_TEXT = '-sys(cry)';
  const CHARS = '01-sys(cry)_./|<>[]{}*@#$%&';
  const LETTER_DELAY = 300; // 0.3s per letter

  document.querySelectorAll('.typewriter.sys').forEach(element => {
    let animationFrame = null;
    let isHovering = false;
    let phase = 0;
    let initialAnimationComplete = false;

    const getTextElement = () => {
      return element.querySelector('span') || element;
    };

    // Initial page load animation - reveal each letter with scramble
    const initialReveal = () => {
      const textEl = getTextElement();
      textEl.textContent = '';
      let currentIndex = 0;

      const revealNextLetter = () => {
        if (currentIndex >= LOGO_TEXT.length) {
          initialAnimationComplete = true;
          return;
        }

        // Scramble effect before revealing the letter
        let scrambleCount = 0;
        const maxScrambles = 5;

        const scrambleThenReveal = () => {
          if (scrambleCount < maxScrambles) {
            // Show revealed letters + one random char
            let result = LOGO_TEXT.substring(0, currentIndex);
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
            textEl.textContent = result;
            scrambleCount++;
            setTimeout(scrambleThenReveal, 40);
          } else {
            // Reveal the actual letter
            currentIndex++;
            textEl.textContent = LOGO_TEXT.substring(0, currentIndex);
            setTimeout(revealNextLetter, LETTER_DELAY - 200);
          }
        };

        scrambleThenReveal();
      };

      revealNextLetter();
    };

    // Start initial animation
    initialReveal();

    const animate = () => {
      if (!isHovering) return;

      const textEl = getTextElement();
      let result = '';
      phase += 0.15;

      for (let i = 0; i < LOGO_TEXT.length; i++) {
        // Create wave effect - characters scramble in a wave pattern
        const wave = Math.sin(phase + i * 0.5);
        const scrambleChance = 0.3 + wave * 0.3;

        if (Math.random() < scrambleChance) {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else {
          result += LOGO_TEXT[i];
        }
      }

      textEl.textContent = result;
      animationFrame = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (isHovering || !initialAnimationComplete) return;
      isHovering = true;
      phase = 0;
      animate();
    };

    const stopAnimation = () => {
      isHovering = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }

      // Smooth reveal back to original
      const textEl = getTextElement();
      let currentText = textEl.textContent || '';
      let revealStep = 0;

      const reveal = () => {
        if (revealStep >= LOGO_TEXT.length) {
          textEl.textContent = LOGO_TEXT;
          return;
        }

        let result = '';
        for (let i = 0; i < LOGO_TEXT.length; i++) {
          if (i <= revealStep) {
            result += LOGO_TEXT[i];
          } else if (Math.random() > 0.5) {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          } else {
            result += currentText[i] || LOGO_TEXT[i];
          }
        }

        textEl.textContent = result;
        revealStep++;
        setTimeout(reveal, 30);
      };

      reveal();
    };

    // Use parent link for hover detection
    const parentLink = element.closest('a');
    if (parentLink) {
      parentLink.addEventListener('mouseenter', startAnimation);
      parentLink.addEventListener('mouseleave', stopAnimation);
    } else {
      element.addEventListener('mouseenter', startAnimation);
      element.addEventListener('mouseleave', stopAnimation);
    }
  });
})();


// ============================================
// LIVE TIMERS
// ============================================

// Set the start date from which we're counting
var startDate = new Date("Jan 28, 1989 00:00:00").getTime();
// Update the count every 1 millisecond
var x = setInterval(function() {
    // Get today's date and time
    var now = new Date().getTime();
    // Find the elapsed time since the start date
    var elapsed = now - startDate;
    // Time calculations for years, days, hours, minutes, seconds and milliseconds
    var years = Math.floor(elapsed / (1000 * 60 * 60 * 24 * 365));
    var days = Math.floor((elapsed % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24));
    var hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    var milliseconds = Math.floor((elapsed % 1000));
    // Format the result
    var formattedElapsedTime = years.toString().padStart(2, '0') + ":" +
                               days.toString().padStart(3, '0') + ":" +
                               hours.toString().padStart(2, '0') + ":" +
                               minutes.toString().padStart(2, '0') + ":" +
                               seconds.toString().padStart(2, '0') + ":" +
                               milliseconds.toString().padStart(3, '0');
    // Display the result in the element with id="after"
    document.getElementById("after").innerHTML = formattedElapsedTime;
}, 1);

// Set the date we're counting down to
var countDownDate = new Date("Jan 28, 2100 23:59:59").getTime();
// Update the count down every 1 millisecond
var y = setInterval(function() {
    // Get today's date and time
    var now = new Date().getTime();
    // Find the distance between now and the count down date
    var distance = countDownDate - now;
    // Time calculations for years, days, hours, minutes, seconds and milliseconds
    var years = Math.floor(distance / (1000 * 60 * 60 * 24 * 365));
    var days = Math.floor((distance % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    var milliseconds = Math.floor((distance % 1000));
    // Format the result
    var formattedCountdown = years.toString().padStart(2, '0') + ":" +
                             days.toString().padStart(3, '0') + ":" +
                             hours.toString().padStart(2, '0') + ":" +
                             minutes.toString().padStart(2, '0') + ":" +
                             seconds.toString().padStart(2, '0') + ":" +
                             milliseconds.toString().padStart(3, '0');
    // Display the result in the element with id="before"
    document.getElementById("before").innerHTML = formattedCountdown;
    // If the count down is finished, write some text
    if (distance < 0) {
        clearInterval(y);
        document.getElementById("before").innerHTML = "EXPIRED";
    }
}, 1);
