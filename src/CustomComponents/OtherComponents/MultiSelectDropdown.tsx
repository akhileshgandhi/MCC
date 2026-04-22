// components/MultiSelectDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { stripHtml } from '../HelperCustomComponents/Alluse';
import { MultiSelectDropdownProps } from '../../types/MultiSelectDropdownProps';

/**
 * Reusable Multi-Select Dropdown Component
 * - Allows selecting multiple options with checkboxes
 * - Displays selected count or single label
 * - Closes when clicking outside
 * - Sanitizes HTML in option labels
 */
const MultiSelectDropdown = ({
  label,
  options,
  selected,
  onChange,
  getOptionLabel,
  placeholder = "Select items..."
}: MultiSelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    options.forEach((opt, i) => {
      if (!opt?.Id) console.warn(`Option at index ${i} has no Id`, opt);
    });
  }, [options]);

  // Toggle selection of an option
  const toggleOption = (optionId: string) => {
    if (selected.includes(optionId)) {
      onChange(selected.filter(id => id !== optionId));
    } else {
      onChange([...selected, optionId]);
    }
  };

  // Display text in dropdown trigger
  const getSelectedLabels = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      const option = options.find(opt => opt?.Id?.toString() === selected[0]);
      return option ? stripHtml(getOptionLabel(option)) : placeholder;
    }
    return `${selected.length} items selected`;
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="position-relative" ref={dropdownRef}>
        {/* Dropdown Trigger */}
        <div
          className="form-select d-flex justify-content-between align-items-center"
          style={{ cursor: 'pointer' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selected.length === 0 ? 'text-muted' : ''}>
            {getSelectedLabels()}
          </span>
          <ChevronDown size={16} />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="position-absolute w-100 mt-1 bg-white border rounded shadow-lg"
            style={{
              zIndex: 1000,
              maxHeight: '250px',
              overflowY: 'auto'
            }}
          >
            {options.length === 0 ? (
              <div className="p-3 text-muted text-center">No options available</div>
            ) : (
              <div className="p-4">
                {options.map((option, index) => {
                  const optionId = option?.Id?.toString() ?? index.toString(); // fallback to index if Id missing
                  return (
                    <div
                      key={optionId}
                      className="form-check p-2 rounded"
                      style={{
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(optionId);
                      }}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selected.includes(optionId)}
                        onChange={() => { }}
                        style={{ cursor: 'pointer' }}
                      />
                      <label
                        className="form-check-label ms-2"
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        {stripHtml(getOptionLabel(option))}
                      </label>
                    </div>
                  );
                })}

              </div>
            )}
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <small className="text-muted">{selected.length} selected</small>
      )}
    </div>
  );
};

export default MultiSelectDropdown;