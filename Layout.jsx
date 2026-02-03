import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Heart,
  Home, 
  FilePlus, 
  History, 
  BookOpen,
  Menu,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { name: "Home", icon: Home, label: "Início" },
  { name: "NewAssessment", icon: FilePlus, label: "Nova Avaliação" },
  { name: "History", icon: History, label: "Histórico" },
  { name: "Guidelines", icon: BookOpen, label: "Diretriz" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  // Fechar menu ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  // Função para traduzir role
  const getRoleLabel = (role) => {
    const roles = {
      'admin': 'Administrador',
      'user': 'Usuário',
      'medico': 'Médico',
    };
    return roles[role] || role;
  };

  const NavLink = ({ item, mobile = false }) => {
    const isActive = currentPageName === item.name;
    const Icon = item.icon;
    
    return (
      <Link
        to={createPageUrl(item.name)}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
          isActive 
            ? "bg-blue-600 text-white" 
            : "text-gray-600 hover:bg-gray-100"
        } ${mobile ? "w-full" : ""}`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  // Full screen pages without navigation
  const fullScreenPages = ["NewAssessment"];
  if (fullScreenPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header único responsivo */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Calculadora</h1>
                <p className="text-xs text-gray-500">Diretriz SBC 2025</p>
              </div>
            </Link>
            
            {/* Spacer para empurrar o menu para a direita */}
            <div className="flex-1"></div>
            
            {/* Desktop Navigation - Menu Dropdown */}
            {user && (
              <div className="hidden lg:block relative user-menu-container">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                  <span className="text-sm font-medium">Menu</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                {/* Menu Dropdown Completo */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Informações do Usuário */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">{getRoleLabel(user.role)}</p>
                    </div>
                    
                    {/* Links de Navegação */}
                    <div className="py-1">
                      {NAV_ITEMS.map((item) => {
                        const isActive = currentPageName === item.name;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={createPageUrl(item.name)}
                            onClick={() => setUserMenuOpen(false)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                    
                    {/* Separador */}
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    {/* Botão Sair */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button - SÓ aparece no mobile/tablet */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col gap-2 mt-8">
                    {NAV_ITEMS.map((item) => (
                      <NavLink key={item.name} item={item} mobile />
                    ))}
                    {user && (
                      <>
                        <div className="border-t border-gray-200 my-2 pt-2">
                          <div className="flex flex-col items-start px-4 py-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-1">
                              <User className="w-4 h-4" />
                              <span>{user.name}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {getRoleLabel(user.role)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start text-gray-600 hover:text-red-600"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sair
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
