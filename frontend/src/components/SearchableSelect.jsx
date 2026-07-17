import React, { useState, useEffect, useRef } from 'react';

const SearchableSelect = ({ options, value, onChange, placeholder, name, className, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

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
        onChange={() => {}}
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
        className={`h-8 px-1 rounded w-full text-slate-900 border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white flex items-center justify-between cursor-pointer ${required && !value ? 'border-slate-400' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex="0"
      >
        <span className="truncate text-sm p-1">
          {selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}
        </span>
        <svg
          className={`w-4 h-4 transition-transform text-slate-500 mr-1 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded shadow-xl max-h-60 flex flex-col overflow-hidden">
          <div className="p-1 border-b border-slate-400 dark:border-slate-600">
            <input
              ref={inputRef}
              type="text"
              className="h-8 px-2 outline-none w-full bg-slate-50 dark:bg-slate-900 rounded text-sm dark:text-white"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  id={`opt-${name}-${index}`}
                  key={option.id}
                  className={`p-2 hover:bg-blue-100 dark:hover:bg-slate-700 cursor-pointer truncate text-sm ${
                    index === activeIndex ? 'bg-blue-200 dark:bg-slate-600' : 
                    String(option.id) === String(value) ? 'bg-blue-50 dark:bg-slate-700 font-semibold text-blue-600' : 'dark:text-white'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-2 text-slate-500 text-sm text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
