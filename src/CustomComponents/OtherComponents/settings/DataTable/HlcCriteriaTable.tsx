// src/components/settings/DataTable/HlcCriteriaTable.jsx
import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { stripHtml } from "../../../HelperCustomComponents/Alluse.js";
import DOMPurify from 'dompurify'; // ✅ Import DOMPurify

type SortField = 'HLCAlignment' | 'Description';
type SortDirection = 'asc' | 'desc' | null;

const HlcCriteriaTable = ({ hlcCriteria, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ms-1" />;
    if (sortDirection === 'asc') return <ArrowUp size={14} className="ms-1" />;
    return <ArrowDown size={14} className="ms-1" />;
  };

  const filteredHlcCriteria = useMemo(() => {
    let result = [...hlcCriteria];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(crit => {
        const alignment = DOMPurify.sanitize(crit.HLCAlignment || '').replace(/<[^>]*>/g, '').toLowerCase();
        const description = DOMPurify.sanitize(crit.Description || '').replace(/<[^>]*>/g, '').toLowerCase();

        return (
          alignment.includes(query) ||
          description.includes(query)
        );
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortField) {
          case 'HLCAlignment':
            aValue = DOMPurify.sanitize(a.HLCAlignment || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.HLCAlignment || '').replace(/<[^>]*>/g, '');
            break;
          case 'Description':
            aValue = DOMPurify.sanitize(a.Description || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.Description || '').replace(/<[^>]*>/g, '');
            break;
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [hlcCriteria, searchQuery, sortField, sortDirection]);

  return (
    <div>
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search HLC criteria..."
            value={searchQuery}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('HLCAlignment')}>
                HLC Criteria {getSortIcon('HLCAlignment')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Description')}>
                Description {getSortIcon('Description')}
              </th>
              <th style={{ fontSize: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHlcCriteria.map(crit => (
              <tr key={crit.Id}>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: crit.HLCAlignment || '' }}></td>
                <td
                  style={{ whiteSpace: 'break-spaces', fontSize: '12px' }}
                  dangerouslySetInnerHTML={{ __html: crit.Description || '' }}
                ></td>
                <td>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-link text-primary p-0" onClick={(e) => { e.preventDefault(); onEdit(crit) }}>
                      <Edit2 size={16} />
                    </button>
                    <button type="button" className="btn btn-link text-danger p-0" onClick={(e) => { e.preventDefault(); onDelete(crit.Id) }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredHlcCriteria.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted py-3">
                  {searchQuery ? 'No HLC criteria match your search' : 'No HLC criteria configured'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HlcCriteriaTable;