import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Drawing, Defect } from '../types';

const ViewDrawing: React.FC = () => {
    const { projectId, drawingId } = useParams<{ projectId: string, drawingId: string }>();
    const navigate = useNavigate();
    const [drawing, setDrawing] = useState<Drawing | null>(null);
    const [markers, setMarkers] = useState<Defect[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (drawingId) {
            setDrawing(db.drawings.getById(drawingId) || null);
            setMarkers(db.defects.getAll().filter(d => d.drawingId === drawingId));
        }
    }, [drawingId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        if (canvas && container && drawing) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                const drawContent = () => {
                    // Draw Markers
                    markers.forEach(m => {
                        if (m.markerX && m.markerY) {
                            const x = m.markerX * canvas.width;
                            const y = m.markerY * canvas.height;
                            ctx.beginPath();
                            ctx.arc(x, y, 10, 0, 2 * Math.PI);
                            ctx.fillStyle = m.status === 'Closed' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)';
                            ctx.fill();
                            ctx.strokeStyle = 'white';
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    });
                };

                const renderPlaceholder = (name: string) => {
                    canvas.width = container.clientWidth;
                    canvas.height = 600;
                    ctx.fillStyle = '#e0e0e0';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#666';
                    ctx.font = '24px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
                    ctx.fillText("(Preview not available)", canvas.width / 2, canvas.height / 2 + 30);
                };

                if (drawing.fileDataUrl) {
                    if (drawing.fileDataUrl.startsWith('data:application/pdf')) {
                        // PDF Rendering
                        const loadingTask = window.pdfjsLib.getDocument(drawing.fileDataUrl);
                        loadingTask.promise.then((pdf: any) => {
                            pdf.getPage(1).then((page: any) => {
                                const viewport = page.getViewport({ scale: 1 });
                                // Scale to fit container width
                                const scale = container.clientWidth / viewport.width;
                                const scaledViewport = page.getViewport({ scale });
                                
                                canvas.width = scaledViewport.width;
                                canvas.height = scaledViewport.height;
                                
                                const renderContext = {
                                    canvasContext: ctx,
                                    viewport: scaledViewport
                                };
                                page.render(renderContext).promise.then(() => {
                                    drawContent();
                                });
                            });
                        }, (reason: any) => {
                            console.error("Error loading PDF:", reason);
                            renderPlaceholder("Error loading PDF");
                        });
                    } else if (drawing.fileDataUrl.startsWith('data:image')) {
                        // Image Rendering
                        const img = new Image();
                        img.src = drawing.fileDataUrl;
                        img.onload = () => {
                            // Adjust canvas height to match image aspect ratio
                            const aspect = img.height / img.width;
                            canvas.width = container.clientWidth;
                            canvas.height = canvas.width * aspect;
                            
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            drawContent();
                        };
                        img.onerror = () => {
                            renderPlaceholder(drawing.name);
                            drawContent();
                        };
                    } else {
                        renderPlaceholder(drawing.name);
                        drawContent();
                    }
                } else {
                    renderPlaceholder(drawing.name);
                    drawContent();
                }
            }
        }
    }, [drawing, markers]);

    const handleCanvasClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / rect.width;
        const clickY = (e.clientY - rect.top) / rect.height;

        const clicked = markers.find(m => {
            if (!m.markerX || !m.markerY) return false;
            const dx = m.markerX - clickX;
            const dy = m.markerY - clickY;
            // Adjust hit radius based on canvas aspect or keep fixed logic
            return Math.sqrt(dx*dx + dy*dy) < 0.03; 
        });

        if (clicked) {
            navigate(`/defect/${clicked.id}`);
        }
    };

    if (!drawing) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">{drawing.name}</h1>
                <button onClick={() => navigate(`/project/${projectId}`)} className="bg-gray-600 text-white px-4 py-2 rounded shadow-sm hover:bg-gray-700">Back</button>
            </div>
            <div ref={containerRef} className="border rounded-lg shadow-lg overflow-hidden relative bg-gray-100 flex justify-center min-h-[400px]">
                <canvas 
                    ref={canvasRef} 
                    className="cursor-pointer bg-white shadow w-full"
                    onClick={handleCanvasClick}
                />
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">Click markers to view defect details.</p>
        </div>
    );
};

export default ViewDrawing;