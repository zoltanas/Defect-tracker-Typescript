import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Defect, Attachment, User } from '../types';
import { useAuth } from '../contexts/AuthContext';

const DefectDetail: React.FC = () => {
    const { defectId } = useParams<{ defectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [defect, setDefect] = useState<Defect | null>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [creator, setCreator] = useState<User | null>(null);

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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && defectId) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (evt) => {
                const dataUrl = evt.target?.result as string;
                const newAtt = db.attachments.create({
                    fileDataUrl: dataUrl,
                    fileName: file.name,
                    parentId: defectId,
                    parentType: 'defect'
                });
                setAttachments([...attachments, newAtt]);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!defect) return <div>Loading...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Defect Details</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${defect.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {defect.status}
                    </span>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {attachments.map(att => (
                            <div key={att.id} className="relative group border rounded-lg p-2">
                                <img src={att.fileDataUrl} alt={att.fileName} className="w-full h-32 object-cover rounded" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                                    <button 
                                        onClick={() => navigate(`/annotate/${att.id}`)}
                                        className="hidden group-hover:block bg-white text-gray-800 px-3 py-1 rounded text-sm font-medium shadow"
                                    >
                                        Annotate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <label className="block">
                        <span className="sr-only">Choose file</span>
                        <input type="file" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"/>
                    </label>
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800 font-medium">Back</button>
                </div>
            </div>
        </div>
    );
};

export default DefectDetail;