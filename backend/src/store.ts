export interface PaginationParams {
    type: string;
    search: string;
    offset: number;
    limit: number;
}

export interface PaginatedResult {
    items: number[];
    hasMore: boolean;
    total: number;
}

export class DataStore {
    private elements: number[];
    private selectedIds: number[] = [];
    private elementsSet: Set<number>;
    private selectedSet: Set<number>;
    private addQueue: Set<number> = new Set();
    private updateQueue: number[] = [];
    private addQueueTimer?: ReturnType<typeof setInterval>;
    private updateQueueTimer?: ReturnType<typeof setInterval>;

    constructor(initialCount: number) {
        this.elements = new Array(initialCount);
        for (let i = 0; i < initialCount; i++) {
            this.elements[i] = i + 1;
        }
        this.elementsSet = new Set(this.elements);
        this.selectedSet = new Set();
        this.startQueueTimers();
    }

    public getElements(params: PaginationParams): PaginatedResult {
        const { type, search, offset, limit } = params;
        const isSearch = search.length > 0;
        let source: number[];

        if (type === 'selected') {
            source = this.selectedIds;
        } else {
            source = this.elements.filter(id => !this.selectedSet.has(id));
        }

        if (isSearch) {
            const s = search.toLowerCase();
            source = source.filter(id => id.toString().includes(s));
        }

        const total = source.length;
        const items = source.slice(offset, offset + limit);

        return {
            items,
            hasMore: offset + limit < total,
            total
        };
    }

    public addElement(id: number): void {
        if (!Number.isFinite(id) || id <= 0) {
            return;
        }

        if (!this.elementsSet.has(id)) {
            this.elements.push(id);
            this.elementsSet.add(id);
        }
    }

    public queueAdd(id: number): void {
        if (!Number.isFinite(id) || id <= 0) {
            return;
        }
        this.addQueue.add(id);
    }

    public forceProcessAddQueue(): void {
        this.processAddQueue();
    }

    public queueSelection(ids: number[]): void {
        this.updateQueue = ids.filter(id => typeof id === 'number' && !Number.isNaN(id));
    }

    public forceProcessUpdateQueue(): void {
        this.processUpdateQueue();
    }

    public updateSelection(ids: number[]): void {
        const uniqueIds = Array.from(new Set(ids.filter(id => typeof id === 'number' && !Number.isNaN(id) && id > 0)));
        this.selectedIds = uniqueIds;
        this.selectedSet = new Set(uniqueIds);
    }

    public getSelectedIds(): number[] {
        return [...this.selectedIds];
    }

    public stop(): void {
        if (this.addQueueTimer) {
            clearInterval(this.addQueueTimer);
            this.addQueueTimer = undefined;
        }
        if (this.updateQueueTimer) {
            clearInterval(this.updateQueueTimer);
            this.updateQueueTimer = undefined;
        }
    }

    private startQueueTimers(): void {
        this.addQueueTimer = setInterval(() => this.processAddQueue(), 10000);
        this.updateQueueTimer = setInterval(() => this.processUpdateQueue(), 1000);
    }

    private processAddQueue(): void {
        if (this.addQueue.size === 0) {
            return;
        }
        const ids = Array.from(this.addQueue);
        this.addQueue.clear();
        ids.forEach(id => this.addElement(id));
    }

    private processUpdateQueue(): void {
        if (this.updateQueue.length === 0) {
            return;
        }
        this.updateSelection(this.updateQueue);
        this.updateQueue = [];
    }
}
