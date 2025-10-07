import { create } from 'zustand';

export const useStore = create((set) => ({
  contentItems: [],
  
  addContentItem: (item) =>
    set((state) => ({
      contentItems: [item, ...state.contentItems],
    })),
  
  updateContentStatus: (id, status) =>
    set((state) => ({
      contentItems: state.contentItems.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    })),
  
  deleteContentItem: (id) =>
    set((state) => ({
      contentItems: state.contentItems.filter((item) => item.id !== id),
    })),
}));
