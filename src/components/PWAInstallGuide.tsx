/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Smartphone, Monitor, Info, ArrowDownToLine, Check, Chrome, Compass } from 'lucide-react';

export default function PWAInstallGuide() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>('desktop');

  useEffect(() => {
    // Listen for the browser's PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect if app is running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show native prompt
    deferredPrompt.prompt();
    
    // Wait for response
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] max-w-4xl mx-auto my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-gray-950 text-lg">
              Instale o NoteStream em seu Computador ou Celular
            </h3>
            <p className="font-sans text-xs text-gray-500 mt-0.5">
              Este aplicativo é super leve e funciona offline, como um app nativo de alta performance!
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-100">
            <Check className="w-3.5 h-3.5" />
            Já Instalado Nativamente!
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-sans font-medium text-sm rounded-xl shadow-xs cursor-pointer hover:shadow-md transition-all animate-bounce"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Baixar e Instalar App
          </button>
        ) : (
          <span className="text-xs text-gray-400 font-mono italic">
            Pronto para adicionar à tela inicial
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-3 mb-4">
        <button
          onClick={() => setActiveTab('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'desktop'
              ? 'bg-blue-600 text-white shadow-3xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          Computador
        </button>
        <button
          onClick={() => setActiveTab('android')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'android'
              ? 'bg-blue-600 text-white shadow-3xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          Android
        </button>
        <button
          onClick={() => setActiveTab('ios')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'ios'
              ? 'bg-blue-600 text-white shadow-3xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          iPhone / iOS
        </button>
      </div>

      {/* Tab Contents */}
      <div className="text-gray-700 text-xs md:text-sm font-sans leading-relaxed">
        {activeTab === 'desktop' && (
          <div className="space-y-3">
            <p className="font-semibold text-gray-800 flex items-center gap-1">
              <Chrome className="w-4 h-4 text-amber-500" /> No Google Chrome ou Microsoft Edge:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-600 ml-1">
              <li>Observe a barra de endereços (URL) no topo do navegador.</li>
              <li>Procure pelo ícone de monitor com uma seta para baixo <strong className="text-gray-900 font-bold">"Instalar aplicativo"</strong> à direita da URL.</li>
              <li>Clique nele e depois confirme em <strong className="text-gray-900 font-bold">"Instalar"</strong>.</li>
              <li>O app será salvo na sua área de trabalho e abrirá como um aplicativo leve, rápido e com ícone próprio!</li>
            </ol>
          </div>
        )}

        {activeTab === 'android' && (
          <div className="space-y-3">
            <p className="font-semibold text-gray-800 flex items-center gap-1">
              <Chrome className="w-4 h-4 text-emerald-500" /> No Google Chrome do Celular:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-600 ml-1">
              <li>Toque nos <strong className="text-gray-900 font-bold">três pontinhos (⋮)</strong> no canto superior direito da tela.</li>
              <li>Role para baixo e selecione a opção <strong className="text-gray-900 font-bold">"Instalar aplicativo"</strong> ou <strong className="text-gray-900 font-bold">"Adicionar à tela de início"</strong>.</li>
              <li>Toque em <strong className="text-gray-900 font-bold">"Instalar"</strong> para confirmar.</li>
              <li>O app será baixado e aparecerá junto com seus outros aplicativos no celular!</li>
            </ol>
          </div>
        )}

        {activeTab === 'ios' && (
          <div className="space-y-3">
            <p className="font-semibold text-gray-800 flex items-center gap-1">
              <Compass className="w-4 h-4 text-blue-500" /> No Navegador Safari (iPhone/iPad):
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-600 ml-1">
              <li>Toque no botão de <strong className="text-gray-900 font-bold">Compartilhar</strong> (ícone de quadrado com uma seta apontando para cima) na parte inferior da tela.</li>
              <li>Role o menu que se abre para baixo.</li>
              <li>Toque em <strong className="text-gray-900 font-bold">"Adicionar à Tela de Início"</strong>.</li>
              <li>Dê um nome ou clique em <strong className="text-gray-900 font-bold">"Adicionar"</strong> no canto superior direito.</li>
              <li>O ícone aparecerá imediatamente na tela inicial do seu iPhone como se fosse baixado da App Store!</li>
            </ol>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-400">
        <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span>
          O app ocupa menos de 2MB de espaço de armazenamento e se adapta perfeitamente ao formato de qualquer tela.
        </span>
      </div>
    </div>
  );
}
