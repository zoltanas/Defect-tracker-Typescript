import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Project, Defect, Checklist, Drawing } from '../types';

type Tab = 'defects' | 'checklists' | 'drawings';

const ProjectDetail: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('defects');
    
    const [defects, setDefects] = useState<Defect[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [drawings, setDrawings] = useState<Drawing[]>([]);

    useEffect(() => {
        if (projectId) {
            const p = db.projects.getById(projectId);
            setProject(p || null);
            refreshData();
        }
    }, [projectId]);

    const refreshData = () => {
        if (projectId) {
            setDefects(db.defects.getByProject(projectId));
            setChecklists(db.checklists.getByProject(projectId));
            setDrawings(db.drawings.getByProject(projectId));
        }
    };

    if (!project) return <div className="p-8 text-center">Project not found</div>;

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-300">
                <h1 className="text-3xl font-bold text-gray-800 text-primary">{project.name}</h1>
                <div className="mt-3 sm:mt-0 space-x-2">
                    <Link to={`/project/${projectId}/add-defect`} className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm">Add Defect</Link>
                    <Link to={`/project/${projectId}/add-checklist`} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm">Add Checklist</Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('defects')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'defects' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Defects ({defects.length})
                </button>
                <button
                    onClick={() => setActiveTab('checklists')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'checklists' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Checklists ({checklists.length})
                </button>
                <button
                    onClick={() => setActiveTab('drawings')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'drawings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Drawings ({drawings.length})
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'defects' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {defects.length === 0 && <li className="p-4 text-gray-500 text-center">No defects found.</li>}
                        {defects.map(defect => (
                            <li key={defect.id}>
                                <Link to={`/defect/${defect.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-primary truncate">{defect.description}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${defect.status === 'Closed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {defect.status}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activeTab === 'checklists' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {checklists.length === 0 && <li className="p-4 text-gray-500 text-center">No checklists found.</li>}
                        {checklists.map(checklist => (
                            <li key={checklist.id}>
                                <Link to={`/checklist/${checklist.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <p className="text-sm font-medium text-primary">{checklist.name}</p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="p-4 bg-gray-50 border-t">
                        <Link to={`/project/${projectId}/add-template`} className="text-sm text-gray-600 hover:text-primary underline">Manage Templates</Link>
                    </div>
                </div>
            )}

            {activeTab === 'drawings' && (
                <div>
                    <div className="mb-4">
                         <Link to={`/project/${projectId}/add-drawing`} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-xs font-medium">Add Drawing</Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {drawings.map(drawing => (
                            <Link key={drawing.id} to={`/project/${projectId}/drawing/${drawing.id}`} className="block bg-white p-4 rounded-lg shadow hover:shadow-md">
                                <div className="h-32 bg-gray-100 flex items-center justify-center mb-2 rounded">
                                    <span className="text-gray-400 font-bold">PDF</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 truncate">{drawing.name}</p>
                            </Link>
                        ))}
                        {drawings.length === 0 && <p className="col-span-full text-gray-500">No drawings yet.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;