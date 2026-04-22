import React from 'react';
import { Menu, LayoutDashboard, FolderTree, Settings, Archive } from 'lucide-react';

const IconNavigation = ({
  activePage,
  onPageChange,
  sidebarOpen,
  onToggleSidebar,
  isMobile,
  userRole
}: any) => {

  const handleNavClick = (page: string) => {
    onPageChange(page);
    if (!sidebarOpen && !isMobile) {
      onToggleSidebar();
    }
  };

  const handleMenuClick = () => {
    onToggleSidebar();
  };

  // 👇 Container Style (centers when few icons)
  const containerStyle: React.CSSProperties = {
    width: isMobile ? '3rem' : '4rem',
    minWidth: isMobile ? '3rem' : '4rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent:
      userRole === 'Program Director' ? 'space-between' : 'start',
    alignItems: 'center',
    padding: '1rem 0',
    backgroundColor: '#212529'
  };

  // -------------------------
  // 🎯 Role-based UI switch
  // -------------------------
  const renderIcons = () => {
    switch (userRole) {
      case 'Program Director':
        return (
          <>
            {/* Menu Icon */}
            <div
              className="cursor-pointer p-2 rounded text-center"
              onClick={handleMenuClick}
              style={{ height: '55px' }}
              title="Toggle Sidebar"
            >
              <Menu color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Menu</small>
              </div>
            </div>

            {/* Dashboard */}
            <div
              className={`cursor-pointer p-2 rounded text-center ${activePage === 'dashboard' ? 'bg-secondary' : ''}`}
              onClick={() => handleNavClick('dashboard')}
              style={{ height: '55px', marginTop: '4rem' }}
              title="Dashboard"
            >
              <LayoutDashboard color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>ID</small>
              </div>
            </div>

            {/* IEPs */}
            <div
              className={`cursor-pointer p-2 rounded text-center ${activePage === 'scorecard' ? 'bg-secondary' : ''}`}
              onClick={() => handleNavClick('scorecard')}
              style={{ height: '55px', marginTop: '4rem' }}
              title="Goals"
            >
              <FolderTree color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Goals</small>
              </div>
            </div>

            {/* Archived Goals */}
            <div
              className={`cursor-pointer p-2 rounded text-center ${activePage === 'archived' ? 'bg-secondary' : ''}`}
              onClick={() => handleNavClick('archived')}
              style={{ height: '55px' ,marginTop: '4rem'}}
              title="Archived Goals"
            >
              <Archive color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Archive</small>
              </div>
            </div>

            {/* Settings */}
            <div
              className={`mt-auto cursor-pointer p-2 text-center rounded ${activePage === 'settings' ? 'bg-secondary' : ''}`}
              onClick={() => handleNavClick('settings')}
              style={{ height: '55px' }}
              title="Settings"
            >
              <Settings color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Config</small>
              </div>
            </div>
          </>
        );

      case 'Planning Unit Manager':
        return (
          <>
            {/* Menu Icon */}
            <div
              className="cursor-pointer p-2 rounded text-center"
              onClick={handleMenuClick}
              style={{ height: '55px' ,marginTop: '4rem'}}
              title="Toggle Sidebar"
            >
              <Menu color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Menu</small>
              </div>
            </div>

            {/* IEPs */}
            <div
              className={`cursor-pointer p-2 rounded text-center ${activePage === 'scorecard' ? 'bg-secondary' : ''}`}
              onClick={() => handleNavClick('scorecard')}
              style={{ height: '55px', marginTop: '4rem' }}
              title="Goals"
            >
              <FolderTree color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Goals</small>
              </div>
            </div>

            {/* Archived Goals */}
            <div
              className={`cursor-pointer p-2 rounded text-center ${activePage === 'archived' ? 'bg-secondary' : ''}`}
              onClick={() => handleNavClick('archived')}
              style={{ height: '55px',marginTop: '4rem' }}
              title="Archived Goals">
              <Archive color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Archive</small>
              </div>
            </div>
          </>
        );

      case 'IEPEmployesGroup':
        return (
          <>
            {/* Menu Icon */}
            <div
              className="cursor-pointer p-2 rounded text-center"
              onClick={handleMenuClick}
              style={{ height: '55px', marginTop: '4rem' }}
              title="Toggle Sidebar"
            >
              <Menu color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Menu</small>
              </div>
            </div>

            {/* IEPs - Read Only */}
            <div
              className={`cursor-pointer p-2 rounded text-center ${activePage === 'scorecard' ? 'bg-secondary' : ''}`}
              onClick={() => handleNavClick('scorecard')}
              style={{ height: '55px', marginTop: '4rem' }}
              title="Goals (Read Only)"
            >
              <FolderTree color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Goals</small>
              </div>
            </div>

            {/* Archived Goals - Read Only */}
            <div
              className={`cursor-pointer p-2 rounded text-center ${activePage === 'archived' ? 'bg-secondary' : ''}`}
              onClick={() => handleNavClick('archived')}
              style={{ height: '55px', marginTop: '4rem' }}
              title="Archived Goals (Read Only)"
            >
              <Archive color="white" size={16} />
              <div className="text-center mt-1">
                <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Archive</small>
              </div>
            </div>
          </>
        );

      default:
        // If no role matches, show minimal navigation
        return (
          <div
            className="cursor-pointer p-2 rounded text-center"
            onClick={handleMenuClick}
            style={{ height: '55px', marginTop: '4rem' }}
            title="Toggle Sidebar"
          >
            <Menu color="white" size={16} />
            <div className="text-center mt-1">
              <small style={{ fontSize: isMobile ? '8px' : '9px', color: 'white' }}>Menu</small>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="icon-navigation bg-dark" style={containerStyle}>
      {renderIcons()}

      <style>{`
        @media (max-width: 767.98px) {
          .icon-navigation {
            width: 3rem !important;
            min-width: 3rem !important;
          }
          .icon-navigation .cursor-pointer {
            padding: 0.5rem !important;
          }
        }

        @media (max-width: 575.98px) {
          .icon-navigation {
            width: 2.5rem !important;
            min-width: 2.5rem !important;
          }
        }

        .cursor-pointer:hover {
          background-color: rgba(255,255,255,0.1);
          transform: scale(1.05);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default IconNavigation;