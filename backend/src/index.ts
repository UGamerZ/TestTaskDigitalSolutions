import express, { Request, Response } from 'express';
import cors from 'cors';
import { DataStore } from './store.js';

const store = new DataStore(1000000);
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit if sending large arrays

app.get('/api/elements', (req: Request, res: Response) => {
    try {
        const type = String(req.query.type || 'available');
        const search = String(req.query.search || '');
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 20;

        const data = store.getElements({ type, search, offset, limit });
        res.json(data);
    } catch (err) {
        console.error('Error fetching elements:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/elements', (req: Request, res: Response) => {
    const { id } = req.body;
    if (typeof id !== 'number' || isNaN(id)) {
        return res.status(400).json({ error: 'Valid numeric ID required' });
    }
    store.addElement(id);
    res.status(201).json({ status: 'Created', id });
});

app.post('/api/selection', (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'Array of IDs required' });
    }
    // Optimization: Validate all IDs are numbers to prevent storage corruption
    const validIds = ids.filter(id => typeof id === 'number');
    store.updateSelection(validIds);
    res.status(200).json({ status: 'Updated', count: validIds.length });
});

app.get('/api/selection', (_req: Request, res: Response) => {
    res.json({ ids: store.getSelectedIds() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`[Backend] Services deployed on port ${PORT}`);
});
