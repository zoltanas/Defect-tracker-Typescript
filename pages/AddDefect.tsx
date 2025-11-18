import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { Drawing } from '../types';
import { X, Upload } from 'lucide-react';

const AddDefect: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [description, setDescription] = useState('');
    const [selectedDrawingId, setSelectedDrawingId] = useState('');
    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [marker, setMarker] = useState<{ x: number, y: number } | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // PDF/Canvas Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (projectId) {
            setDrawings(db.drawings.getByProject(projectId));
        }
    }, [projectId]);

    // PDF/Image rendering to Canvas
    useEffect(() => {
        if (selectedDrawingId && canvasRef.current && containerRef.current) {
            const drawing = db.drawings.getById(selectedDrawingId);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (ctx && drawing && drawing.fileDataUrl) {
                const drawMarker = () => {
                    if (marker) {
                        ctx.beginPath();
                        ctx.arc(marker.x * canvas.width, marker.y * canvas.height, 10, 0, 2 * Math.PI);
                        ctx.fillStyle = 'red';
                        ctx.fill();
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                };

                if (drawing.fileDataUrl.startsWith('data:application/pdf')) {
                    // PDF Rendering
                    const loadingTask = window.pdfjsLib.getDocument(drawing.fileDataUrl);
                    loadingTask.promise.then((pdf: any) => {
                        pdf.getPage(1).then((page: any) => {
                            const viewport = page.getViewport({ scale: 1 });
                            // Scale to fit container width
                            const scale = containerRef.current!.clientWidth / viewport.width;
                            const scaledViewport = page.getViewport({ scale });
                            
                            canvas.width = scaledViewport.width;
                            canvas.height = scaledViewport.height;
                            
                            const renderContext = {
                                canvasContext: ctx,
                                viewport: scaledViewport
                            };
                            page.render(renderContext).promise.then(() => {
                                drawMarker();
                            });
                        });
                    });
                } else if (drawing.fileDataUrl.startsWith('data:image')) {
                    // Image Rendering
                    const img = new Image();
                    img.src = drawing.fileDataUrl;
                    img.onload = () => {
                        // Maintain aspect ratio
                        const aspectRatio = img.height / img.width;
                        canvas.width = containerRef.current!.clientWidth;
                        canvas.height = canvas.width * aspectRatio;
                        
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        drawMarker();
                    };
                } else {
                    // Fallback
                    canvas.width = containerRef.current!.clientWidth;
                    canvas.height = 600;
                    ctx.fillStyle = '#f0f0f0';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.font = '16px Arial';
                    ctx.fillText('Preview not available', canvas.width / 2, canvas.height / 2);
                    drawMarker();
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            // Reset the input value so the same file can be selected again if needed (though unlikely immediately)
            e.target.value = '';
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !projectId) return;

        setIsSubmitting(true);

        try {
            // 1. Create the Defect
            const newDefect = db.defects.create({
                projectId,
                description,
                status: 'Open',
                creatorId: user.id,
                drawingId: selectedDrawingId || undefined,
                markerX: marker?.x,
                markerY: marker?.y
            });

            // 2. Process and Save Attachments
            if (files.length > 0) {
                const filePromises = files.map(file => {
                    return new Promise<void>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            const dataUrl = evt.target?.result as string;
                            db.attachments.create({
                                fileDataUrl: dataUrl,
                                fileName: file.name,
                                parentId: newDefect.id,
                                parentType: 'defect'
                            });
                            resolve();
                        };
                        reader.readAsDataURL(file);
                    });
                });

                await Promise.all(filePromises);
            }

            navigate(`/project/${projectId}`);
        } catch (error) {
            console.error("Error creating defect:", error);
            setIsSubmitting(false);
        }
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900 placeholder-gray-500 shadow-sm"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe the defect..."
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                    <div className="flex items-center gap-3 mb-3">
                        <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                            <Upload size={16} className="mr-2" />
                            <span>Choose Files</span>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                        <span className="text-xs text-gray-500">Select one or more files (Images, PDF)</span>
                    </div>

                    {files.length > 0 && (
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200 bg-gray-50">
                            {files.map((f, i) => (
                                <li key={i} className="flex items-center justify-between py-2 px-3 text-sm">
                                    <div className="flex items-center overflow-hidden">
                                        <span className="truncate text-gray-700 font-medium">{f.name}</span>
                                        <span className="ml-2 text-gray-500 text-xs">({(f.size / 1024).toFixed(1)} KB)</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeFile(i)} 
                                        className="ml-4 text-gray-400 hover:text-red-500 focus:outline-none"
                                    >
                                        <X size={18} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Drawing (Optional)</label>
                    <select
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary bg-white text-gray-900 shadow-sm"
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
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Click on the drawing to mark the location.</p>
                        <div ref={containerRef} className="border border-gray-300 rounded-md overflow-hidden relative bg-gray-100">
                             <canvas
                                ref={canvasRef}
                                onClick={handleCanvasClick}
                                className="cursor-crosshair w-full block"
                             />
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium">Cancel</button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Create Defect'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddDefect;