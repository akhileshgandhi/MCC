// src/components/settings/DataTable/DefinitionsDataTable.tsx
import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import DOMPurify from 'dompurify';

interface DefinitionsDataTableProps {
  definitions: any[];
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}

type SortField = 'Term' | 'Definition' | 'Section';
type SortDirection = 'asc' | 'desc' | null;

const DefinitionsDataTable: React.FC<DefinitionsDataTableProps> = ({ definitions, onEdit, onDelete }) => {
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

  const filteredDefinitions = useMemo(() => {
    let result = [...definitions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(def => {
        const term = (def.Term || '').toLowerCase();
        const definition = DOMPurify.sanitize(def.Definition || '').replace(/<[^>]*>/g, '').toLowerCase();
        const section = (def.Section || '').toLowerCase();

        return (
          term.includes(query) ||
          definition.includes(query) ||
          section.includes(query)
        );
      });
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue = '';
        let bValue = '';

        switch (sortField) {
          case 'Term':
            aValue = a.Term || '';
            bValue = b.Term || '';
            break;
          case 'Definition':
            aValue = DOMPurify.sanitize(a.Definition || '').replace(/<[^>]*>/g, '');
            bValue = DOMPurify.sanitize(b.Definition || '').replace(/<[^>]*>/g, '');
            break;
          case 'Section':
            aValue = a.Section || '';
            bValue = b.Section || '';
            break;
        }

        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [definitions, searchQuery, sortField, sortDirection]);

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
            placeholder="Search definitions..."
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
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Term')}>
                Term {getSortIcon('Term')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Definition')}>
                Definition {getSortIcon('Definition')}
              </th>
              <th style={{ fontSize: '12px', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('Section')}>
                Section {getSortIcon('Section')}
              </th>
              <th style={{ fontSize: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDefinitions.map(def => (
              <tr key={def.Id}>
                <td style={{ whiteSpace: 'break-spaces', fontSize: '12px' }}>{def.Term}</td>
                <td
                  style={{ whiteSpace: 'break-spaces', fontSize: '12px' }}
                  dangerouslySetInnerHTML={{ __html: def.Definition || '' }}
                ></td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{def.Section}</td>
                <td>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-link text-primary p-0" onClick={(e) => { e.preventDefault(); onEdit(def) }}>
                      <Edit2 size={16} />
                    </button>
                    <button type="button" className="btn btn-link text-danger p-0" onClick={(e) => { e.preventDefault(); onDelete(def.Id) }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDefinitions.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-3">
                  {searchQuery ? 'No definitions match your search' : 'No definitions configured'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DefinitionsDataTable;
