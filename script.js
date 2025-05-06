// Globale konstanter og variabler
const DURATION = 300; // Animasjonsvarighet (ms)
const STAGGER = 50; // Forsinkelse mellom animasjoner (ms)
const ZOOM_FACTOR = 2.5; // Hvor mye bildet skal forstørres i linsen

// DOM-element referanser
const grid = document.getElementById("grid");
const colorFilters = document.getElementById("colorFilters");
const btns = {
  sneakers: document.getElementById("btnSneakers"),
  hoodies: document.getElementById("btnHoodies"),
  caps: document.getElementById("btnCaps"),
};
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const modalImg = document.getElementById("modalImg");
const modalClose = document.getElementById("modalClose");
const lens = document.getElementById("lens");
const zoomToggle = document.getElementById("zoomToggle");

let lensImg; // Referanse til <img>-elementet inne i linsen
let lensEnabled = false; // Status for om zoom er aktiv
let currentCat = "hoodies"; // Startkategori

// --- Fargekart for knapper ---
const darkColorHexMap = {
  blue: "#003366", // Mørkeblå
  red: "#8B0000", // Mørkerød (DarkRed)
  black: "#222222", // Mørk grå (nesten svart)
  turquoise: "#008080", // Mørk turkis (Teal)
  yellow: "#b48c1a", // Mørk gul/oker
  white: "#cccccc", // Lys grå (vanskelig å gjøre "mørk hvit")
  head: "#5d4037", // Brunaktig for "head"
  gray: "#555555", // Mørk grå
  pink: "#c2185b", // Mørk rosa/magenta
  bling: "#b8860b", // Mørk gull/bronse (DarkGoldenrod)
  default: "#444444", // Fallback mørk grå
};

// --- Funksjon for å generere fargeknapper (DENNE ER KORREKT) ---
function genColorButtons(cat) {
  colorFilters.innerHTML = ""; // Tøm gamle fargeknapper
  if (colorMap[cat]) {
    Object.keys(colorMap[cat]).forEach((col, index) => {
      const btn = document.createElement("button");

      // Sett bakgrunnsfarge basert på fargenavn
      const backgroundColor =
        darkColorHexMap[col.toLowerCase()] || darkColorHexMap.default;
      btn.style.backgroundColor = backgroundColor;

      // Sett en ARIA-label for tilgjengelighet (siden teksten er borte)
      btn.setAttribute(
        "aria-label",
        col.charAt(0).toUpperCase() + col.slice(1)
      );

      btn.onclick = () => {
        Array.from(colorFilters.children).forEach((cb) =>
          cb.classList.remove("active")
        );
        btn.classList.add("active");
        animateColor(cat, col);
      };

      if (index === 0) {
        btn.classList.add("active");
      }
      colorFilters.appendChild(btn);
    });
  }
}
// --- SLUTT PÅ KORREKT genColorButtons ---

// --- Modal Funksjoner ---
function openModal(src) {
  const cartIcon = document.getElementById("modalCartIcon");
  modalImg.src = src;
  lensEnabled = false;
  lens.style.display = "none";
  zoomToggle.textContent = "Enable Lens";
  modalImg.removeEventListener("mousemove", moveLens);
  // --- Logikk for å vise/skjule handlekurv-ikonet ---
  if (cartIcon) {
    // Sjekk at ikonet finnes
    // Sjekk om bildets kilde (src) IKKE inneholder 'xtra'
    if (!src.includes("xtra")) {
      cartIcon.style.display = "block"; // VIS ikonet for produktbilder
    } else {
      cartIcon.style.display = "none"; // SKJUL ikonet for xtra-bilder
    }
  }
  // ----------------------------------------------------
  modal.style.display = "flex";
  void modal.offsetWidth;
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
  modal.addEventListener(
    "transitionend",
    () => {
      if (!modal.classList.contains("show")) {
        modal.style.display = "none";
        modalImg.src = "";
        modalImg.removeEventListener("mousemove", moveLens);
        modalImg.removeEventListener("mouseenter", handleMouseEnter);
        modalImg.removeEventListener("mouseleave", handleMouseLeave);
      }
    },
    { once: true }
  );
}

modalClose.onclick = closeModal;
modal.onclick = (e) => {
  if (e.target === modal) {
    closeModal();
  }
};

// --- Zoom Lens Hjelpefunksjon ---
function hideLens() {
  lens.style.display = "none";
}

