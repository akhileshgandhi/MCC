import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { DefinitionsTableProps } from '../../types/DefinitionsTableProps';
import Loader from '../../Common/Loader';

export default function DefinitionsTable({ sp, exportMode = false }: DefinitionsTableProps) {
  const [section1Data, setSection1Data] = useState([]);
  const [section2Data, setSection2Data] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  // SharePoint configuration
  const LIST_NAME = 'Definitions';

  useEffect(() => {
    // Only fetch once when component mounts
    if (!hasFetched && sp) {
      fetchDefinitions();
    }
  }, [sp, hasFetched]);

  const fetchDefinitions = async () => {
    try {
      setLoading(true);
      setHasFetched(true);
      
      // Fetch items from SharePoint list using PnPjs
      const items = await sp.web.lists.getByTitle(LIST_NAME).items
        .select('ID', 'Term', 'Definition', 'Section')
        .orderBy('ID', true)
        ();

      // Separate items by section
      const section1Items = items.filter(item => item.Section === 'section1');
      const section2Items = items.filter(item => item.Section === 'section2');

      setSection1Data(section1Items);
      setSection2Data(section2Items);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching SharePoint data:', err);
      setError(err.message || 'Failed to load data from SharePoint');
      setLoading(false);
    }
  };

  // Function to strip HTML tags from definition text
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Function to parse HTML list items
  const parseHtmlList = (html) => {
    if (!html) return [];
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    const listItems = tmp.querySelectorAll('li');
    return Array.from(listItems).map(li => li.textContent || li.innerText || '');
  };

  // Refresh data handler
  const handleRefresh = () => {
    fetchDefinitions();
  };

  if (loading) {
    return (
      <div className="container-fluid" >
        <div className="card shadow-sm" style={{
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: 'rgba(0, 0, 0, 0.5) 1px 1px 9px -6px',
        position: 'relative',
        border: '3px solid rgb(255, 191, 50)'
      }}>
          <div className="card-header text-white py-3" style={{ backgroundColor: '#0066cc' }}>
            <div className="mb-0">Definitions</div>
          </div>
          <div className="card-body text-center py-5">
            <Loader size="medium" text="Loading definitions from SharePoint..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        {/* <div className="card shadow-sm">
          <div className="card-header text-white py-3" style={{ backgroundColor: '#0066cc' }}>
            <h4 className="mb-0">Definitions</h4>
          </div>
          <div className="card-body">
            <div className="alert alert-danger" role="alert">
              <h5 className="alert-heading">Error Loading Data</h5>
              <p>{error}</p>
              <hr />
              <p className="mb-0">
                Please check:
                <ul className="mt-2">
                  <li>SharePoint list name is "Definitions"</li>
                  <li>List columns: Term, Definition, Section</li>
                  <li>You have read permissions</li>
                </ul>
              </p>
              <button className="btn btn-primary mt-3" onClick={handleRefresh}>
                Try Again
              </button>
            </div>
          </div>
        </div> */}
      </div>
    );
  }

  return (
    <div className={exportMode ? 'pdf-avoid-break' : ''}>
      <div className={`card shadow-sm${exportMode ? ' pdf-avoid-break' : ''}`} style={{
        padding: '1rem',
        borderRadius: '0.5rem',
        boxShadow: 'rgba(0, 0, 0, 0.5) 1px 1px 9px -6px',
        position: 'relative',
        border: '3px solid rgb(255, 191, 50)'
      }}>
        {/* Header */}
        <div className="card-header text-white py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#0066cc' }}>
          <div className="mb-0" style={{fontSize:'20px'}}>Definitions</div>
          <button  type='button'
            className="btn btn-light btn-sm" 
            onClick={handleRefresh}
            title="Refresh data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="card-body p-4" style={{ backgroundColor: '#fff' }}>
          {/* Section 1 Definitions */}
          {section1Data.map((item, index) => (
            <div key={item.ID || index} className={`mb-3${exportMode ? ' pdf-avoid-break' : ''}`}>
              <p className="mb-1">
                <strong>{item.Term}</strong> – {stripHtml(item.Definition)}
              </p>
            </div>
          ))}

          {/* Section 2 - HLC Criteria */}
          {section2Data.length > 0 && (
            <>
              {/* HLC Criteria Header */}
              {/* <div className="mt-4 mb-3">
                <p className="mb-1">
                  <strong>HLC Criteria</strong> - 1) Mission 2) Integrity: Ethical & Responsible Conduct 3) Teaching & Learning: Quality Resources & Support 4) Teaching & Learning: Evaluation & Improvement 5) Resources Planning & Institutional Effectiveness
                </p>
              </div> */}

              {/* HLC Criteria Sections */}
              {section2Data.map((item, index) => {
                console.log(item, 'Definition to parse',section2Data,'section2Data');
                
                const points = parseHtmlList(item.Definition);
                return (
                  <div key={item.ID || index} className={`mb-4${exportMode ? ' pdf-avoid-break' : ''}`}>
                    <h6 className="mt-3 mb-2" style={{ textIndent: '20px' }}>
                      <strong>{item.Term}</strong>
                    </h6>
                    {points.length > 0 ? (
                      <ol className="mb-0" style={{ paddingLeft: '40px' }}>
                        {points.map((point, pointIndex) => (
                          <li key={pointIndex} className="mb-2">
                            {point}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div style={{ paddingLeft: '40px' }}
                       dangerouslySetInnerHTML={{ __html: item.Definition }}
                      >
                        {/* <p>{stripHtml(item.Definition)}</p> */}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* No Data Message */}
          {section1Data.length === 0 && section2Data.length === 0 && (
            <div className={`alert alert-info${exportMode ? ' pdf-avoid-break' : ''}`} role="alert">
              <strong>No definitions found.</strong>
              <p className="mb-0 mt-2">Please add items to the SharePoint list.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}