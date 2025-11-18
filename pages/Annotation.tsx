import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Attachment } from '../types';

const Annotation: React.FC = () => {
    const { attachmentId } = useParams<{ attachmentId: string }>();
    const navigate = useNavigate();
    const [attachment, setAttachment] = useState<Attachment | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ff0000');
    const [lineWidth, setLineWidth] = useState(5);
    
    useEffect(() => {
        if (attachmentId) {
            setAttachment(db.attachments.getById(attachmentId) || null);
        }
    }, [attachmentId]);

    useEffect(() => {
        if (attachment && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = attachment.fileDataUrl;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                // Scale visually via CSS, but drawing context uses full res
                ctx?.drawImage(img, 0, 0);
            };
        }
    }, [attachment]);

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        ctx.beginPath();
        ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        if (ctx) {
            ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
            ctx.stroke();
        }
    };

    const stopDrawing = () => setIsDrawing(false);

    const handleSave = () => {
        if (canvasRef.current && attachment) {
            const newDataUrl = canvasRef.current.toDataURL('image/png');
            // Update attachment with annotated image
            db.attachments.update({
                ...attachment,
                fileDataUrl: newDataUrl
            });
            navigate(-1);
        }
    };

    if (!attachment) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h1 className="text-2xl font-bold">Annotate Image</h1>
                <div className="flex gap-2 items-center">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-8" />
                    <input type="range" min="1" max="20" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} className="w-24" />
                    <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded">Save</button>
                    <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-4 py-2 rounded">Back</button>
                </div>
            </div>
            <div className="overflow-auto border rounded shadow bg-gray-800 flex justify-center">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="cursor-crosshair max-w-full"
                    style={{ maxHeight: '80vh' }}
                />
            </div>
        </div>
    );
};

export default Annotation;