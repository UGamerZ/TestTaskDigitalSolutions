import { DataStore } from './store';

/**
 * DataStore unit tests verify business logic for element management,
 * selection batching, search, pagination, and queue deduplication.
 */

describe('DataStore Core Logic', () => {
    let store: DataStore;

    beforeEach(() => {
        store = new DataStore(100);
    });

    afterEach(() => {
        store.stop();
    });

    test('should initialize with exactly N elements', () => {
        const data = store.getElements({ type: 'available', search: '', offset: 0, limit: 1000 });

        expect(data.total).toBe(100);
        expect(data.items[0]).toBe(1);
        expect(data.items[99]).toBe(100);
    });

    test('should move elements to selected list and preserve order', () => {
        store.queueSelection([5, 3, 1]);
        store.forceProcessUpdateQueue();

        const selected = store.getElements({ type: 'selected', search: '', offset: 0, limit: 10 });
        expect(selected.items).toEqual([5, 3, 1]);
        expect(selected.total).toBe(3);

        const available = store.getElements({ type: 'available', search: '', offset: 0, limit: 10 });
        expect(available.items).not.toContain(5);
        expect(available.items).not.toContain(3);
        expect(available.items).not.toContain(1);
    });

    test('getSelectedIds returns a copy of selected IDs', () => {
        store.queueSelection([2, 4, 6]);
        store.forceProcessUpdateQueue();

        const selected = store.getSelectedIds();
        expect(selected).toEqual([2, 4, 6]);

        selected.push(999);
        expect(store.getSelectedIds()).toEqual([2, 4, 6]);
    });

    test('should filter items by substring ID', () => {
        const data = store.getElements({ type: 'available', search: '1', offset: 0, limit: 100 });

        data.items.forEach(id => {
            expect(id.toString()).toContain('1');
        });
    });

    test('should deduplicate additions in the add queue', () => {
        store.queueAdd(200);
        store.queueAdd(200);
        store.queueAdd(201);
        store.forceProcessAddQueue();

        const data = store.getElements({ type: 'available', search: '20', offset: 0, limit: 200 });
        expect(data.items).toContain(200);
        expect(data.items).toContain(201);

        const count200 = data.items.filter(x => x === 200).length;
        expect(count200).toBe(1);
    });

    test('queueAdd ignores invalid IDs', () => {
        store.queueAdd(-1);
        store.queueAdd(Number.NaN);
        store.forceProcessAddQueue();

        const data = store.getElements({ type: 'available', search: '', offset: 0, limit: 200 });
        expect(data.items).not.toContain(-1);
    });

    test('pagination should respect offset and limit', () => {
        const page1 = store.getElements({ type: 'available', search: '', offset: 0, limit: 10 });
        const page2 = store.getElements({ type: 'available', search: '', offset: 10, limit: 10 });

        expect(page1.items.length).toBe(10);
        expect(page2.items.length).toBe(10);
        expect(page1.items[0]).toBe(1);
        expect(page2.items[0]).toBe(11);
    });
});
