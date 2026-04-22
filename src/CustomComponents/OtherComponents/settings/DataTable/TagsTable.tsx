// src/components/settings/DataTable/HlcCriteriaTable.jsx
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import {stripHtml} from "../../../HelperCustomComponents/Alluse.js";
import DOMPurify from 'dompurify'; // ✅ Import DOMPurify
const TagsTable = ({ tags, onEdit, onDelete }) => (
  <div className="table-responsive">
    <table className="table table-bordered">
      <thead className="table-light">
        <tr>
          <th style={{fontSize:'12px'}}>HLC Criteria</th>
          <th style={{fontSize:'12px'}}>Description</th>
          <th style={{fontSize:'12px'}}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tags.map(crit => (
          <tr key={crit.Id}>
            <td style={{whiteSpace:'break-spaces',fontSize:'12px'}}  dangerouslySetInnerHTML={{ __html: crit.Tag }}></td>
            {/* <td 
            style={{ whiteSpace: 'break-spaces',fontSize:'12px' }}
                            dangerouslySetInnerHTML={{ __html: (crit.Description || '') }}
            ></td> */}
            <td>
              <div className="d-flex gap-2">
                <button  type="button" className="btn btn-link text-primary p-0" onClick={(e)=>{e.preventDefault(); onEdit(crit)}}>
                  <Edit2 size={16} />
                </button>
                <button  type="button" className="btn btn-link text-danger p-0" onClick={(e)=>{e.preventDefault(); onDelete(crit.Id)}}>
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TagsTable;