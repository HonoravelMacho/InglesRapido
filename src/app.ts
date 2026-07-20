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

export interface Card {
  id: string;
  palavra: string;
  pronuncia: string;
  traducao: string;
  frase_exemplo: string;
  traducao_frase: string;
  categoria: string;
}

export type FilterStatus = 'todos' | 'aprendidos' | 'dificeis' | 'a_estudar';

/**
 * CardManager gerencia o estado de estudo de flashcards para o InglesRapido.
 * Ele cuida da navegação, marcações de aprendizado/dificuldade, busca,
 * filtros por categoria, além de persistência local automática das conquistas.
 */
export class CardManager {
  private cards: Card[] = [];
  private currentIdx: number = 0;
  private learnedIds: Set<string> = new Set();
  private difficultIds: Set<string> = new Set();
  private activeFase: number = 1;
  private currentFilter: FilterStatus = 'todos';
  private currentCategory: string = 'todas';
  private searchQuery: string = '';
  private isFlipped: boolean = false;
  private onChangeListeners: Set<() => void> = new Set();

  constructor() {
    this.loadProgress();
  }

  /**
   * Registra um callback para ser notificado quando o estado interno mudar,
   * permitindo que a interface React se mantenha reativa e atualizada.
   */
  public subscribe(listener: () => void): () => void {
    this.onChangeListeners.add(listener);
    return () => {
      this.onChangeListeners.delete(listener);
    };
  }

  private notify(): void {
    this.onChangeListeners.forEach((listener) => listener());
  }

  /**
   * Carrega os flashcards do arquivo JSON estático correspondente à fase escolhida.
   */
  public async loadFase(fase: number): Promise<Card[]> {
    this.activeFase = fase;
    this.isFlipped = false;
    this.currentIdx = 0;

    try {
      const response = await fetch(`/fase${fase}.json`);
      if (!response.ok) {
        throw new Error(`Erro ao carregar fase ${fase}: ${response.statusText}`);
      }
      this.cards = await response.json();
    } catch (error) {
      console.error('Falha no carregamento dos dados fonéticos:', error);
      this.cards = [];
    }
    this.notify();
    return this.cards;
  }

  // Getters e Acessores de Estado
  public getCards(): Card[] {
    return this.cards;
  }

