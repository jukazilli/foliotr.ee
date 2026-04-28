/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, Home, Briefcase, User, Image as ImageIcon, LayoutTemplate, 
  Sparkles, Plus, Copy, Edit2, Eye, Globe, Lock, MoreVertical, 
  GitBranch, Check, ShieldAlert, Power, FileText, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Mock Data
const MASTER_PROFILE = {
  id: 'master-1',
  name: 'Principal page',
  slug: '/juliano-zilli/juliano-zilli',
  status: 'active',
  type: 'Curriculo',
  itemsCount: 0,
  lastUpdated: 'Hoje, 14:30'
};

const DERIVED_VERSIONS = [
  { id: 'v4', name: 'Principal page V4', slug: '/juliano-zilli/v4', status: 'active', itemsCount: 7, lastUpdated: 'Hoje, 10:15', isPublic: true },
  { id: 'v3', name: 'Versão para Vaga UX', slug: '/juliano-zilli/v3', status: 'inactive', itemsCount: 5, lastUpdated: '28/04/2026', isPublic: false },
  { id: 'v2', name: 'Startup Pitch Deck', slug: '/juliano-zilli/v2', status: 'inactive', itemsCount: 12, lastUpdated: '27/04/2026', isPublic: false },
  { id: 'v1', name: 'Principal page V1', slug: '/juliano-zilli/v1', status: 'inactive', itemsCount: 4, lastUpdated: '15/03/2026', isPublic: true },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'public' | 'drafts'>('all');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const filteredVersions = DERIVED_VERSIONS.filter(v => {
    if (activeTab === 'public') return v.isPublic;
    if (activeTab === 'drafts') return !v.isPublic;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col font-sans mb-20">
      {/* Topbar Mock (Based on Screenshot) */}
      <header className="h-16 brutal-border border-x-0 border-t-0 bg-white flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-display font-black text-xs">
            ∞
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar no FolioTree" 
              className="pl-10 pr-4 py-2 brutal-border rounded-full w-64 bg-white focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <IconButton icon={<Home size={18} />} />
          <IconButton icon={<Briefcase size={18} />} active />
          <IconButton icon={<User size={18} />} />
          <IconButton icon={<ImageIcon size={18} />} />
          <IconButton icon={<LayoutTemplate size={18} />} />
          <IconButton icon={<Sparkles size={18} />} />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-display font-bold text-sm">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Juliano" alt="Avatar" className="w-8 h-8 rounded-full brutal-border bg-gray-100" />
            Juliano Zilli
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 mt-4">
        
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight text-black mb-2">Comunidade de Portfólios</h1>
            <p className="text-gray-600 font-medium">Gerencie seu perfil mestre e crie versões derivadas para diferentes oportunidades.</p>
          </div>
          <button className="flex items-center gap-2 bg-[#dcfce7] brutal-border brutal-shadow-sm px-6 py-3 rounded-full font-bold hover:-translate-y-0.5 transition-transform">
            <Plus size={18} />
            <span className="font-display">Nova Versão</span>
          </button>
        </div>

        {/* MASTER PROFILE SECTION */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-black font-display font-bold">
            <div className="w-2 h-6 bg-black rounded-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[#dcfce7] animate-pulse opacity-50"></div>
            </div>
            <h2>Perfil Mestre (SSOT)</h2>
          </div>
          
          <div className="bg-white brutal-border brutal-shadow rounded-2xl p-6 relative overflow-hidden group">
            {/* Sync Badge decorative background */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#f6f8f1] rounded-full brutal-border opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-display font-extrabold">{MASTER_PROFILE.name}</h3>
                  <span className="bg-[#dcfce7] text-black text-xs font-bold px-3 py-1 rounded-full brutal-border flex items-center gap-1">
                    <Check size={12} strokeWidth={3} /> Sincronizado
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 font-medium mb-4 flex items-center gap-2">
                   Principal / Portfolio Community
                </p>

                <div className="flex items-center gap-4">
                  <div className="bg-[#f6f8f1] brutal-border px-4 py-2 rounded-full text-sm font-bold flex items-center max-w-fit">
                    {MASTER_PROFILE.slug}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge icon={<Layers size={14} />} text="0 itens" />
                    <Badge icon={<FileText size={14} />} text="Currículo" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#f6f8f1] p-2 brutal-border rounded-full">
                 <button className="w-10 h-10 bg-white brutal-border rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors" title="Editar Estrutura Mestre">
                    <Edit2 size={16} />
                 </button>
                 <button className="w-10 h-10 bg-white brutal-border rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors" title="Visualizar">
                    <Eye size={16} />
                 </button>
                 <div className="w-px h-6 bg-black opacity-20 mx-1"></div>
                 <button className="w-10 h-10 bg-[#ffcce6] brutal-border rounded-full flex items-center justify-center hover:scale-105 transition-transform" title="Criar Derivado">
                    <GitBranch size={16} />
                 </button>
              </div>

            </div>
          </div>
        </section>

        {/* DERIVED VERSIONS SECTION */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-black font-display font-bold">
              <GitBranch size={20} className="text-gray-400" />
              <h2>Versões Derivadas</h2>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full ml-1">
                {DERIVED_VERSIONS.length}
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-white brutal-border rounded-full p-1">
              <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>Todas</TabButton>
              <TabButton active={activeTab === 'public'} onClick={() => setActiveTab('public')}>Públicas</TabButton>
              <TabButton active={activeTab === 'drafts'} onClick={() => setActiveTab('drafts')}>Rascunhos</TabButton>
            </div>
          </div>

          <div className="bg-white brutal-border rounded-2xl overflow-hidden">
            {/* List Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b-2 border-black bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Nome / URL</div>
              <div className="col-span-2">Modificado em</div>
              <div className="col-span-2 text-center">Itens (Diff)</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-center">Ações</div>
            </div>

            {/* List Items */}
            <div className="divide-y-2 divide-gray-100">
              <AnimatePresence>
                {filteredVersions.map((version) => (
                  <motion.div 
                    key={version.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#f6f8f1]/50 transition-colors group"
                  >
                    
                    {/* Name & Slug */}
                    <div className="col-span-5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full brutal-border flex items-center justify-center shrink-0 ${version.isPublic ? 'bg-[#dcfce7]' : 'bg-gray-100'}`}>
                          {version.isPublic ? <Globe size={14} /> : <Lock size={14} className="text-gray-500" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display font-bold text-base truncate">{version.name}</h4>
                          <p className="text-xs text-gray-500 font-medium truncate mt-0.5 font-mono bg-gray-100 rounded px-1.5 py-0.5 w-fit">
                            {version.slug}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 text-sm text-gray-600 font-medium">
                      {version.lastUpdated}
                    </div>

                    {/* Items/Diff */}
                    <div className="col-span-2 flex justify-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">{version.itemsCount} blocos</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex justify-center">
                       {version.isPublic ? (
                         <span className="text-xs font-bold text-[#059669] flex items-center gap-1 bg-[#dcfce7]/50 px-2.5 py-1 rounded-full brutal-border border-[#059669]/20">
                           <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-pulse blur-[1px]"></span>
                           Live
                         </span>
                       ) : (
                         <span className="text-xs font-bold text-gray-500 flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full brutal-border border-gray-200">
                           Rascunho
                         </span>
                       )}
                    </div>

                    {/* Actions Compact */}
                    <div className="col-span-1 flex justify-end relative">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-md transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-md transition-colors" title="Visualizar">
                          <Eye size={16} />
                        </button>
                      </div>
                      
                      <button 
                        className="p-1.5 text-gray-400 hover:text-black transition-colors"
                        onClick={() => setShowDropdown(showDropdown === version.id ? null : version.id)}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {showDropdown === version.id && (
                        <div className="absolute right-0 top-10 w-48 bg-white brutal-border brutal-shadow-sm rounded-xl py-2 z-20">
                          <button className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100 flex items-center gap-2">
                            {version.isPublic ? <Lock size={14} /> : <Globe size={14} />}
                            {version.isPublic ? 'Tornar Privado' : 'Publicar'}
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-100 flex items-center gap-2">
                            <Copy size={14} /> Duplicar Versão
                          </button>
                          <div className="h-px bg-black opacity-10 my-1"></div>
                          <button className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <Power size={14} /> Desativar Vínculo
                          </button>
                        </div>
                      )}
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredVersions.length === 0 && (
                <div className="p-12 text-center text-gray-500 font-medium">
                  Nenhuma versão encontrada para este filtro.
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Dropdown Backdrop to close */}
      {showDropdown && (
        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(null)}></div>
      )}
    </div>
  );
}

function IconButton({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? 'bg-[#ffcce6] brutal-border' : 'hover:bg-gray-100'}`}>
      {icon}
    </button>
  );
}

function Badge({ text, icon }: { text: string, icon?: React.ReactNode }) {
  return (
    <div className="bg-white brutal-border px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
      {icon}
      {text}
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
        active 
          ? 'bg-black text-white' 
          : 'text-gray-500 hover:text-black hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

