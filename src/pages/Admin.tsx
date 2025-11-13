import { useState, useEffect } from 'react';
import { supabase, Project, Client, Operation } from '../lib/supabase';
import ProjectsManager from '../components/admin/ProjectsManager';
import ClientsManager from '../components/admin/ClientsManager';
import OperationsManager from '../components/admin/OperationsManager';
import ConfigManager from '../components/admin/ConfigManager';
import { Building2, Users, FileText, Settings, Home } from 'lucide-react';

type Tab = 'projects' | 'clients' | 'operations' | 'config';

interface AdminProps {
  onBackToHome: () => void;
}

export default function Admin({ onBackToHome }: AdminProps) {
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [projectsRes, clientsRes, operationsRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('operations').select('*').order('created_at', { ascending: false }),
    ]);

    if (projectsRes.data) setProjects(projectsRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
    if (operationsRes.data) setOperations(operationsRes.data);
  };

  const tabs = [
    { id: 'projects' as Tab, label: 'Proyectos', icon: Building2 },
    { id: 'clients' as Tab, label: 'Clientes', icon: Users },
    { id: 'operations' as Tab, label: 'Operaciones', icon: FileText },
    { id: 'config' as Tab, label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-light tracking-wide text-neutral-900">
            Panel de Administración
          </h1>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 border border-neutral-300 px-6 py-2 text-sm tracking-wider transition-all hover:border-neutral-900"
          >
            <Home className="h-4 w-4" strokeWidth={1.5} />
            VOLVER AL SITIO
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r border-neutral-200 bg-white p-6">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm tracking-wide transition-all ${
                    activeTab === tab.id
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {activeTab === 'projects' && (
            <ProjectsManager projects={projects} onUpdate={loadData} />
          )}
          {activeTab === 'clients' && (
            <ClientsManager clients={clients} onUpdate={loadData} />
          )}
          {activeTab === 'operations' && (
            <OperationsManager
              operations={operations}
              projects={projects}
              clients={clients}
              onUpdate={loadData}
            />
          )}
          {activeTab === 'config' && <ConfigManager />}
        </main>
      </div>
    </div>
  );
}
