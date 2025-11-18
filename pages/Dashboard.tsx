import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { ProjectStats } from '../types';
import { FileText } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<ProjectStats[]>([]);

    useEffect(() => {
        const projects = db.projects.getAll();
        const projectStats = projects.map(p => {
            const defects = db.defects.getByProject(p.id);
            const checklists = db.checklists.getByProject(p.id);
            const drawings = db.drawings.getByProject(p.id);
            
            return {
                project: p,
                openDefects: defects.filter(d => d.status === 'Open').length,
                openDefectsWithReply: defects.filter(d => d.status === 'OpenWithReply').length,
                openChecklists: checklists.filter(c => c.status === 'Open').length,
                drawings: drawings
            };
        });
        setStats(projectStats);
    }, []);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
                <Link to="/add-project" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium text-center">
                    Add New Project
                </Link>
            </div>

            {stats.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No projects</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map(stat => (
                        <div key={stat.project.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4">
                                <Link to={`/project/${stat.project.id}`} className="text-sky-600 hover:text-sky-700 text-xl font-semibold hover:underline truncate">
                                    {stat.project.name}
                                </Link>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4 mb-4 flex-grow">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Statistics:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li className="flex justify-between"><span>Open Defects:</span> <span className="font-semibold text-gray-900">{stat.openDefects}</span></li>
                                    <li className="flex justify-between"><span>Replies:</span> <span className="font-semibold text-gray-900">{stat.openDefectsWithReply}</span></li>
                                    <li className="flex justify-between"><span>Open Checklists:</span> <span className="font-semibold text-gray-900">{stat.openChecklists}</span></li>
                                </ul>

                                {stat.drawings.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Drawings:</h4>
                                        <ul className="space-y-2">
                                            {stat.drawings.map(drawing => (
                                                <li key={drawing.id}>
                                                    <Link 
                                                        to={`/project/${stat.project.id}/drawing/${drawing.id}`}
                                                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline group"
                                                    >
                                                        <FileText size={16} className="mr-2 text-gray-400 group-hover:text-blue-600" />
                                                        <span className="truncate">{drawing.name}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <Link to={`/project/${stat.project.id}/add-drawing`} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-xs font-medium transition-colors">
                                    + Add Drawing
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;