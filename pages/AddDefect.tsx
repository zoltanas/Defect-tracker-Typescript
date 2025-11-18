import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { Drawing } from '../types';

const AddDefect: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [description, setDescription] = useState('');
    const [selectedDrawingId, setSelectedDrawingId] = useState('');
    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [marker, setMarker] = useState<{ x: number, y: number } | null>(null);
    
    // PDF/Canvas Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (projectId) {
            setDrawings(db.drawings.getByProject(projectId));
        }
    }, [projectId]);

    // Mock PDF rendering to Canvas for marker placement
    useEffect(() => {
        if (selectedDrawingId && canvasRef.current && containerRef.current) {
            const drawing = db.drawings.getById(selectedDrawingId);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx && drawing) {
                // In a real app, render PDF. Here we create a placeholder
                canvas.width = containerRef.current.clientWidth;
                canvas.height = 600;
                
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = '20px Arial';
                ctx.fillStyle = '#333';
                ctx.fillText(`PDF Placeholder: ${drawing.name}`, 50, 50);
                ctx.fillText('Click to place marker', 50, 100);

                if (marker) {
                    ctx.beginPath();
                    ctx.arc(marker.x * canvas.width, marker.y * canvas.height, 10, 0, 2 * Math.PI);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                }
            }
        }
    }, [selectedDrawingId, marker]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMarker({ x, y });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !projectId) return;

        db.defects.create({
            projectId,
            description,
            status: 'Open',
            creatorId: user.id,
            drawingId: selectedDrawingId || undefined,
            markerX: marker?.x,
            markerY: marker?.y
        });
        navigate(`/project/${projectId}`);
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Defect</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 shadow-xl rounded-xl space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Drawing (Optional)</label>
                    <select
                        className="w-full px-3 py-3 border border-gray-300 rounded-md bg-white"
                        value={selectedDrawingId}
                        onChange={e => {
                            setSelectedDrawingId(e.target.value);
                            setMarker(null);
                        }}
                    >
                        <option value="">None</option>
                        {drawings.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                {selectedDrawingId && (
                    <div ref={containerRef} className="border border-gray-300 rounded-md overflow-hidden relative">
                         <canvas
                            ref={canvasRef}
                            onClick={handleCanvasClick}
                            className="cursor-crosshair w-full"
                         />
                    </div>
                )}

                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md">Cancel</button>
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">Create Defect</button>
                </div>
            </form>
        </div>
    );
};

export default AddDefect;