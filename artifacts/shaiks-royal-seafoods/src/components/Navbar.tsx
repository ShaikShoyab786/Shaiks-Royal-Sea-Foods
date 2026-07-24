import { Link } from 'wouter';
import { ShoppingBag, Menu, X, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();

  const cartCount = items.reduce((acc, item) => acc + item.weightKg, 0);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Premium circular logo container */}
              <div className="relative h-12 w-12 shrink-0">
                <div className="h-12 w-12 rounded-full border-2 border-primary/70 bg-background shadow-[0_0_14px_rgba(212,175,55,0.35)] overflow-hidden p-[3px] transition-all duration-300 group-hover:shadow-[0_0_22px_rgba(212,175,55,0.55)] group-hover:border-primary">
                  <img
                    src="/images/logo.png"
                    alt="Shaik's Royal Sea Foods"
                    className="h-full w-full object-contain rounded-full"
                  />
                </div>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground hidden sm:block">
                Shaik's <span className="text-primary italic">Royal</span> Sea Foods
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
                Shop Premium
              </Link>
              <a href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
                How It Works
              </a>
              <a href="/#quality" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
                Our Quality
              </a>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center gap-6">
                <Link href="/orders" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200">
                  <UserIcon className="h-4 w-4" />
                  My Orders
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200">
                Sign In
              </Link>
            )}

            <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors duration-200 group">
              <ShoppingBag className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in-50 duration-200">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="flex md:hidden items-center space-x-4">
            <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary p-2 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link href="/products" className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted hover:text-primary transition-colors">
              Shop Premium
            </Link>
            {user ? (
              <>
                <Link href="/orders" className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted hover:text-primary transition-colors">
                  My Orders
                </Link>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-muted hover:text-destructive transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="block rounded-md px-3 py-2 text-base font-medium text-primary hover:bg-muted transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
