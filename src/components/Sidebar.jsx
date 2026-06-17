import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Sidebar.css'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user: currentUser, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)  // Desktop collapse state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)  // Mobile drawer state

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  // ✅ Update --sidebar-width CSS variable whenever collapsed changes (DESKTOP ONLY)
  useEffect(() => {
    const width = collapsed ? '80px' : '280px'
    document.documentElement.style.setProperty('--sidebar-width', width)

    // Cleanup: reset on unmount
    return () => {
      document.documentElement.style.setProperty('--sidebar-width', '280px')
    }
  }, [collapsed])

  const handleToggle = () => {
    // Toggle based on viewport width
    if (window.innerWidth < 768) {
      // Mobile: toggle drawer
      setMobileDrawerOpen(prev => !prev)
    } else {
      // Desktop: toggle collapsed state
      setCollapsed(prev => !prev)
    }
  }

  // Navigation handler - only closes mobile drawer, doesn't collapse desktop
  const handleNavigation = (path) => {
    navigate(path)
    // Close mobile drawer after navigation
    if (window.innerWidth < 768) {
      setMobileDrawerOpen(false)
    }
  }

  const mainMenuItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      path: '/dashboard',
      desc: 'Overview',
    },
    {
      icon: '📅',
      label: 'Calendar',
      path: '/calendar',
      desc: 'Events & Schedule',
    },
    ...(currentUser?.role === 'admin'
      ? [
        {
          icon: '💳',
          label: 'Fee Structure',
          path: '/fees',
          desc: 'Fee Details',
        },
      ]
      : []),
  ]

  const classMenuItems = [
    {
      icon: '🎓',
      label: 'PreKG',
      path: '/students/PreKG',
      desc: 'Pre-Kindergarten',
    },
    {
      icon: '📚',
      label: 'LKG',
      path: '/students/LKG',
      desc: 'Lower Kindergarten',
    },
    {
      icon: '✏️',
      label: 'UKG',
      path: '/students/UKG',
      desc: 'Upper Kindergarten',
    },
  ]

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileDrawerOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <span className="app-icon">🏫</span>
          {!collapsed && <span className="app-title">School Manager</span>}

          <button
            className="toggle-btn"
            onClick={handleToggle}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Profile */}
        {!collapsed && (
          <div className="user-profile">
            <div className="user-avatar">
              {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <p className="user-name">{currentUser?.name || 'Admin'}</p>
              <p className="user-role">{currentUser?.role === 'admin' ? 'Administrator' : 'Teacher'}</p>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            {!collapsed && <div className="nav-section-title">Main</div>}
            {mainMenuItems.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && (
                  <div className="nav-text">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-desc">{item.desc}</span>
                  </div>
                )}
                {!collapsed && isActive(item.path) && <span className="nav-dot"></span>}
              </button>
            ))}
          </div>

          <div className="nav-section">
            {!collapsed && <div className="nav-section-title">Classes</div>}
            {classMenuItems.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                title={item.label}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && (
                  <div className="nav-text">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-desc">{item.desc}</span>
                  </div>
                )}
                {!collapsed && isActive(item.path) && <span className="nav-dot"></span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <span className="logout-icon">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
          {!collapsed && (
            <p className="sidebar-version">v1.0.0</p>
          )}
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={handleToggle}>
        ☰
      </button>
    </>
  )
}