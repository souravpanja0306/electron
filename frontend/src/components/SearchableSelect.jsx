import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({ options, value, onChange, placeholder, name, className, required, id, invalid, onBlur }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedOption = options?.find(opt => String(opt.id) === String(value));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options?.filter(option =>
    option.label?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(-1);
      // Small timeout to ensure the element is rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option.id } });
    setIsOpen(false);
    setSearchTerm('');
    // Keep keyboard users in place: focus returns to the picker, not the page body.
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key.length === 1) {
        setIsOpen(true);
        if (e.key.length === 1) {
          setSearchTerm(e.key);
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        handleSelect(filteredOptions[activeIndex]);
      } else if (filteredOptions.length === 1) {
        handleSelect(filteredOptions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex !== -1) {
      const activeEl = document.getElementById(`opt-${name}-${activeIndex}`);
      activeEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef} onKeyDown={handleKeyDown}>
      <input
        name={name}
        value={value || ''}
        onChange={() => { }}
        required={required}
        tabIndex="-1"
        style={{
          position: 'absolute',
          opacity: 0,
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          border: 0,
          pointerEvents: 'none'
        }}
        onFocus={() => setIsOpen(true)}
      />
      <div
        ref={triggerRef}
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id || name}-listbox`}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && id ? `${id}-error` : undefined}
        className={`h-8 px-1 rounded w-full text-slate-900 border bg-white dark:bg-slate-900 dark:text-slate-100 flex items-center justify-between cursor-pointer transition-colors focus:outline-none ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/25' : invalid ? 'border-red-500 focus:ring-2 focus:ring-red-500/25' : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25'}`}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={onBlur}
        tabIndex="0"
      >
        <span className="truncate text-sm p-1">
          {selectedOption ? selectedOption.label : <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>}
        </span>
        <svg
          className={`w-4 h-4 transition-transform text-slate-400 mr-1 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg shadow-slate-900/10 dark:shadow-black/40 max-h-60 flex flex-col overflow-hidden">
          <div className="p-1 border-b border-slate-200 dark:border-slate-700">
            <input
              ref={inputRef}
              type="text"
              className="h-8 px-2 outline-none focus:!shadow-none w-full bg-slate-50 dark:bg-slate-900 rounded text-sm text-slate-900 dark:text-slate-100"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto" role="listbox" id={`${id || name}-listbox`}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  id={`opt-${name}-${index}`}
                  key={option.id}
                  role="option"
                  aria-selected={String(option.id) === String(value)}
                  className={`p-2 cursor-pointer truncate text-sm transition-colors ${index === activeIndex ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white' :
                    String(option.id) === String(value) ? 'bg-blue-50 dark:bg-blue-500/15 font-semibold text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    }`}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-2 text-slate-500 dark:text-slate-400 text-sm text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