// --- Zoom Lens Oppsett og Event Handlers ---
function initLens() {
  if (!modalImg.complete || modalImg.naturalWidth === 0) {
    setTimeout(initLens, 150);
    return;
  }
  if (!lensImg) {
    lensImg = document.createElement("img");
    lens.appendChild(lensImg);
  }
  lensImg.src = modalImg.src;
  const imgRect = modalImg.getBoundingClientRect();
  lensImg.style.width = imgRect.width * ZOOM_FACTOR + "px";
  lensImg.style.height = imgRect.height * ZOOM_FACTOR + "px";
  modalImg.removeEventListener("mousemove", moveLens);
  modalImg.removeEventListener("mouseenter", handleMouseEnter);
  modalImg.removeEventListener("mouseleave", handleMouseLeave);
  modalImg.addEventListener("mouseenter", handleMouseEnter);
  modalImg.addEventListener("mouseleave", handleMouseLeave);
}

function handleMouseEnter(e) {
  if (lensEnabled) {
    lens.style.display = "block";
    moveLens(e);
  }
}

function handleMouseLeave() {
  hideLens();
}

function moveLens(e) {
  if (!lensEnabled) {
    return;
  }
  lens.style.display = "block";
  const imgRect = modalImg.getBoundingClientRect();
  const lensWidth = lens.offsetWidth;
  const lensHeight = lens.offsetHeight;
  if (imgRect.width === 0 || imgRect.height === 0) return;
  let x = e.clientX - imgRect.left;
  let y = e.clientY - imgRect.top;
  let lensX = x - lensWidth / 2;
  let lensY = y - lensHeight / 2;
  if (lensX < 0) lensX = 0;
  if (lensY < 0) lensY = 0;
  if (lensX > imgRect.width - lensWidth) lensX = imgRect.width - lensWidth;
  if (lensY > imgRect.height - lensHeight) lensY = imgRect.height - lensHeight;
  lens.style.left = lensX + "px";
  lens.style.top = lensY + "px";
  lensImg.style.left = -(x * ZOOM_FACTOR - lensWidth / 2) + "px";
  lensImg.style.top = -(y * ZOOM_FACTOR - lensHeight / 2) + "px";
}

zoomToggle.onclick = function (e) {
  e.stopPropagation();
  lensEnabled = !lensEnabled;
  zoomToggle.textContent = lensEnabled ? "Disable Lens" : "Enable Lens";
  if (lensEnabled) {
    modalImg.addEventListener("mousemove", moveLens);
    const imgRect = modalImg.getBoundingClientRect();
    const currentX = e.pageX || e.clientX + window.scrollX;
    const currentY = e.pageY || e.clientY + window.scrollY;
    const mouseIsOverImage =
      currentX >= imgRect.left + window.scrollX &&
      currentX <= imgRect.right + window.scrollX &&
      currentY >= imgRect.top + window.scrollY &&
      currentY <= imgRect.bottom + window.scrollY;
    if (mouseIsOverImage) {
      lens.style.display = "block";
    }
  } else {
    hideLens();
    modalImg.removeEventListener("mousemove", moveLens);
  }
};

modalImg.onload = () => {
  setTimeout(initLens, 50);
};
if (modalImg.complete && modalImg.naturalWidth > 0) {
  setTimeout(initLens, 50);
} else if (modalImg.complete && modalImg.naturalWidth === 0) {
  /* console.error */
}

// --- Grid og Filter Logikk ---
const colorMap = {
  sneakers: {
    blue: ["blueshoe1.jpg", "blueshoe2.jpg", "blueshoe3.jpg"],
    red: ["redshoe1.jpg", "redshoe2.jpg"],
    black: ["blashoe1.jpg", "blashoe2.jpg", "blashoe3.jpg"],
    turquoise: ["turshoe1.jpg", "turshoe2.jpg"],
  },
  hoodies: {
    blue: ["bluhood1.jpg", "bluhood2.jpg", "bluhood3.jpg"],
    yellow: ["yelhood1.jpg", "yelhood2.jpg"],
    white: ["whihood1.jpg", "whijack1.jpg"],
  },
  caps: {
    blue: ["blucap1.jpg", "bluecap2.jpg"],
    head: ["headcap1.jpg", "headcap2.jpg", "headbean1.jpg", "headbean2.jpg"],
    gray: ["graycap1.jpg"],
    pink: ["pinkcap1.jpg"],
    bling: ["blingcap1.jpg", "blingcap2.jpg"],
  },
};
const xtras = ["xtra1.jpg", "xtra2.jpg", "xtra3.jpg", "xtra4.jpg"];
const dirMap = ["left", "up", "up", "right", "left", "down", "down", "right"];

