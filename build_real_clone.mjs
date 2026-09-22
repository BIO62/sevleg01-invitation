import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');
const urlMap = JSON.parse(fs.readFileSync(path.join(baseDir, 'url_map.json'), 'utf8'));

let html = rawHtml;

console.log('Original rawHtml length:', html.length);

// 1. Replace mapped URLs (both standard and escaped forms)
const sortedUrls = Object.keys(urlMap).sort((a, b) => b.length - a.length);

for (const remoteUrl of sortedUrls) {
  const localRelPath = urlMap[remoteUrl];
  html = html.split(remoteUrl).join(localRelPath);

  const escapedRemote = remoteUrl.replace(/\//g, '\\/');
  const escapedLocal = localRelPath.replace(/\//g, '\\/');
  html = html.split(escapedRemote).join(escapedLocal);
}

// 2. Base domain fallbacks
html = html.split('https://sevleg01.zollame-studio.com/wp-content/uploads/sites/5/').join('assets/mirror/wp-content/uploads/sites/5/');
html = html.split('http://sevleg01.zollame-studio.com/wp-content/uploads/sites/5/').join('assets/mirror/wp-content/uploads/sites/5/');
html = html.split('https:\\/\\/sevleg01.zollame-studio.com\\/wp-content\\/uploads\\/sites\\/5\\/').join('assets\\/mirror\\/wp-content\\/uploads\\/sites\\/5\\/');
html = html.split('http:\\/\\/sevleg01.zollame-studio.com\\/wp-content\\/uploads\\/sites\\/5\\/').join('assets\\/mirror\\/wp-content\\/uploads\\/sites\\/5\\/');

html = html.split('https://sevleg01.zollame-studio.com/wp-content/plugins/').join('assets/mirror/wp-content/plugins/');
html = html.split('https:\\/\\/sevleg01.zollame-studio.com\\/wp-content\\/plugins\\/').join('assets\\/mirror\\/wp-content\\/plugins\\/');

html = html.split('https://sevleg01.zollame-studio.com/wp-includes/').join('assets/mirror/wp-includes/');
html = html.split('https:\\/\\/sevleg01.zollame-studio.com\\/wp-includes\\/').join('assets\\/mirror\\/wp-includes\\/');

html = html.split('https://sevleg01.zollame-studio.com/wp-admin/admin-ajax.php').join('#');
html = html.split('https:\\/\\/sevleg01.zollame-studio.com\\/wp-admin\\/admin-ajax.php').join('#');

// Audio URL in raw HTML
html = html.split('http://sevleg01.zollame-studio.com/wp-content/uploads/sites/5/2026/08/hurlee-Sevleg-urgeekh-duu-online-audio-converter.com_.mp3')
           .join('assets/mirror/wp-content/uploads/sites/5/2026/08/hurlee-Sevleg-urgeekh-duu-online-audio-converter.com_.mp3');

// 3. Text & Info replacements
// Names
html = html.split('Н. Оргилболдын').join('З. Азбаярын');
html = html.split('Н.Оргилболдын').join('З.Азбаярын');
html = html.split('Н. Оргилболд').join('З. Азбаяр');
html = html.split('Н.Оргилболд').join('З.Азбаяр');
html = html.split('Оргилболд').join('Азбаяр');

// Family
html = html.split('Б.Наранбаатарын гэр бүлээс').join('О.Золбоогийн гэр бүлээс');
html = html.split('Б. Наранбаатарын гэр бүлээс').join('О.Золбоогийн гэр бүлээс');

// Date & Time
html = html.split('2026.10.13').join('2026.09.26');
html = html.split('2026-10-13 11:00').join('2026-09-26 11:40');
html = html.split('2026-10-13').join('2026.09.26');
html = html.split('10 сарын 13-ны').join('09 сарын 26-ны');
html = html.split('10 сар').join('09 сар');
html = html.split('13-ны өдөр').join('26-ны өдөр');
html = html.split('13 өдөр').join('26 өдөр');

// Time
html = html.split('09:40-11.40').join('11:40 - 13:40');
html = html.split('09.40-11.40').join('11:40 - 13:40');
html = html.split('09:40 - 11:40').join('11:40 - 13:40');
html = html.split('15:00 цагт').join('11:40 цагт');

// Address
const fullAddress = 'Дэнжийн 1000 шинэчлэл хороолол Галданбошгот 801 байр 1 орцны 6 давхар 29тоот';
html = html.split('Sunny Kids Cafe').join(fullAddress);

// 4. Update Google Maps iframe to exact coordinates: 47.93653969259481, 106.90327728306592
const oldMapRegex = /<iframe[^>]*google\.com\/maps[^>]*><\/iframe>/i;
const newMapIframe = `<iframe loading="lazy" src="https://maps.google.com/maps?q=47.93653969259481,106.90327728306592&amp;t=m&amp;z=16&amp;output=embed&amp;iwloc=near" title="${fullAddress}" aria-label="${fullAddress}" style="border:0; width:100%; height:100%; min-height:350px; border-radius:16px;"></iframe>`;
html = html.replace(oldMapRegex, newMapIframe);

// 5. Update welcome modal button
html = html.replace(/<button\s+onclick=["']openInvitation\(\)["'][^>]*>/i, 
  `<button id="openModalBtn" onclick="window.openInvitation(); return false;" style="background: linear-gradient(135deg, #fbc02d 0%, #f57f17 100%) !important; color: #ffffff !important; border: none !important; padding: 14px 32px !important; font-size: 17px !important; font-weight: bold !important; border-radius: 50px !important; cursor: pointer !important; box-shadow: 0 6px 18px rgba(245, 127, 23, 0.4) !important; width: 100% !important; display: block !important;">`
);

// 5b. The scrape froze Elementor Pro's "stretch" geometry into the dropdown nav
// (style="width: 2190px; left: 0px; top: 35.5px"), which pins the mobile menu to a
// desktop-sized panel. Drop it so the runtime can recompute it per viewport.
html = html.replace(
  /(<nav class="elementor-nav-menu--dropdown elementor-nav-menu__container"[^>]*?)\s*style="[^"]*"/i,
  '$1'
);

// 6. Global openInvitation & Mobile Responsive CSS in <head>
const headScript = `
<script>
window.openInvitation = function() {
  var modal = document.getElementById('welcomeModal') || document.querySelector('[onclick*="openInvitation"]')?.closest('div[style*="position: fixed"]');
  if (modal) {
    modal.style.transition = 'opacity 0.6s ease';
    modal.style.opacity = '0';
    setTimeout(function() {
      modal.style.display = 'none';
    }, 600);
  }
  var audio = document.getElementById('invitationMusic');
  if (audio) {
    audio.play().catch(function(e) { console.log('Audio autoplay prevented:', e); });
  }
};
</script>
<style>
/* Ensure content is never stuck invisible by Elementor scroll hooks */
.elementor-invisible {
  visibility: visible !important;
  opacity: 1 !important;
}

/* Ensure the long address fits cleanly inside the 33% teal card on all devices */
.elementor-element-9b5fd53 .elementor-heading-title {
  font-size: clamp(9px, 1.1vw, 13px) !important;
  line-height: 1.35 !important;
  word-break: break-word !important;
}

/* Mobile View - Preserve authentic Elementor layout without breaking card grids */
@media (max-width: 767px) {
  html, body {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }
  #welcomeModal > div {
    max-width: 90vw !important;
    padding: 25px 20px !important;
  }
  /* On mobile the teal card is full width, so the address can be read at a normal size */
  .elementor-element-9b5fd53 .elementor-heading-title {
    font-size: 15px !important;
    line-height: 1.5 !important;
    padding: 0 6px !important;
  }
  /* Google maps mobile sizing */
  .elementor-widget-google_maps .elementor-custom-embed,
  .elementor-widget-google_maps iframe {
    height: 320px !important;
    min-height: 320px !important;
    width: 100% !important;
    border-radius: 16px !important;
  }
  /* Comfortable tap targets (Apple/Android guidance is 44px) */
  .elementor-menu-toggle {
    min-width: 44px !important;
    min-height: 44px !important;
  }
  .elementor-element-14cdd65f .elementor-button {
    min-height: 44px !important;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }
  .elementor-social-icon {
    width: 44px !important;
    height: 44px !important;
  }
}

/* The footer address falls back to Arial because Bubblegum Sans is a Google font
   that has no Cyrillic glyphs. Match the date block right above it instead. */
.elementor-element-53a26e3a .elementor-heading-title {
  font-family: "Mak Boyarsky", "Mak Davida", sans-serif !important;
  font-size: 18px !important;
  line-height: 1.6 !important;
}

/* Mobile dropdown menu: Elementor's own CSS already styles every state, it only
   needs the active class toggled and the stretch geometry recomputed (see JS). */
.elementor-nav-menu--dropdown.elementor-nav-menu__container {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.14);
}
.elementor-nav-menu--dropdown .elementor-item {
  min-height: 48px;
}
html {
  scroll-behavior: smooth;
}

/* Image Zoom on hover / touch for CTA cards */
.elementor-bg-transform-zoom-in .elementor-bg {
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) !important;
}
.elementor-bg-transform-zoom-in:hover .elementor-bg,
.elementor-bg-transform-zoom-in:active .elementor-bg,
.elementor-bg-transform-zoom-in.touch-zoomed .elementor-bg {
  transform: scale(1.18) !important;
}

/* Lightbox Modal Styles for Full-Screen Image Zoom */
#imageZoomLightbox {
  display: none;
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.92);
  z-index: 1000000;
  align-items: center;
  justify-content: center;
  touch-action: pinch-zoom;
}
#imageZoomLightbox img {
  max-width: 92vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.6);
  transition: transform 0.3s ease;
}
#imageZoomLightbox .close-btn {
  position: absolute;
  top: 20px;
  right: 25px;
  color: #fff;
  font-size: 36px;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
}
</style>
`;
html = html.replace('<head>', '<head>' + headScript);

// 7. Lightbox HTML + Animation & Touch Zoom script before </body>
const bodyBottomScript = `
<!-- Full-screen Image Zoom Lightbox Modal -->
<div id="imageZoomLightbox" onclick="this.style.display='none'">
  <span class="close-btn">&times;</span>
  <img id="imageZoomTarget" src="" alt="Томруулсан зураг" onclick="event.stopPropagation()">
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // 1. Swiper Hero Background initialization
  setTimeout(function() {
    var bgSwiperEl = document.querySelector('.elementor-background-slideshow');
    if (bgSwiperEl && window.Swiper) {
      if (!bgSwiperEl.swiper) {
        new Swiper(bgSwiperEl, {
          effect: 'fade',
          loop: true,
          autoplay: {
            delay: 4500,
            disableOnInteraction: false,
          },
          speed: 1000
        });
      }
    }
  }, 500);

  // 2. Mobile Touch Zoom & Full-screen Lightbox for all photos
  var lightbox = document.getElementById('imageZoomLightbox');
  var lightboxImg = document.getElementById('imageZoomTarget');

  function openZoom(src) {
    if (!src || !lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.style.display = 'flex';
  }

  // Bind click/tap to zoom on single images
  document.querySelectorAll('.elementor-widget-image img, .elementor-image img').forEach(function(img) {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function() {
      openZoom(img.src);
    });
  });

  // Bind touch/click to CTA gallery cards
  document.querySelectorAll('.elementor-cta').forEach(function(cta) {
    var bg = cta.querySelector('.elementor-cta__bg');
    cta.addEventListener('touchstart', function() {
      cta.classList.add('touch-zoomed');
    }, { passive: true });
    cta.addEventListener('touchend', function() {
      setTimeout(function() { cta.classList.remove('touch-zoomed'); }, 1500);
    }, { passive: true });

    // Click to open zoom
    cta.addEventListener('click', function(e) {
      if (bg) {
        var style = window.getComputedStyle(bg);
        var bgUrl = style.backgroundImage.slice(4, -1).replace(/["']/g, "");
        if (bgUrl && (bgUrl.startsWith('http') || bgUrl.includes('assets/'))) {
          openZoom(bgUrl);
        }
      }
    });
  });

  // 2b. Mobile burger menu. Elementor's stylesheet already covers every state
  // (icon swap, scaleY reveal, absolute stretch panel); its JS never runs in this
  // static clone, so we drive the active class and the stretch geometry ourselves.
  document.querySelectorAll('.elementor-widget-nav-menu').forEach(function(widget) {
    var toggle = widget.querySelector('.elementor-menu-toggle');
    var dropdown = widget.querySelector('.elementor-nav-menu--dropdown');
    if (!toggle || !dropdown) return;

    function stretch() {
      var anchor = dropdown.offsetParent || widget;
      var anchorRect = anchor.getBoundingClientRect();
      dropdown.style.width = document.documentElement.clientWidth + 'px';
      dropdown.style.left = -anchorRect.left + 'px';
      dropdown.style.top = (toggle.getBoundingClientRect().bottom - anchorRect.top) + 'px';
    }
    function isOpen() {
      return toggle.classList.contains('elementor-active');
    }
    function open() {
      stretch();
      toggle.classList.add('elementor-active');
      toggle.setAttribute('aria-expanded', 'true');
      dropdown.setAttribute('aria-hidden', 'false');
    }
    function close() {
      toggle.classList.remove('elementor-active');
      toggle.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      isOpen() ? close() : open();
    });
    toggle.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        isOpen() ? close() : open();
      }
    });

    // Tapping an item closes the panel and scrolls to the section.
    dropdown.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = link.getAttribute('href') || '';
        close();
        if (href.charAt(0) !== '#') return;
        e.preventDefault();
        var targetEl = href.length > 1 ? document.getElementById(href.slice(1)) : null;
        var y = targetEl ? targetEl.getBoundingClientRect().top + window.pageYOffset - 8 : 0;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });

    document.addEventListener('click', function(e) {
      if (isOpen() && !widget.contains(e.target)) close();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen()) close();
    });
    window.addEventListener('resize', function() {
      if (isOpen()) stretch();
    }, { passive: true });
  });

  // 3. Scroll animations observer / trigger
  function checkAnimations() {
    var invisibles = document.querySelectorAll('.elementor-invisible');
    var windowHeight = window.innerHeight;
    invisibles.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      if (rect.top <= windowHeight * 0.94) {
        var settings = el.getAttribute('data-settings');
        var animName = 'fadeInUp';
        if (settings) {
          try {
            var parsed = JSON.parse(settings);
            animName = parsed.animation || parsed._animation || 'fadeInUp';
          } catch(e) {}
        }
        el.classList.remove('elementor-invisible');
        el.classList.add('elementor-animated');
        el.classList.add(animName);
      }
    });
  }
  window.addEventListener('scroll', checkAnimations, { passive: true });
  window.addEventListener('resize', checkAnimations, { passive: true });
  setTimeout(checkAnimations, 300);
  setTimeout(checkAnimations, 800);
  setTimeout(checkAnimations, 1500);
});
</script>
`;

html = html.replace('</body>', bodyBottomScript + '\n</body>');

fs.writeFileSync(path.join(baseDir, 'index.html'), html, 'utf8');
console.log('Successfully wrote index.html! New length:', html.length);
