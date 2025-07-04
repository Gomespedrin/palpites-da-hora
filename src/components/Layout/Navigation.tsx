import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  HomeIcon, 
  TrophyIcon, 
  UsersIcon, 
  ArrowRightLeftIcon,
  BarChart3Icon,
  Settings
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/meu-time', label: 'Meu Time', icon: UsersIcon },
  { href: '/transferencias', label: 'Transferências', icon: ArrowRightLeftIcon },
  { href: '/ranking', label: 'Ranking', icon: BarChart3Icon },
];

interface NavigationProps {
  user?: {
    nickname: string;
    avatar?: string;
    pointsTotal: number;
  };
  onLogout: () => void;
}

export const Navigation = ({ user, onLogout }: NavigationProps) => {
  const location = useLocation();

  return (
    <nav className="bg-card border-b shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <TrophyIcon className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              Palpites da Hora
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user.nickname}</p>
                <p className="text-xs text-muted-foreground">{user.pointsTotal} pts</p>
              </div>
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="flex flex-col items-center space-y-1 h-auto py-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};