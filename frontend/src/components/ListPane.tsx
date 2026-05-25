import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableRow } from './SortableRow';
import type { ListType, PaginatedResponse } from '../types';
import { elementsApi } from '../api/elements';

interface ListPaneProps {
  type: ListType;
  onMove: (ids: number[]) => void;
  localIds: number[];
}

export const ListPane: React.FC<ListPaneProps> = ({ type, onMove, localIds }) => {
  const [search, setSearch] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['elements', type, search],
    queryFn: ({ pageParam = 0 }) => elementsApi.getElements(type, search, pageParam as number, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PaginatedResponse, allPages: PaginatedResponse[]) => {
        const loadedCount = allPages.reduce((acc: number, p: PaginatedResponse) => acc + p.items.length, 0);
        return lastPage.hasMore ? loadedCount : undefined;
    },
    staleTime: 1000 * 60,
  });

  const allItems = useMemo(() => data?.pages.flatMap((p: PaginatedResponse) => p.items) || [], [data]);
  const isSelfSorted = type === 'selected' && !search;
  const displayItems = isSelfSorted ? localIds : allItems;

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? displayItems.length + 1 : displayItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 54,
    overscan: 10,
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element) {
        const { scrollTop, scrollHeight, clientHeight } = element;
        if (scrollHeight - scrollTop <= clientHeight + 300 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleAction = useCallback((id: number) => {
    if (type === 'available') {
        onMove([...localIds, id]);
    } else {
        onMove(localIds.filter(x => x !== id));
    }
  }, [type, onMove, localIds]);

  return (
    <div className="flex flex-col h-[700px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
      <header className="px-5 py-4 bg-slate-50 border-b flex justify-between items-center">
        <div>
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-tighter">
                {type === 'available' ? 'Available Registry' : 'Active Selection'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{displayItems.length} items loaded</p>
        </div>
        <div className="relative w-48">
            <input 
                type="text" 
                placeholder="Lookup ID..." 
                className="w-full pl-3 pr-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
      </header>

      <div ref={parentRef} className="flex-1 overflow-auto scroll-smooth" onScroll={handleScroll}>
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative', width: '100%' }}>
          <SortableContext items={displayItems.map(String)} strategy={verticalListSortingStrategy}>
            {rowVirtualizer.getVirtualItems().map((vRow: { index: number; size: number; start: number }) => {
              const isLoader = vRow.index >= displayItems.length;
              const id = displayItems[vRow.index];
              return (
                <div
                  key={isLoader ? 'loader' : id}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%',
                    height: `${vRow.size}px`, transform: `translateY(${vRow.start}px)`
                  }}
                >
                  {isLoader ? (
                    <div className="h-full flex items-center justify-center text-xs animate-pulse text-slate-400 bg-slate-50">
                        Loading more assets...
                    </div>
                  ) : (
                    <SortableRow 
                      id={id} 
                      onAction={handleAction}
                      actionLabel={type === 'available' ? 'Select' : 'Remove'}
                      isSortable={isSelfSorted}
                    />
                  )}
                </div>
              );
            })}
          </SortableContext>
        </div>
      </div>
    </div>
  );
};
