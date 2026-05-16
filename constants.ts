import { ExternalLibrary, EditorFiles, CodeBlock } from './types';

const INITIAL_HTML = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aether IDE</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script>
    // Injected Data Studio Configuration
    window.DB_DATA = {
      system_status: "NOMINAL",
      connected_nodes: 12,
      throughput: "450 MB/s",
      encryption: "AES-256"
    };
  </script>
</head>

<body>
  <div class="container">
    <h1>Welcome to Aether IDE</h1>
    <div class="intro"><h4>Start editing or ask the AI to build something!</h4></div>
    <div class="card">
      <div class="glow"></div>
      <p>Hover me</p>
    </div>
    <button id="actionBtn">Click Me</button>

    <div id="data-display" class="hidden mt-4 p-4 bg-gray-800 rounded">
      <h3>Live Data Stream</h3>
      <pre id="json-output">Waiting for DB connection...</pre>
    </div>
  </div>
  <script src="script.js" defer></script>
</body>
</html>`;

const INITIAL_CSS = `body {
  font-family: 'Inter', sans-serif;
  background: #111;
  color: rgb(254, 246, 188);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.intro {
  color: rgb(57, 214, 70);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2 rem;
}

.container {
  text-align: center;
}

h1 {
  background: linear-gradient(to right, #899eaf 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.card {
  position: relative;
  width: 200px;
  height: 100px;
  margin: 20px auto;
  background: #222;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border: 1px solid #333;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%, rgba(79, 172, 254, 0.4), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .glow {
  opacity: 1;
}

button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #4facfe;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: transform 0.1s;
}

button:active {
  transform: scale(0.95);
}

.hidden { display: none; }

/* Utility Classes Polyfill */
.mt-4 {
  margin-top: 1rem;
}

.p-4 {
  padding: 1rem;
}

.bg-gray-800 {
  background-color: #1f2937;
}

.rounded {
  border-radius: 6px;
}`;

const INITIAL_JS = `/**
 * Aether IDE - Interaction Logic
 * Refactored for Robustness and State Management
 */

(function initScript() {
  const actionBtn = document.getElementById('actionBtn');
  let resetTimer = null;

  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      console.log('Button clicked!');
      const card = document.querySelector('.card');

      // Safety Check: Ensure card exists before manipulation
      if (!card) {
        console.warn('DOM Element .card not found.');
        return;
      }

      // Debounce Logic: Clear pending reset to prevent animation jitter
      if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
      }

      // Apply Transform
      requestAnimationFrame(() => {
        card.style.transform = 'rotate(5deg)';
      });

      // Schedule Reset
      resetTimer = setTimeout(() => {
        requestAnimationFrame(() => {
          card.style.transform = 'rotate(0deg)';
        });
        resetTimer = null;
      }, 200);
    });
  } else {
    console.warn('Initialization: #actionBtn not found in DOM.');
  }

  // Check for injected data from Data Studio
  if (window.DB_DATA) {
    console.log("Data Source Connected:", window.DB_DATA);
    const display = document.getElementById('data-display');
    const output = document.getElementById('json-output');
    
    if (display && output) {
      display.classList.remove('hidden');
      output.textContent = JSON.stringify(window.DB_DATA, null, 2);
    }
  }

  console.log('System ready.');
})();`;

export const DEFAULT_FILES: EditorFiles = {
  html: INITIAL_HTML,
  css: INITIAL_CSS,
  js: INITIAL_JS
};

export const CAPABILITIES: { title: string; description: string; type: 'feature' | 'data' | 'service'; content: string; filename: string; blockType: string }[] = [
    {
        title: 'Add User Persistence',
        description: 'Automatically save your app data to the user\'s device so it stays when they come back.',
        type: 'data',
        filename: 'persistence.js',
        blockType: 'js',
        content: `// Secure Persistence Module
const Persistence = {
    save: (key, data) => {
        try {
            localStorage.setItem(\`aether_storage_\${key}\`, JSON.stringify(data));
        } catch (e) {
            console.error("Storage failed", e);
        }
    },
    load: (key) => {
        const data = localStorage.getItem(\`aether_storage_\${key}\`);
        return data ? JSON.parse(data) : null;
    }
};
export default Persistence;`
    },
    {
        title: 'Add Google Maps Canvas',
        description: 'Inject a high-fidelity map interface for location-based visualization.',
        type: 'feature',
        filename: 'map-view.js',
        blockType: 'js',
        content: `// Map Interface Scaffold
const MapView = {
    init: (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div style="background:#222; width:100%; height:100%; display:flex; align-items:center; justify-center; color:#555">Map Interface Active</div>';
    }
};`
    },
    {
        title: 'Add Charts & Data Visualization',
        description: 'Beautiful, responsive charts using D3.js and Recharts patterns.',
        type: 'data',
        filename: 'charts.js',
        blockType: 'js',
        content: `// Responsive Chart Scaffold
const Charts = {
    renderBarChart: (container, data) => {
        console.log("Rendering charts with data:", data);
        // Scaffolding for d3/recharts...
    }
};`
    }
];

export const DEFAULT_BLOCKS_CODEBASE: CodeBlock[] = [
  { id: 'b1', type: 'html', title: 'index.html', content: INITIAL_HTML, isMaximized: false, isVisible: true },
  { id: 'b2', type: 'css', title: 'style.css', content: INITIAL_CSS, isMaximized: false, isVisible: true },
  { id: 'b3', type: 'js', title: 'script.js', content: INITIAL_JS, isMaximized: false, isVisible: true },
  { id: 'b4', type: 'js', title: 'utils.js', content: `// Helper functions layer
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};`, isMaximized: false, isVisible: true },
  { id: 'b5', type: 'json', title: 'config.json', content: `{\n  "theme": "dark",\n  "version": "1.0.0"\n}`, isMaximized: false, isVisible: true }
];

export const POPULAR_LIBRARIES: ExternalLibrary[] = [
  { name: 'Tailwind CSS', url: 'https://cdn.tailwindcss.com', type: 'script' },
  { name: 'Bootstrap 5 CSS', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', type: 'style' },
  { name: 'Bootstrap 5 JS', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js', type: 'script' },
  { name: 'React', url: 'https://unpkg.com/react@18/umd/react.development.js', type: 'script' },
  { name: 'React DOM', url: 'https://unpkg.com/react-dom@18/umd/react-dom.development.js', type: 'script' },
  { name: 'Vue 3', url: 'https://unpkg.com/vue@3/dist/vue.global.js', type: 'script' },
  { name: 'Three.js', url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', type: 'script' },
  { name: 'jQuery', url: 'https://code.jquery.com/jquery-3.6.0.min.js', type: 'script' },
  { name: 'FontAwesome', url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', type: 'style' },
  { name: 'GSAP', url: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js', type: 'script' },
];