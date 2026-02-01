/**
 * syscry.com - Universal Infinite Scroll v2.1
 * Works on any page with scrollable content
 * Seamless looping in both directions
 */

(function() {
  'use strict';

  const InfiniteScroll = {
    container: null,
    wrapper: null,
    originalHTML: '',
    sectionHeight: 0,
    isInitialized: false,
    scrollThreshold: 200,
    debounceTimer: null,

    init: function() {
      // Find scroll container - works on any page
      this.container = document.getElementById('scroll-container') ||
                       document.querySelector('.scroll-container') ||
                       document.querySelector('.sys-project-content') ||
                       document.querySelector('.w-layout-layout');

      if (!this.container) return;

      // Store original content
      this.originalHTML = this.container.innerHTML;

      // Wait for content to load
      this.waitForImages().then(() => {
        this.setupScroll();
        this.isInitialized = true;
      });
    },

    waitForImages: function() {
      return new Promise((resolve) => {
        const images = this.container.querySelectorAll('img');
        let loaded = 0;
        const total = images.length;

        if (total === 0) {
          setTimeout(resolve, 100);
          return;
        }

        const checkDone = () => {
          loaded++;
          if (loaded >= total) resolve();
        };

        images.forEach(img => {
          if (img.complete) {
            checkDone();
          } else {
            img.addEventListener('load', checkDone);
            img.addEventListener('error', checkDone);
          }
        });

        // Fallback
        setTimeout(resolve, 5000);
      });
    },

    setupScroll: function() {
      // Measure content
      this.sectionHeight = this.container.scrollHeight;

      // Create wrapper for better control
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'infinite-scroll-wrapper';
      this.wrapper.style.cssText = 'position: relative;';

      // Clone content for seamless loop (before and after)
      const before = this.createSection('before');
      const middle = this.createSection('middle');
      const after = this.createSection('after');

      this.wrapper.appendChild(before);
      this.wrapper.appendChild(middle);
      this.wrapper.appendChild(after);

      // Replace container content
      this.container.innerHTML = '';
      this.container.appendChild(this.wrapper);

      // Set initial position to middle section
      requestAnimationFrame(() => {
        window.scrollTo(0, this.sectionHeight);
        this.bindEvents();
      });
    },

    createSection: function(id) {
      const section = document.createElement('div');
      section.className = 'infinite-scroll-section';
      section.dataset.section = id;
      section.innerHTML = this.originalHTML;
      return section;
    },

    bindEvents: function() {
      let ticking = false;

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // Recalculate on resize
      window.addEventListener('resize', () => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.recalculate();
        }, 200);
      }, { passive: true });
    },

    handleScroll: function() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;

      // Jump thresholds
      const jumpUp = this.sectionHeight * 0.3;
      const jumpDown = this.sectionHeight * 2 - viewportHeight * 0.3;

      if (scrollY < jumpUp) {
        // Near top - jump down by one section
        const newScroll = scrollY + this.sectionHeight;
        window.scrollTo(0, newScroll);
      } else if (scrollY > jumpDown) {
        // Near bottom - jump up by one section
        const newScroll = scrollY - this.sectionHeight;
        window.scrollTo(0, newScroll);
      }
    },

    recalculate: function() {
      const sections = this.wrapper.querySelectorAll('.infinite-scroll-section');
      if (sections.length > 0) {
        this.sectionHeight = sections[0].offsetHeight;
      }
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InfiniteScroll.init());
  } else {
    InfiniteScroll.init();
  }

  window.InfiniteScroll = InfiniteScroll;
})();
