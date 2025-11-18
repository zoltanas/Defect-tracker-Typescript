import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Defect, Attachment, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Upload, Plus, X } from 'lucide-react';

const DefectDetail: React.FC = () => {
    const { defectId } = useParams<{ defectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [defect, setDefect] = useState<Defect | null>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [creator, setCreator] = useState<User | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [viewingAttachment, setViewingAttachment] = useState<Attachment | null>(null);

    useEffect(() => {
        if (defectId) {
            const d = db.defects.getById(defectId);
            if (d) {
                setDefect(d);
                setCreator(db.users.getById(d.creatorId) || null);
                setAttachments(db.attachments.getByParent(d.id));
            }
        }
    }, [defectId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && defectId) {
            setIsUploading(true);
            const files = Array.from(e.target.files);
            
            const filePromises = files.map((file: File) => {
                return new Promise<Attachment>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        const dataUrl = evt.target?.result as string;
                        const newAtt = db.attachments.create({
                            fileDataUrl: dataUrl,
                            fileName: file.name,
                            parentId: defectId,
                            parentType: 'defect'
                        });
                        resolve(newAtt);
                    };
                    reader.readAsDataURL(file);
                });
            });

            const newAttachments = await Promise.all(filePromises);
            setAttachments(prev => [...prev, ...newAttachments]);
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleDeleteDefect = () => {
        if (defect && confirm('Are you sure you want to delete this defect?')) {
            db.defects.delete(defect.id);
            // Navigate explicitly to project to force refresh of list
            navigate(`/project/${defect.projectId}`);
        }
    };

    const handleDeleteAttachment = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent opening the popup
        if (confirm('Delete this attachment?')) {
            db.attachments.delete(id);
            setAttachments(prev => prev.filter(a => a.id !== id));
        }
    };

    if (!defect) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Defect Details</h1>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${defect.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {defect.status}
                        </span>
                        <button 
                            onClick={handleDeleteDefect}
                            className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                            title="Delete Defect"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-gray-900">{defect.description}</p>
                </div>
                
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500">Reported By</h3>
                    <p className="mt-1 text-gray-900">{creator?.name} ({creator?.company})</p>
                    <p className="text-xs text-gray-500">{new Date(defect.creationDate).toLocaleDateString()}</p>
                </div>

                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
                        <label className={`flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-md text-sm cursor-pointer hover:bg-primary-hover transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isUploading ? (
                                <span>Uploading...</span>
                            ) : (
                                <>
                                    <Plus size={16} />
                                    <span>Add Files</span>
                                    <input type="file" multiple onChange={handleFileUpload} className="hidden" disabled={isUploading} accept="image/*,application/pdf"/>
                                </>
                            )}
                        </label>
                    </div>
                    
                    {attachments.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">No attachments yet.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                            {attachments.map(att => (
                                <div 
                                    key={att.id} 
                                    className="relative group border rounded-lg p-2 hover:shadow-md transition-shadow bg-gray-50 cursor-pointer"
                                    onClick={() => setViewingAttachment(att)}
                                >
                                    <div className="h-32 w-full bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                                        {att.fileDataUrl.startsWith('data:image') ? (
                                            <img src={att.fileDataUrl} alt={att.fileName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-2">
                                                <p className="text-xs font-bold text-gray-600">PDF</p>
                                                <p className="text-xs text-gray-500 mt-1 break-all line-clamp-2">{att.fileName}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button
                                        onClick={(e) => handleDeleteAttachment(e, att.id)}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-20 shadow-sm"
                                        title="Delete attachment"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all pointer-events-none">
                                        {att.fileDataUrl.startsWith('data:image') && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/annotate/${att.id}`);
                                                }}
                                                className="pointer-events-auto hidden group-hover:block bg-white text-gray-800 px-3 py-1 rounded text-sm font-medium shadow hover:bg-gray-100 mt-16"
                                            >
                                                Annotate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded hover:bg-gray-100">Back</button>
                </div>
            </div>

            {/* Attachment Modal */}
            {viewingAttachment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={() => setViewingAttachment(null)}>
                    <div className="relative bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b shrink-0">
                            <h3 className="text-lg font-semibold text-gray-800 truncate pr-4">{viewingAttachment.fileName}</h3>
                            <button 
                                onClick={() => setViewingAttachment(null)} 
                                className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-grow overflow-auto p-1 bg-gray-100 flex justify-center items-center min-h-[300px]">
                            {viewingAttachment.fileDataUrl.startsWith('data:application/pdf') ? (
                                <iframe 
                                    src={viewingAttachment.fileDataUrl} 
                                    className="w-full h-[80vh]" 
                                    title="PDF Preview"
                                ></iframe>
                            ) : (
                                <img 
                                    src={viewingAttachment.fileDataUrl} 
                                    alt={viewingAttachment.fileName} 
                                    className="max-w-full max-h-[80vh] object-contain shadow-sm" 
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DefectDetail;