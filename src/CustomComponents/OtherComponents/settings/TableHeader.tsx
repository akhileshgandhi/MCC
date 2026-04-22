// src/components/settings/TableHeader.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const TableHeader = ({ title, onAdd, hideAdd = false }) => (
  <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
    <h5 className="mb-0">{title}</h5>
    {!hideAdd && (
      <button type="button" className="btn btn-primary d-flex align-items-center gap-2" onClick={onAdd}>
        <Plus size={16} /> Add
      </button>
    )}
  </div>
);

export default TableHeader;