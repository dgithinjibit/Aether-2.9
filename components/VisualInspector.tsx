import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pen, MousePointer2, Square, ArrowRight, X, Check, Trash2, Crosshair, Type } from 'lucide-react';
import html2canvas from 'html2canvas';

interface VisualInspectorProps {
  isActive: boolean;
  onClose: () => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  onCapture: (imageData: string, context?: string) => void;
}

type Tool = 'cursor' | 'pen' | 'rect' | 'arrow';

const VisualInspector: React.FC<VisualInspectorProps> = ({ isActive, onClose, iframeRef, onCapture }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Tools state
  const [tool, setTool] = useState<Tool>('cursor');
  const [color, setColor] = useState('#ef4444');
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  
  // DOM Inspection state
  const [hoveredElementInfo, setHoveredElementInfo] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  // 1. Setup Canvas with High DPI Support
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Set visible style size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Scale all drawing operations by the dpr, so you don't have to worry about it in your draw logic
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
    }
  }, []);

  // Initialize and handle resize
  useEffect(() => {
    if (!isActive) return;
    
    // Initial setup
    // Use setTimeout to allow layout to settle (e.g. if sidebar creates transition)
    const timer = setTimeout(setupCanvas, 50);

    const handleResize = () => {
       window.requestAnimationFrame(setupCanvas);
    };

    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timer);
    };
  }, [isActive, setupCanvas]);


  // 2. Helper: Coordinates
  const getCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // 3. Drawing Logic
  const startDrawing = (e: React.MouseEvent) => {
    if (tool === 'cursor') return;
    
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    setStartPos({ x, y });

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        // Save state before shape drag
        setSnapshot(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent) => {
    const { x, y } = getCoords(e);

    // -- Mode: DOM Inspector (Cursor) --
    if (tool === 'cursor') {
        handleDOMInspection(x, y);
        return;
    }

    // -- Mode: Drawing --
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !snapshot) return;

    if (tool === 'pen') {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else {
        // Restore original image to avoid "trails" when dragging shapes
        ctx.putImageData(snapshot, 0, 0);
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;

        if (tool === 'rect') {
            ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
        } else if (tool === 'arrow') {
            drawArrow(ctx, startPos.x, startPos.y, x, y);
        }
    }
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headlen = 15; // length of head in pixels
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // 4. DOM Inspector Logic
  const handleDOMInspection = (x: number, y: number) => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;
    
    const doc = iframeRef.current.contentDocument;
    // Hide overlay temporarily to click-through? 
    // Actually, elementFromPoint works on the iframe document coordinates directly
    // provided we match the overlay coordinates. 
    
    // Since overlay is 1:1 with iframe viewport, x/y should match.
    const el = doc.elementFromPoint(x, y);
    
    if (el && el !== doc.body && el !== doc.documentElement) {
        const tagName = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const classes = el.className && typeof el.className === 'string' ? `.${el.className.split(' ').join('.')}` : '';
        setHoveredElementInfo(`${tagName}${id}${classes}`);
    } else {
        setHoveredElementInfo(null);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
      if (tool !== 'cursor') return;
      
      // Select the element
      if (hoveredElementInfo) {
         setSelectedElements(prev => [...prev, hoveredElementInfo]);
         
         // Draw a permanent box around it?
         // For now, let's just draw a marker on the canvas so the user knows it's selected
         const ctx = canvasRef.current?.getContext('2d');
         const { x, y } = getCoords(e);
         
         if (ctx) {
             ctx.strokeStyle = '#3b82f6'; // Blue for selection
             ctx.lineWidth = 2;
             ctx.setLineDash([5, 5]);
             // Approximate a box or just a crosshair
             const size = 20;
             ctx.beginPath();
             ctx.moveTo(x - size, y);
             ctx.lineTo(x + size, y);
             ctx.moveTo(x, y - size);
             ctx.lineTo(x, y + size);
             ctx.stroke();
             ctx.setLineDash([]); // Reset
         }
      }
  };

  // 5. Capture Logic
  const handleCapture = async () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument || !canvasRef.current) return;

    try {
        const iframeBody = iframeRef.current.contentDocument.body;
        const overlayCanvas = canvasRef.current;
        
        // 1. Capture Iframe Viewport
        // We use scrollX/Y and dimensions to capture exactly what the user sees
        const iframeCanvas = await html2canvas(iframeBody, {
            useCORS: true,
            logging: false,
            width: overlayCanvas.clientWidth, // Match viewport width
            height: overlayCanvas.clientHeight, // Match viewport height
            windowWidth: overlayCanvas.clientWidth,
            windowHeight: overlayCanvas.clientHeight,
            x: iframeRef.current.contentWindow?.scrollX || 0,
            y: iframeRef.current.contentWindow?.scrollY || 0,
        });

        // 2. Merge Overlay
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = iframeCanvas.width;
        finalCanvas.height = iframeCanvas.height;
        const ctx = finalCanvas.getContext('2d');
        
        if (ctx) {
            ctx.drawImage(iframeCanvas, 0, 0);
            // Draw overlay on top (it's already transparent)
            // Note: overlayCanvas is HighDPI, so its logical size matches, but pixel size is larger.
            // We need to draw it to match the destination size.
            ctx.drawImage(overlayCanvas, 0, 0, iframeCanvas.width, iframeCanvas.height);
        }

        const base64 = finalCanvas.toDataURL('image/png');
        
        // Construct Context String
        let contextMsg = "";
        if (selectedElements.length > 0) {
            contextMsg = `User focused on elements: ${selectedElements.join(', ')}. `;
        }
        
        onCapture(base64, contextMsg);
        onClose();

    } catch (err) {
        console.error("Capture failed", err);
    }
  };

  const clearCanvas = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          setSelectedElements([]);
      }
  };

  if (!isActive) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 z-50 overflow-hidden">
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="block touch-none cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onClick={handleClick}
      />

      {/* Hover Info Tag */}
      {tool === 'cursor' && hoveredElementInfo && (
          <div className="absolute top-4 left-4 pointer-events-none bg-black/80 text-white text-xs px-2 py-1 rounded shadow-lg border border-blue-500/50 z-50 animate-in fade-in zoom-in-95 duration-100">
             Target: <span className="text-blue-300 font-mono">{hoveredElementInfo}</span>
          </div>
      )}

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#1e1e1e] border border-[#333] rounded-full shadow-2xl p-2 flex items-center gap-3 z-50">
        
        {/* Tools */}
        <div className="flex bg-[#111] rounded-full p-1 border border-[#333]">
            <button 
                onClick={() => setTool('cursor')}
                className={`p-2 rounded-full transition-all ${tool === 'cursor' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                title="Inspect / Select"
            >
                <Crosshair size={18} />
            </button>
            <button 
                onClick={() => setTool('pen')}
                className={`p-2 rounded-full transition-all ${tool === 'pen' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                title="Freehand"
            >
                <Pen size={18} />
            </button>
            <button 
                onClick={() => setTool('rect')}
                className={`p-2 rounded-full transition-all ${tool === 'rect' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                title="Rectangle"
            >
                <Square size={18} />
            </button>
            <button 
                onClick={() => setTool('arrow')}
                className={`p-2 rounded-full transition-all ${tool === 'arrow' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                title="Arrow"
            >
                <ArrowRight size={18} />
            </button>
        </div>

        <div className="w-[1px] h-6 bg-[#333]"></div>

        {/* Colors */}
        <div className="flex gap-1.5">
            {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ffffff'].map(c => (
                <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-4 h-4 rounded-full ring-2 transition-all ${color === c ? 'ring-white scale-110' : 'ring-transparent opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                />
            ))}
        </div>

        <div className="w-[1px] h-6 bg-[#333]"></div>

        {/* Actions */}
        <div className="flex gap-1">
            <button onClick={clearCanvas} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-[#333] transition-colors" title="Clear All">
                <Trash2 size={18} />
            </button>
            <button onClick={handleCapture} className="pl-3 pr-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium text-sm flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20">
                <Check size={16} />
                <span>Attach</span>
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#333] transition-colors" title="Close">
                <X size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default VisualInspector;