function setActiveButton(cat) {
  Object.values(btns).forEach((b) => b.classList.remove("active"));
  if (btns[cat]) {
    btns[cat].classList.add("active");
  }
}

// --- DENNE GAMLE genColorButtons ER NÅ SLETTET ---
/*
      function genColorButtons(cat) {
        // ... gammel kode her ...
      }
      */
// --- SLUTT PÅ SLETTET KODE ---

function render(arr) {
  grid.innerHTML = "";
  arr.forEach((f, i) => {
    const item = document.createElement("div");
    item.className = "item";
    item.dataset.dir = dirMap[i % dirMap.length];
    const img = document.createElement("img");
    const imagePath = `img/${f}`;
    img.src = imagePath;
    img.alt = f.split(".")[0];
    img.loading = "lazy";
    item.onclick = () => openModal(imagePath);
    item.appendChild(img);
    grid.appendChild(item);
  });
}

function animateUpdate(newArr) {
  const oldItems = Array.from(grid.children);
  oldItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add(`exit-${item.dataset.dir}`);
    }, index * STAGGER);
  });
  const totalExitTime = (oldItems.length - 1) * STAGGER + DURATION;
  setTimeout(() => {
    render(newArr);
    const newItems = Array.from(grid.children);
    newItems.forEach((item) => {
      item.classList.add(`enter-${item.dataset.dir}`);
      void item.offsetWidth;
    });
    newItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.remove(`enter-${item.dataset.dir}`);
      }, index * STAGGER);
    });
  }, totalExitTime);
}

function animateColor(cat, col) {
  const imgs = [...(colorMap[cat]?.[col] || [])];
  let extraIndex = 0;
  while (imgs.length < 8 && xtras.length > 0) {
    imgs.push(xtras[extraIndex % xtras.length]);
    extraIndex++;
  }
  animateUpdate(imgs);
}

// --- Start Intro Fade Out ---
function startIntroFade() {
  const introOverlay = document.getElementById("intro-overlay");
  if (introOverlay) {
    setTimeout(() => {
      introOverlay.classList.add("fade-out");
      setTimeout(() => {
        if (introOverlay.parentNode) {
          introOverlay.parentNode.removeChild(introOverlay);
        }
      }, 5000); // Match CSS duration
    }, 800); // Delay before fade starts
  }
}
// --- Slutt Intro Fade Out ---

// --- Oppsett ved innlasting ---
function initializeApp() {
  startIntroFade(); // Kaller fade-funksjonen

  // Sett opp klikkhandlere for hovedkategorier
  btns.sneakers.onclick = () => {
    if (currentCat !== "sneakers") {
      currentCat = "sneakers";
      setActiveButton("sneakers");
      genColorButtons("sneakers"); // Kaller nå den riktige funksjonen
      animateColor("sneakers", Object.keys(colorMap.sneakers)[0]);
    }
  };
  btns.hoodies.onclick = () => {
    if (currentCat !== "hoodies") {
      currentCat = "hoodies";
      setActiveButton("hoodies");
      genColorButtons("hoodies"); // Kaller nå den riktige funksjonen
      animateColor("hoodies", Object.keys(colorMap.hoodies)[0]);
    }
  };
  btns.caps.onclick = () => {
    if (currentCat !== "caps") {
      currentCat = "caps";
      setActiveButton("caps");
      genColorButtons("caps"); // Kaller nå den riktige funksjonen
      animateColor("caps", Object.keys(colorMap.caps)[0]);
    }
  };

  // Last inn startvisningen
  setActiveButton(currentCat);
  genColorButtons(currentCat); // Kaller nå den riktige funksjonen
  const initialColor = Object.keys(colorMap[currentCat])[0];
  const initialImgs = [...(colorMap[currentCat]?.[initialColor] || [])];
  let extraIndex = 0;
  while (initialImgs.length < 8 && xtras.length > 0) {
    initialImgs.push(xtras[extraIndex % xtras.length]);
    extraIndex++;
  }
  render(initialImgs);
  if (colorFilters.children.length > 0) {
    colorFilters.children[0].classList.add("active");
  }
}
// --- SLUTT PÅ initializeApp ---

// Kjør initialisering når DOM er klar
document.addEventListener("DOMContentLoaded", initializeApp);
