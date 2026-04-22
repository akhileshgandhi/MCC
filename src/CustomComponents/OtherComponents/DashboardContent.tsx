import React, { useState, useEffect } from 'react';
import DonutChartLegendDemo from './DonutChartLegendDemo/DonutChartLegendDemo';

const DashboardContent = ({ 
  selectedDepartment, 
  stats, 
  loading,
  departments,
  isMobile,
  isTablet
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [expandedDept, setExpandedDept] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDeptExpansion = (deptId: string) => {
    setExpandedDept(prev => prev === deptId ? null : deptId);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const selectedDept = selectedDepartment 
    ? departments.find(d => `dept-${d.ID}` === selectedDepartment)
    : null;

  const StatCard = ({ title, value, subtitle, colorClass, icon }: any) => (
    <div className={`col-12 ${isMobile ? 'col-6' : isTablet ? 'col-sm-6' : 'col-lg-3'} mb-3`}>
      <div className="card h-100 border stat-card" style={{
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}>
        <div className="card-body">
          <div className={`h3 fw-bold ${colorClass} mb-2`} 
               style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>
            {value}
          </div>
          <h3 className={`h6 fw-semibold text-dark mb-1`} 
              style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
            {title}
          </h3>
          <p className="small text-muted mb-0" 
             style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );

  const DepartmentCard = ({ dept }: any) => {
    const isExpanded = expandedDept === dept.ID;
    const description = dept.Description || '';
    const shouldTruncate = isMobile && description.length > 100;
    const displayDescription = shouldTruncate && !isExpanded 
      ? description.substring(0, 100) + '...' 
      : description;

    return (
      <div className={`col-12 ${isMobile ? 'col-12' : isTablet ? 'col-md-6' : 'col-lg-4'} mb-3`}>
     
        <div className="card h-100 department-card" style={{
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }}>
          <div className="card-body">
            <h5 className="card-title" style={{
              fontSize: isMobile ? '1rem' : '1.25rem',
              marginBottom: isMobile ? '0.5rem' : '0.75rem'
            }}>
              {dept.DepartmentName}
            </h5>
            <p className="card-text text-muted" style={{
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              marginBottom: isMobile ? '0.5rem' : '1rem',
              lineHeight: isMobile ? 1.3 : 1.5
            }}>
              {displayDescription}
            </p>
            {shouldTruncate && (
              <button
                className="btn btn-link p-0 text-primary"
                onClick={() => toggleDeptExpansion(dept.ID)}
                style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              >
                {isExpanded ? 'Show Less' : 'Show More'}
              </button>
            )}
            <p className="card-text">
              <small className="text-muted" style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                <strong>Head:</strong> {dept.HeadOfDepartment?.Title || 'N/A'}
              </small>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid" style={{ padding: isMobile ? '0.5rem' : '1rem' }}>
      <style>
        {`
          @media (max-width: 768px) {
            .dashboard-container {
              padding: 0.5rem !important;
            }
            
            .stat-card .card-body {
              padding: 1rem !important;
            }
            
            .department-card .card-body {
              padding: 1rem !important;
            }
            
            .overview-card {
              margin-bottom: 1rem !important;
            }
            
            .overview-card .card-body {
              padding: 1rem !important;
            }
          }
          
          @media (max-width: 576px) {
            .dashboard-container {
              padding: 0.25rem !important;
            }
            
            .stat-card .card-body {
              padding: 0.75rem !important;
            }
            
            .department-card .card-body {
              padding: 0.75rem !important;
            }
            
            .overview-card .card-body {
              padding: 0.75rem !important;
            }
            
            .h3 {
              font-size: 1.25rem !important;
            }
          }
        `}
      </style>

      <div className="dashboard-container">
        
        <h1 className={`${isMobile ? 'h3' : 'h2'} mb-4 text-dark`} 
            style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}>
          {selectedDept ? `${selectedDept.DepartmentName} Dashboard` : 'Department Dashboard'}
        </h1>
         
        {selectedDept ? (
          /* Department-specific Dashboard */
          <>
            <div className="card mb-4 overview-card">
              <div className="card-body">
                <h2 className={`card-title text-dark mb-3`} 
                    style={{ 
                      fontSize: isMobile ? '1.125rem' : '1.5rem',
                      color: '#004C8E'
                    }}>
                  {selectedDept.DepartmentName}
                </h2>
                <div className="row">
                  <div className="col-12">
                    <p className="text-muted mb-2" style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                      <strong>Vision:</strong> {selectedDept.Vision || 'Not specified'}
                    </p>
                    <p className="text-muted mb-2" style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                      <strong>Head of Department:</strong> {selectedDept.HeadOfDepartment?.Title || 'Not assigned'}
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                      <strong>Description:</strong> {selectedDept.Description || 'No description available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <StatCard 
                title="Total Operational Goals"
                value={stats.totalIEPs}
                subtitle="Department Goals"
                colorClass="text-teal"
              />

              <StatCard 
                title="Active Goals"
                value={stats.activeIEPs}
                subtitle="Currently in progress"
                colorClass="text-primary"
              />

              <StatCard 
                title="Completed"
                value={stats.completedIEPs}
                subtitle="Finished goals"
                colorClass="text-success"
              />

              <StatCard 
                title="High Priority"
                value={stats.highPriorityIEPs}
                subtitle="Critical goals"
                colorClass="text-warning"
              />
            </div>
          </>
        ) : (
          /* Institutional Dashboard */
          <>
            <div className="card mb-4 overview-card">
              <div className="card-body">
                <h2 className={`card-title text-dark mb-3`} 
                    style={{ 
                      fontSize: isMobile ? '1.125rem' : '1.5rem',
                      color: '#004C8E'
                    }}>
                  Institutional Overview
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  Welcome to the Institutional Effectiveness Management System. Select a department to view detailed information and operational goals.
                </p>
              </div>
            </div>

            <div className="row g-3">
              <StatCard 
                title="Departments"
                value={stats.totalDepartments}
                subtitle="Active departments"
                colorClass="text-teal"
              />

              <StatCard 
                title="Operational Goals"
                value={stats.totalIEPs}
                subtitle="Total Goals"
                colorClass="text-primary"
              />

              <StatCard 
                title="Active Goals"
                value={stats.activeIEPs}
                subtitle="In progress"
                colorClass="text-success"
              />

              <StatCard 
                title="High Priority"
                value={stats.highPriorityIEPs}
                subtitle="Critical goals"
                colorClass="text-warning"
              />
            </div>

            {/* Departments Grid */}
            <div className="row mt-4">
              <div className="col-12">
                <h3 className={`mb-3`} 
                    style={{ 
                      fontSize: isMobile ? '1.125rem' : '1.5rem',
                      color: '#004C8E'
                    }}>
                  All Departments
                </h3>
                <div className="row g-3">
                  {departments.map(dept => (
                    <DepartmentCard key={dept.ID} dept={dept} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;