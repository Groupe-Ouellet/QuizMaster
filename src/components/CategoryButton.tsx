import React, { useEffect, useMemo, useRef, useState } from 'react';

interface Category {
  id: number;
  name: string;
  quiz_id: number;
}

interface CategorySelectProps {
  categories: Category[];
  onSelect: (categoryId: number) => void;
  selectedId?: number | null;
  placeholder?: string;
  disabled?: boolean;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  onSelect,
  selectedId = null,
  placeholder = 'Choisir une catégorie...',
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedId) || null,
    [categories, selectedId]
  );

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(normalized));
  }, [categories, query]);

  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
    }
    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, []);

  useEffect(() => {
    // Reset highlight when filtered list changes
    setHighlightedIndex(0);
  }, [query]);

  const handleSelect = (category: Category) => {
    onSelect(category.id);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, Math.max(filteredCategories.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredCategories[highlightedIndex];
      if (item) handleSelect(item);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`w-full bg-white border-2 rounded-xl shadow-md transition focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-300 ${
          disabled ? 'opacity-70 cursor-not-allowed' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center px-4 py-3 gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedCategory ? selectedCategory.name : placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-800 text-base"
          />
          <button
            type="button"
            onClick={() => {
              if (disabled) return;
              setIsOpen((v) => !v);
              inputRef.current?.focus();
            }}
            className="text-gray-500 hover:text-green-600 transition"
            aria-label="Toggle category list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto">
          {filteredCategories.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 text-sm">Aucun résultat</div>
          ) : (
            <ul role="listbox" className="py-1">
              {filteredCategories.map((category, index) => {
                const isActive = index === highlightedIndex;
                const isSelected = selectedId === category.id;
                return (
                  <li
                    key={category.id}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(category)}
                    className={`px-4 py-2 cursor-pointer text-sm flex items-center justify-between ${
                      isActive ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    } ${isSelected ? 'font-semibold' : ''}`}
                  >
                    <span>{category.name}</span>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.42l2.293 2.294 6.793-6.794a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelect;