import { Menu, X } from 'lucide-react';

interface NavItem {
  id: string;
  title: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    id: 'installation',
    title: 'Installation',
    href: '#installation'
  },
  {
    id: 'adding-scripts',
    title: 'Adding Scripts',
    href: '#adding-scripts'
  },
  {
    id: 'configuration',
    title: 'Configuration',
    href: '#configuration'
  }
];

interface SidebarProps {
  isOpen: boolean;
  activeSection: string;
  toggleSidebar: () => void;
}

export function Sidebar({ isOpen, activeSection, toggleSidebar }: SidebarProps) {
  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-200 dark:bg-gray-800 lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <nav className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 dark:text-white">Get Started</h2>
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={`block p-2 rounded-md transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}