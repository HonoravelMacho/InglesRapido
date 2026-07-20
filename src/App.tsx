/**
 * @license
 * Copyright 2026 HonoravelMacho/inglesrapido
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useEffect, useRef, Fragment } from 'react';
import { 
  GraduationCap, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Search, 
  Check, 
  X, 
  BookOpen, 
  Award, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  Info,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createCardManager, Card, FilterStatus } from './app';

const manager = createCardManager();

export default function App() {
  const [, setTick] = useState(0); // Trigger force re-render
  const [activeTab, setActiveTab] = useState<'study' | 'list' | 'tutorial'>('study');
  const [speechRate, setSpeechRate] = useState<number>(0.9); // Default rate for clear learning
  const [isPlayingExample, setIsPlayingExample] = useState<boolean>(false);
  const [isPlayingWord, setIsPlayingWord] = useState<boolean>(false);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState<boolean>(false);
  const [showFrontHintTranslation, setShowFrontHintTranslation] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to changes in the CardManager
  useEffect(() => {
    const unsubscribe = manager.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    
    // Load Fase 1 initially
    manager.loadFase(1);

    return unsubscribe;
  }, []);

  // Keyboard navigation support for ultra-fast "Brute Force" desktop study
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in the search bar
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const activeCard = manager.getCurrentCard();
      if (!activeCard) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          manager.toggleFlip();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          manager.prevCard();
          break;
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          manager.nextCard();
          break;
        case 'KeyL':
        case 'Enter':
          e.preventDefault();
          manager.markAsLearned(activeCard.id);
          break;
        case 'KeyD':
        case 'Backspace':
          e.preventDefault();
          manager.markAsDifficult(activeCard.id);
          break;
        case 'KeyS':
        case 'KeyV':
          e.preventDefault();
          speakText(activeCard.palavra);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeCard = manager.getCurrentCard();
  const filteredCards = manager.getFilteredCards();
  const currentIndex = manager.getCurrentIndex();
  const isFlipped = manager.getIsFlipped();
  const currentFase = manager.getActiveFase();
  const currentFilter = manager.getFilterStatus();
  const currentCategory = manager.getCategoryFilter();
  const searchQuery = manager.getSearchQuery();
  const stats = manager.getStats();

  // Reset front card hint translation when card or phase changes
  useEffect(() => {
    setShowFrontHintTranslation(false);
  }, [currentIndex, currentFase]);

  // Distinct list of categories available in current cards
  const categories = ['todas', ...Array.from(new Set(manager.getCards().map(c => c.categoria)))];

  // Browser Speech Synthesis Engine
  const speakText = (text: string, isExample: boolean = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop active audio

      const cleanText = text.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;

      if (isExample) {
        setIsPlayingExample(true);
        utterance.onend = () => setIsPlayingExample(false);
        utterance.onerror = () => setIsPlayingExample(false);
      } else {
        setIsPlayingWord(true);
        utterance.onend = () => setIsPlayingWord(false);
        utterance.onerror = () => setIsPlayingWord(false);
      }

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Seu navegador não suporta síntese de voz (TTS).');
    }
  };

  // Change Phase handler
  const handleFaseChange = async (faseNum: number) => {
    await manager.loadFase(faseNum);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col antialiased">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <GraduationCap className="w-6 h-6" id="app-logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2">
                InglesRapido
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                  Força Bruta
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Tutor Inteligente de Memorização Acelerada</p>
            </div>
          </div>

          {/* Phase Control Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            {[1, 2, 3].map((f) => (
              <button
                key={f}
                id={`btn-fase-${f}`}
                onClick={() => handleFaseChange(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                  currentFase === f
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Fase {f}
              </button>
            ))}
          </div>

          {/* Help Button & Key Indicator */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setIsKeyboardHelpOpen(!isKeyboardHelpOpen)}
              className="text-xs text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              Atalhos de Teclado
            </button>
          </div>
        </div>
      </header>

      {/* SUBHEADER: STATS & NAVIGATION TABS */}
      <div className="bg-slate-100/50 border-b border-slate-200/50 py-3">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Sub Navigation */}
          <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('study')}
              className={`px-4.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === 'study'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Estudo Ativo
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Lista de Palavras ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('tutorial')}
              className={`px-4.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === 'tutorial'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <Info className="w-4 h-4" /> Como Funciona
            </button>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Aprendidos: {stats.learned}
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Difíceis: {stats.difficult}
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                Faltam: {stats.unstudied}
              </span>
            </div>
            
            <button
              onClick={() => manager.resetProgress()}
              title="Apagar dados salvos e reiniciar progresso"
              className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1 border border-transparent hover:border-rose-100 hover:bg-rose-50 p-1.5 rounded-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-medium">Resetar Progresso</span>
            </button>
          </div>
        </div>
      </div>

      {/* KEYBOARD SHORTCUTS POPUP DRAWER (collapsible help) */}
      <AnimatePresence>
        {isKeyboardHelpOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-900 text-indigo-100 overflow-hidden"
          >
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="font-bold flex items-center gap-1.5 text-white">
                  <Layers className="w-4 h-4 text-indigo-300" /> Atalhos Rápidos de Desktop:
                </span>
                <span><kbd className="px-1.5 py-0.5 bg-indigo-850 border border-indigo-700 rounded text-[10px] text-white">Espaço</kbd> Virar Card</span>
                <span><kbd className="px-1.5 py-0.5 bg-indigo-850 border border-indigo-700 rounded text-[10px] text-white">Seta Direita</kbd> Avançar</span>
                <span><kbd className="px-1.5 py-0.5 bg-indigo-850 border border-indigo-700 rounded text-[10px] text-white">Seta Esquerda</kbd> Voltar</span>
                <span><kbd className="px-1.5 py-0.5 bg-indigo-850 border border-indigo-700 rounded text-[10px] text-white">Enter</kbd> Marcar Aprendido</span>
                <span><kbd className="px-1.5 py-0.5 bg-indigo-850 border border-indigo-700 rounded text-[10px] text-white">Backspace</kbd> Marcar Difícil</span>
                <span><kbd className="px-1.5 py-0.5 bg-indigo-850 border border-indigo-700 rounded text-[10px] text-white">V</kbd> Ouvir Pronúncia</span>
              </div>
              <button 
                onClick={() => setIsKeyboardHelpOpen(false)}
                className="text-indigo-300 hover:text-white underline font-semibold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex flex-col gap-6">

        {/* STUDY TAB */}
        {activeTab === 'study' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Control Panel / Sidebar Filters (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* Filter Panel Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4.5">
                <h3 className="text-sm font-bold text-slate-800 tracking-wide uppercase flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-600" /> Ajustes de Estudo
                </h3>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => manager.setSearchQuery(e.target.value)}
                    placeholder="Pesquisar termo ou exemplo..."
                    className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition bg-slate-50/50"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  {searchQuery && (
                    <button 
                      onClick={() => manager.setSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Filter status buttons */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Progresso do Deck</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'todos', label: 'Todos' },
                      { id: 'a_estudar', label: 'A Estudar' },
                      { id: 'aprendidos', label: 'Aprendidos' },
                      { id: 'dificeis', label: 'Difíceis' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => manager.setFilterStatus(btn.id as FilterStatus)}
                        className={`text-xs px-3 py-2 rounded-xl border text-center font-semibold transition ${
                          currentFilter === btn.id
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category filters */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categoria Gramatical</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => manager.setCategoryFilter(cat)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium capitalize transition ${
                          currentCategory === cat
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat === 'todas' ? 'Todas' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed TTS control */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-500">Velocidade da Pronúncia:</span>
                    <span className="font-mono text-indigo-600 font-semibold">{speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 bg-slate-200 rounded-lg appearance-none h-1 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Recomendamos 0.8x a 0.9x para estudar fonética.</p>
                </div>

              </div>

              {/* Progress Box card */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-y-6 translate-x-4 opacity-5 pointer-events-none">
                  <Award className="w-48 h-48" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Desempenho Geral</h4>
                  <p className="text-xl font-bold font-display tracking-tight">Estudo de Força Bruta</p>
                </div>

                {/* Circular indicator or simple robust list progress */}
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>Nível de Conclusão da Fase {currentFase}</span>
                      <span>{Math.round(((stats.learned) / (stats.total || 1)) * 100)}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${(stats.learned / (stats.total || 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-rose-500 h-full transition-all duration-300"
                        style={{ width: `${(stats.difficult / (stats.total || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs pt-2">
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                      <p className="text-slate-400 text-[10px] font-medium uppercase">Acumulado Geral</p>
                      <p className="text-lg font-bold text-emerald-400 mt-0.5">{stats.overallLearned}</p>
                      <p className="text-[10px] text-slate-300">palavras aprendidas</p>
                    </div>
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                      <p className="text-slate-400 text-[10px] font-medium uppercase">Revisões Críticas</p>
                      <p className="text-lg font-bold text-rose-400 mt-0.5">{stats.overallDifficult}</p>
                      <p className="text-[10px] text-slate-300">termos em dificuldade</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Flashcard Active View Area (lg:col-span-8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Status bar inside content */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span className="bg-slate-200 px-3 py-1 rounded-full text-slate-700">
                  Filtrados: {filteredCards.length} {filteredCards.length === 1 ? 'card' : 'cards'}
                </span>
                {filteredCards.length > 0 && (
                  <span>
                    Card {currentIndex + 1} de {filteredCards.length}
                  </span>
                )}
              </div>

              {/* Active Card Container */}
              {activeCard ? (
                <div className="flex flex-col gap-5">
                  
                  {/* Interactive Flip Card Container */}
                  <div 
                    id="flashcard-container"
                    onClick={() => manager.toggleFlip()}
                    className="relative perspective-1000 w-full min-h-[380px] sm:min-h-[420px] cursor-pointer group"
                  >
                    <div 
                      className={`absolute w-full h-full transform-style-3d transition-transform duration-600 rounded-3xl shadow-lg border border-slate-200/80 ${
                        isFlipped ? 'rotate-y-180 bg-white' : 'bg-white'
                      }`}
                    >
                      {/* CARD FRONT SIDE */}
                      <div className={`absolute w-full h-full backface-hidden p-6 sm:p-10 flex flex-col justify-between ${
                        isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                      }`}>
                        {/* Top Category Badge & Info */}
                        <div className="flex items-center justify-between">
                          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-lg border border-indigo-100/80 uppercase tracking-wider">
                            {activeCard.categoria}
                          </span>
                          
                          {/* Learning Status Indicators */}
                          <div className="flex items-center gap-1.5">
                            {manager.isLearned(activeCard.id) && (
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                                <Check className="w-3 h-3" /> APRENDIDO
                              </span>
                            )}
                            {manager.isDifficult(activeCard.id) && (
                              <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-rose-100 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> DIFÍCIL
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Mid English Word */}
                        <div className="flex flex-col items-center justify-center text-center py-4">
                          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display tracking-tight text-slate-900 group-hover:scale-[1.02] transition-transform duration-300">
                            {activeCard.palavra}
                          </h2>
                          
                          {/* Listen Pronunciation on Front */}
                          <button
                            id="btn-pronunciar-frente"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents flipping the card
                              speakText(activeCard.palavra);
                            }}
                            className={`mt-3 px-4 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all ${
                              isPlayingWord 
                                ? 'bg-indigo-600 text-white border-indigo-600 scale-95 shadow-md shadow-indigo-100' 
                                : 'bg-slate-50 border-slate-200 text-indigo-600 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                          >
                            <Volume2 className={`w-4 h-4 ${isPlayingWord ? 'animate-bounce' : ''}`} />
                            Ouvir Pronúncia Original
                          </button>
                        </div>

                        {/* Context Hint Section on Front Side */}
                        {activeCard.frase_exemplo && (
                          <div 
                            onClick={(e) => e.stopPropagation()} // Prevents flipping when clicking inside hint
                            className="mx-auto w-full max-w-md bg-indigo-50/40 border border-indigo-100/30 rounded-2xl p-4 flex flex-col gap-2 shadow-2xs relative"
                          >
                            <span className="text-[10px] font-bold text-indigo-500 tracking-wider uppercase text-center block">
                              💡 Frase de Exemplo (Onde a Palavra Aparece)
                            </span>
                            
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed text-center font-sans">
                              {/* Highlight the word in the sentence */}
                              {activeCard.frase_exemplo.split(new RegExp(`(\\b${activeCard.palavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b)`, 'gi')).map((part, i) => {
                                const isMatch = part.toLowerCase() === activeCard.palavra.toLowerCase();
                                return isMatch ? (
                                  <span key={i} className="text-indigo-600 font-extrabold underline decoration-2 decoration-indigo-400 bg-indigo-50/85 px-1 py-0.5 rounded-md">
                                    {part}
                                  </span>
                                ) : (
                                  <span key={i}>{part}</span>
                                );
                              })}
                            </p>

                            {/* Translation disclosure */}
                            <div className="text-center mt-1">
                              {showFrontHintTranslation ? (
                                <p className="text-xs text-slate-500 italic font-medium transition-all duration-350">
                                  {activeCard.traducao_frase}
                                </p>
                              ) : (
                                <button
                                  onClick={() => setShowFrontHintTranslation(true)}
                                  className="text-[11px] text-indigo-500 hover:text-indigo-700 font-bold underline cursor-pointer transition-colors"
                                >
                                  Revelar tradução da frase de exemplo
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Bottom Hint */}
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                          <span>Clique em qualquer lugar no card para revelar a pronúncia e a tradução</span>
                          <ArrowRight className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                        </div>
                      </div>

                      {/* CARD BACK SIDE (Rotated 180deg) */}
                      <div className={`absolute w-full h-full backface-hidden rotate-y-180 p-6 sm:p-10 flex flex-col justify-between ${
                        isFlipped ? 'opacity-100' : 'pointer-events-none opacity-0'
                      }`}>
                        
                        {/* Top indicators */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            FRENTE: <span className="text-slate-800 font-mono font-bold">{activeCard.palavra}</span>
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                            {activeCard.categoria}
                          </span>
                        </div>

                        {/* Central details (Pronunciation & Translation) */}
                        <div className="flex flex-col gap-5 py-3">
                          
                          {/* Phonetic Pronunciation Box */}
                          <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4">
                            <span className="block text-[10px] font-bold text-amber-800 tracking-wider uppercase mb-1">Como Pronunciar (Sotaque Brasileiro)</span>
                            <p className="text-base sm:text-lg font-bold text-slate-850 font-display italic">
                              "{activeCard.pronuncia}"
                            </p>
                          </div>

                          {/* Translation */}
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1">Tradução em Português</span>
                            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                              {activeCard.traducao}
                            </p>
                          </div>

                          {/* Example in Context */}
                          {activeCard.frase_exemplo && (
                            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Exemplo Prático</span>
                                <button
                                  id="btn-pronunciar-exemplo"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevents flipping
                                    speakText(activeCard.frase_exemplo, true);
                                  }}
                                  className={`p-1.5 rounded-full border transition-all ${
                                    isPlayingExample
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-slate-50 border-slate-200 text-indigo-600 hover:bg-slate-100'
                                  }`}
                                  title="Ouvir exemplo prático"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm font-semibold text-slate-800 leading-relaxed font-sans">
                                {activeCard.frase_exemplo}
                              </p>
                              <p className="text-xs text-slate-500 italic">
                                {activeCard.traducao_frase}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Bottom Instruction */}
                        <div className="text-center text-[11px] text-slate-400 font-medium">
                          Clique no card para retornar à frente
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* NAV CONTROLS & MARK PROGRESS BUTTONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    
                    {/* Back button (col-span-2) */}
                    <button
                      id="btn-anterior"
                      onClick={() => manager.prevCard()}
                      className="sm:col-span-3 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      <ChevronLeft className="w-4.5 h-4.5" /> Anterior
                    </button>

                    {/* Bruteforce Mark learned/difficult controls (col-span-8) */}
                    <div className="sm:col-span-6 grid grid-cols-2 gap-3">
                      <button
                        id="btn-marcar-dificil"
                        onClick={() => manager.markAsDifficult(activeCard.id)}
                        className="py-3 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 border border-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <X className="w-4 h-4 text-rose-500" /> Difícil <span className="hidden lg:inline text-[10px] opacity-75">(Kbd: Backspace)</span>
                      </button>

                      <button
                        id="btn-marcar-aprendido"
                        onClick={() => manager.markAsLearned(activeCard.id)}
                        className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-emerald-100"
                      >
                        <Check className="w-4 h-4 text-emerald-100" /> Aprendido <span className="hidden lg:inline text-[10px] opacity-75">(Kbd: Enter)</span>
                      </button>
                    </div>

                    {/* Next button (col-span-2) */}
                    <button
                      id="btn-proximo"
                      onClick={() => manager.nextCard()}
                      className="sm:col-span-3 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                    >
                      Avançar <ChevronRight className="w-4.5 h-4.5" />
                    </button>

                  </div>

                </div>
              ) : (
                /* Empty state when no cards match current filters */
                <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center gap-5 min-h-[380px] shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Nenhum Flashcard Disponível</h3>
                    <p className="text-slate-500 text-xs max-w-sm mt-1 mx-auto leading-relaxed">
                      Não há cards correspondentes aos filtros ativos ({currentFilter}, {currentCategory}). Altere seus ajustes na barra lateral para continuar seus estudos!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      manager.setFilterStatus('todos');
                      manager.setCategoryFilter('todas');
                      manager.setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                  >
                    Resetar Filtros e Mostrar Tudo
                  </button>
                </div>
              )}

              {/* Extra Tutor Advice Card */}
              {activeCard && (
                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4.5 flex gap-4">
                  <div className="w-8.5 h-8.5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-bold text-slate-800">Dica Prática do Tutor:</span>
                    <p className="text-slate-600 leading-relaxed">
                      Ao revelar o card, faça a leitura da frase de exemplo em voz alta imitando a pronúncia fonética brasileira sugerida. Se o sotaque parecer difícil, clique no botão de áudio original para comparar com a locução real.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs flex flex-col gap-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Tabela Geral de Conteúdo (Força Bruta)</h3>
                <p className="text-xs text-slate-500">Navegue de forma abrangente pelas palavras estruturadas na Fase {currentFase}.</p>
              </div>
              
              {/* Simple filters in-line */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={currentFilter}
                  onChange={(e) => manager.setFilterStatus(e.target.value as FilterStatus)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden bg-slate-50 font-semibold"
                >
                  <option value="todos">Todos os Cards</option>
                  <option value="a_estudar">Não Estudados</option>
                  <option value="aprendidos">Aprendidos</option>
                  <option value="dificeis">Difíceis</option>
                </select>

                <select
                  value={currentCategory}
                  onChange={(e) => manager.setCategoryFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden bg-slate-50 font-semibold capitalize"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'todas' ? 'Todas as Categorias' : cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List Grid table */}
            {filteredCards.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Palavra</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Pronúncia Fonética</th>
                      <th className="py-3 px-4">Tradução</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCards.map((card) => (
                      <Fragment key={card.id}>
                        <tr 
                          className="border-b-0 hover:bg-slate-50/70 transition-colors text-xs font-medium"
                        >
                          {/* Word */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                // Load card into study mode and switch tab
                                const indexInFiltered = filteredCards.findIndex(c => c.id === card.id);
                                if (indexInFiltered !== -1) {
                                  // We can click it to jump
                                  manager.setFlipped(false);
                                  manager.nextCard(); // triggers tick, but wait let's update index manually
                                  // Set index by calling next relative to filtered cards
                                  while(manager.getCurrentCard()?.id !== card.id) {
                                    manager.nextCard();
                                  }
                                  setActiveTab('study');
                                }
                              }}
                              className="font-bold text-indigo-600 hover:underline cursor-pointer text-left"
                            >
                              {card.palavra}
                            </button>
                          </td>
                          
                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize">
                              {card.categoria}
                            </span>
                          </td>

                          {/* Pronunciation */}
                          <td className="py-3 px-4 text-slate-600 font-mono italic max-w-xs truncate" title={card.pronuncia}>
                            {card.pronuncia}
                          </td>

                          {/* Translation */}
                          <td className="py-3 px-4 text-slate-800 max-w-xs truncate" title={card.traducao}>
                            {card.traducao}
                          </td>

                          {/* Progress Badge */}
                          <td className="py-3 px-4 text-center">
                            {manager.isLearned(card.id) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                <Check className="w-3 h-3" /> Aprendido
                              </span>
                            )}
                            {manager.isDifficult(card.id) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                <X className="w-3 h-3" /> Difícil
                              </span>
                            )}
                            {!manager.isLearned(card.id) && !manager.isDifficult(card.id) && (
                              <span className="text-[10px] text-slate-400">Pendente</span>
                            )}
                          </td>

                          {/* Quick action buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* Toggle Learned */}
                              <button
                                onClick={() => manager.toggleLearnedDirectly(card.id)}
                                className={`p-1 rounded-md border transition ${
                                  manager.isLearned(card.id)
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50'
                                }`}
                                title={manager.isLearned(card.id) ? "Remover de Aprendidos" : "Marcar como Aprendido"}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              
                              {/* Toggle Difficult */}
                              <button
                                onClick={() => manager.toggleDifficultDirectly(card.id)}
                                className={`p-1 rounded-md border transition ${
                                  manager.isDifficult(card.id)
                                    ? 'bg-rose-600 border-rose-600 text-white'
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50'
                                }`}
                                title={manager.isDifficult(card.id) ? "Remover de Dificuldades" : "Marcar como Difícil"}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>

                              {/* TTS audio */}
                              <button
                                onClick={() => speakText(card.palavra)}
                                className="p-1 rounded-md border bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
                                title="Tocar áudio"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Secondary Row with Example Sentence */}
                        {card.frase_exemplo && (
                          <tr className="border-b border-slate-100 bg-slate-50/20">
                            <td colSpan={6} className="py-2 px-4 pb-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/30 border border-indigo-100/30 rounded-2xl p-2.5">
                                <div className="flex items-start gap-2.5">
                                  <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0 animate-pulse" />
                                  <div className="flex flex-col gap-0.5 text-left">
                                    <p className="text-slate-850 font-semibold font-sans leading-relaxed text-xs">
                                      {/* Highlight the word in the sentence */}
                                      {card.frase_exemplo.split(new RegExp(`(\\b${card.palavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b)`, 'gi')).map((part, i) => {
                                        const isMatch = part.toLowerCase() === card.palavra.toLowerCase();
                                        return isMatch ? (
                                          <span key={i} className="text-indigo-600 font-extrabold underline decoration-1 bg-indigo-50/70 px-0.5 rounded-sm">
                                            {part}
                                          </span>
                                        ) : (
                                          <span key={i}>{part}</span>
                                        );
                                      })}
                                    </p>
                                    <p className="text-slate-500 text-[11px] italic font-medium">
                                      {card.traducao_frase}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => speakText(card.frase_exemplo, true)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white border border-indigo-100 hover:bg-indigo-50/60 rounded-lg shadow-2xs transition shrink-0 self-end sm:self-center cursor-pointer"
                                  title="Ouvir exemplo prático"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>Ouvir Exemplo</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
                <BookOpen className="w-10 h-10 text-slate-300" />
                <p className="text-slate-500 text-sm font-semibold">Nenhum registro encontrado.</p>
                <button
                  onClick={() => {
                    manager.setFilterStatus('todos');
                    manager.setCategoryFilter('todas');
                  }}
                  className="text-xs text-indigo-600 hover:underline font-bold"
                >
                  Limpar filtros do catálogo
                </button>
              </div>
            )}

          </div>
        )}

        {/* TUTORIAL TABS */}
        {activeTab === 'tutorial' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs flex flex-col gap-8 max-w-4xl mx-auto">
            
            {/* Tutoria Header */}
            <div className="border-b border-slate-100 pb-5">
              <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-indigo-600" /> Método Força Bruta para Estudo de Inglês
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Desenvolvido para brasileiros sob os princípios da neurociência de memorização acelerada por repetição intervalada e adaptação fonética.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-sm">1</div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-slate-800">Conexão Fonética Nativa</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Aproximações fonéticas tradicionais baseadas no IPA (Alfabeto Fonético Internacional) confundem iniciantes. Nosso guia de pronúncia usa sílabas e acentuações nativas da língua portuguesa (ex: <span className="font-mono bg-slate-100 px-1 text-indigo-600 font-bold">dâ</span> para <span className="italic font-bold">The</span>) eliminando o travamento ao ler.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-sm">2</div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-slate-800">Memorização de Força Bruta</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O cérebro aprende alta frequência por impacto. Ao separar o deck em "Aprendidos" e "Difíceis", você força a repetição apenas naquilo que não está consolidado na memória de longo prazo, reduzindo o tempo de estudos em até 70%.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-sm">3</div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-slate-800">Aprendizado Multissensorial</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Você ouve o áudio nativo sintetizado em velocidade ajustável, lê o termo inglês, acompanha a grafia fonética brasileira e revisa a tradução conceitual e contextualizada em uma frase de exemplo prática.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-sm">4</div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm text-slate-800">Cronograma de Fases</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    As três fases contêm vocabulários graduais, regras gramaticais e fonéticas fundamentais, progredindo de 100 termos fundamentais na Fase 1 até regras avançadas com o famoso som do 'Schwa' na Fase 3.
                  </p>
                </div>
              </div>

            </div>

            {/* Step by step study guide */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/50">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Fluxo Diário Sugerido (15 min):
              </h4>
              <ol className="list-decimal list-inside text-xs text-slate-650 flex flex-col gap-2.5">
                <li>Selecione a <span className="font-bold">Fase 1</span> para consolidar a base absoluta do inglês.</li>
                <li>Clique no card para revelar o verso. Ouça a pronúncia original, repita 3 vezes o som sugerido na grafia brasileira.</li>
                <li>Avalie com honestidade: se o termo fluiu de forma natural, marque como <span className="text-emerald-600 font-bold">Aprendido</span>. Caso contrário, marque como <span className="text-rose-600 font-bold">Difícil</span>.</li>
                <li>No final do dia, use o filtro "Difíceis" para revisar exclusivamente as suas lacunas. Repita o processo até zerar as pendências!</li>
              </ol>
            </div>

            {/* Bottom contact developer note */}
            <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-5">
              InglesRapido é de código aberto sob a licença Apache 2.0. Desenvolvido para HonoravelMacho/inglesrapido.
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-850 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-bold text-white text-sm">InglesRapido © 2026</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Criado por HonoravelMacho/inglesrapido. Licença Apache 2.0.</p>
          </div>
          <div className="flex gap-4 text-[11px]">
            <a href="#tutorial" onClick={(e) => { e.preventDefault(); setActiveTab('tutorial'); }} className="hover:text-indigo-400 transition font-medium">Método</a>
            <a href="#list" onClick={(e) => { e.preventDefault(); setActiveTab('list'); }} className="hover:text-indigo-400 transition font-medium">Lista Completa</a>
            <a href="#study" onClick={(e) => { e.preventDefault(); setActiveTab('study'); }} className="hover:text-indigo-400 transition font-medium">Estudar Agora</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
