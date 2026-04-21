import { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { Trees, CheckCircle, Clock, LogOut, ChevronRight } from 'lucide-react';

export default function AgentDashboard() {
    const [fields, setFields] = useState([]);
    const { logout, user } = useAuth();
    const [selectedField, setSelectedField] = useState(null);
    const [newStage, setNewStage] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        loadFields();
    }, []);

    const loadFields = async () => {
        try {
            const { data } = await api.get('/fields');
            setFields(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/updates/${selectedField.id}`, { new_stage: newStage, notes });
            setNewStage('');
            setNotes('');
            setSelectedField(null);
            loadFields();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <Trees className="w-8 h-8 text-green-600" />
                    <span className="text-xl font-bold text-slate-800">SmartSeason</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800">{user?.name}</p>
                        <p className="text-xs text-slate-500 uppercase">Field Agent</p>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-6 space-y-6">
                <header>
                    <h1 className="text-2xl font-bold text-slate-800">Assigned Fields</h1>
                    <p className="text-slate-500">Select a field to submit a status update</p>
                </header>

                <div className="grid gap-4">
                    {fields.map(f => (
                        <div
                            key={f.id}
                            onClick={() => setSelectedField(f)}
                            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-green-500 cursor-pointer shadow-sm transition-all group"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${f.status === 'at_risk' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                        <Trees className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{f.name}</h3>
                                        <p className="text-sm text-slate-500 capitalize">{f.crop_type} • Current Stage: <span className="font-medium text-slate-700">{f.current_stage}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <StatusBadge status={f.status} />
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-green-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <div className="bg-white p-20 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
                            You have no fields assigned to you yet.
                        </div>
                    )}
                </div>
            </main>

            {/* Update Modal */}
            {selectedField && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Update Status</h2>
                                <p className="text-slate-500">{selectedField.name}</p>
                            </div>
                            <button onClick={() => setSelectedField(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Growth Stage</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['planted', 'growing', 'ready', 'harvested'].map(stage => (
                                        <button
                                            key={stage}
                                            type="button"
                                            onClick={() => setNewStage(stage)}
                                            className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${newStage === stage
                                                    ? 'border-green-600 bg-green-50 text-green-700'
                                                    : 'border-slate-100 text-slate-600 hover:border-slate-200'
                                                }`}
                                        >
                                            {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Field Notes</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    rows="4"
                                    placeholder="Describe crop health, soil conditions, or any concerns..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!newStage}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Submit Update
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
