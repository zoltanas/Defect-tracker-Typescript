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

    useEffect(() => {
        if (drawingId) {
            setDrawing(db.drawings.getById(drawingId) || null);
            // Get defects that are associated with this drawing
            setMarkers(db.defects.getAll().filter(d => d.drawingId === drawingId));
        }
    }, [drawingId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && drawing) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Render Placeholder PDF background
                ctx.fillStyle = '#e0e0e0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#666';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(drawing.name, canvas.width / 2, canvas.height / 2);
                
                // Draw Markers
                markers.forEach(m => {
                    if (m.markerX && m.markerY) {
                        const x = m.markerX * canvas.width;
                        const y = m.markerY * canvas.height;
                        ctx.beginPath();
                        ctx.arc(x, y, 10, 0, 2 * Math.PI);
                        ctx.fillStyle = m.status === 'Closed' ? 'green' : 'red';
                        ctx.fill();
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                });
            }
        }
    }, [drawing, markers]);

    const handleCanvasClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / rect.width;
        const clickY = (e.clientY - rect.top) / rect.height;

        // Find clicked marker
        const clicked = markers.find(m => {
            if (!m.markerX || !m.markerY) return false;
            const dx = m.markerX - clickX;
            const dy = m.markerY - clickY;
            // Rough hit testing (distance < radius approx)
            return Math.sqrt(dx*dx + dy*dy) < 0.03;
        });

        if (clicked) {
            navigate(`/defect/${clicked.id}`);
        }
    };

    if (!drawing) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{drawing.name}</h1>
                <button onClick={() => navigate(`/project/${projectId}`)} className="bg-gray-600 text-white px-4 py-2 rounded">Back</button>
            </div>
            <div className="border rounded-lg shadow-lg overflow-hidden relative bg-gray-100 flex justify-center">
                <canvas 
                    ref={canvasRef} 
                    width={800} 
                    height={600} 
                    className="cursor-pointer bg-white shadow"
                    onClick={handleCanvasClick}
                />
            </div>
            <p className="mt-4 text-sm text-gray-600 text-center">Click markers to view defect details.</p>
        </div>
    );
};

export default ViewDrawing;