  public getFilteredCards(): Card[] {
    return this.cards.filter((card) => {
      // Filtrar por status de progresso
      if (this.currentFilter === 'aprendidos' && !this.learnedIds.has(card.id)) return false;
      if (this.currentFilter === 'dificeis' && !this.difficultIds.has(card.id)) return false;
      if (this.currentFilter === 'a_estudar' && (this.learnedIds.has(card.id) || this.difficultIds.has(card.id))) return false;

      // Filtrar por categoria de palavra
      if (this.currentCategory !== 'todas' && card.categoria !== this.currentCategory) return false;

      // Filtrar por busca em texto completo
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const wordMatch = card.palavra.toLowerCase().includes(query);
        const translationMatch = card.traducao.toLowerCase().includes(query);
        const exampleMatch = card.frase_exemplo.toLowerCase().includes(query);
        const phoneticMatch = card.pronuncia.toLowerCase().includes(query);
        if (!wordMatch && !translationMatch && !exampleMatch && !phoneticMatch) return false;
      }

      return true;
    });
  }

  public getCurrentCard(): Card | null {
    const filtered = this.getFilteredCards();
    if (filtered.length === 0) return null;
    if (this.currentIdx >= filtered.length) {
      this.currentIdx = Math.max(0, filtered.length - 1);
    }
    return filtered[this.currentIdx];
  }

  public getCurrentIndex(): number {
    return this.currentIdx;
  }

  public getActiveFase(): number {
    return this.activeFase;
  }

  public getFilterStatus(): FilterStatus {
    return this.currentFilter;
  }

  public getCategoryFilter(): string {
    return this.currentCategory;
  }

  public getSearchQuery(): string {
    return this.searchQuery;
  }

  public getIsFlipped(): boolean {
    return this.isFlipped;
  }

  public isLearned(id: string): boolean {
    return this.learnedIds.has(id);
  }

  public isDifficult(id: string): boolean {
    return this.difficultIds.has(id);
  }

  public getStats() {
    const totalInFase = this.cards.length;
    let learnedInFase = 0;
    let difficultInFase = 0;
    this.cards.forEach((c) => {
      if (this.learnedIds.has(c.id)) learnedInFase++;
      if (this.difficultIds.has(c.id)) difficultInFase++;
    });

    return {
      total: totalInFase,
      learned: learnedInFase,
      difficult: difficultInFase,
      unstudied: totalInFase - learnedInFase - difficultInFase,
      overallLearned: this.learnedIds.size,
      overallDifficult: this.difficultIds.size,
    };
  }

  // Modificadores de Estado
  public setFilterStatus(status: FilterStatus): void {
    this.currentFilter = status;
    this.currentIdx = 0;
    this.isFlipped = false;
    this.notify();
  }

  public setCategoryFilter(category: string): void {
    this.currentCategory = category;
    this.currentIdx = 0;
    this.isFlipped = false;
    this.notify();
  }

  public setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.currentIdx = 0;
    this.isFlipped = false;
    this.notify();
  }

  public toggleFlip(): void {
    this.isFlipped = !this.isFlipped;
    this.notify();
  }

  public setFlipped(flipped: boolean): void {
    this.isFlipped = flipped;
    this.notify();
  }

  public nextCard(): void {
    const filteredCount = this.getFilteredCards().length;
    if (filteredCount > 0) {
      this.currentIdx = (this.currentIdx + 1) % filteredCount;
      this.isFlipped = false;
      this.notify();
    }
  }

  public prevCard(): void {
    const filteredCount = this.getFilteredCards().length;
    if (filteredCount > 0) {
      this.currentIdx = (this.currentIdx - 1 + filteredCount) % filteredCount;
      this.isFlipped = false;
      this.notify();
    }
  }

  public markAsLearned(cardId: string): void {
    this.learnedIds.add(cardId);
    this.difficultIds.delete(cardId);
    this.saveProgress();
    this.nextCard();
  }

  public markAsDifficult(cardId: string): void {
    this.difficultIds.add(cardId);
    this.learnedIds.delete(cardId);
    this.saveProgress();
    this.nextCard();
  }

  public toggleLearnedDirectly(cardId: string): void {
    if (this.learnedIds.has(cardId)) {
      this.learnedIds.delete(cardId);
    } else {
      this.learnedIds.add(cardId);
      this.difficultIds.delete(cardId);
    }
    this.saveProgress();
    this.notify();
  }

  public toggleDifficultDirectly(cardId: string): void {
    if (this.difficultIds.has(cardId)) {
      this.difficultIds.delete(cardId);
    } else {
      this.difficultIds.add(cardId);
      this.learnedIds.delete(cardId);
    }
    this.saveProgress();
    this.notify();
  }

  public resetProgress(): void {
    if (confirm('Tem certeza de que deseja resetar todo o seu progresso?')) {
      this.learnedIds.clear();
      this.difficultIds.clear();
      this.saveProgress();
      this.notify();
    }
  }

  // Mecanismo de persistência LocalStorage
  private saveProgress(): void {
    localStorage.setItem('ir_learned_ids', JSON.stringify(Array.from(this.learnedIds)));
    localStorage.setItem('ir_difficult_ids', JSON.stringify(Array.from(this.difficultIds)));
  }

  private loadProgress(): void {
    const learned = localStorage.getItem('ir_learned_ids');
    const difficult = localStorage.getItem('ir_difficult_ids');
    if (learned) {
      try {
        this.learnedIds = new Set(JSON.parse(learned));
      } catch (e) {
        console.error('Falha ao ler progresso de aprendizado:', e);
      }
    }
    if (difficult) {
      try {
        this.difficultIds = new Set(JSON.parse(difficult));
      } catch (e) {
        console.error('Falha ao ler progresso de dificuldades:', e);
      }
    }
  }
}

/**
 * Função para criar a instância global ou local do CardManager.
 */
export function createCardManager(): CardManager {
  return new CardManager();
}
