const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  workout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 7.5v9M16.5 7.5v9M4.5 9.5v5M19.5 9.5v5M7.5 12h9M2.5 12h2M19.5 12h2" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16" />
      <path d="M5 16l4.5-5 3.5 3 6-7" />
    </svg>
  )
}

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'workout', label: 'Workout' },
  { id: 'history', label: 'History' },
  { id: 'progress', label: 'Progress' }
]

export default function BottomNavigation({ activeTab, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`bottom-nav__item ${activeTab === tab.id ? 'bottom-nav__item--active' : ''}`}
          onClick={() => onNavigate(tab.id)}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {ICONS[tab.id]}
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
