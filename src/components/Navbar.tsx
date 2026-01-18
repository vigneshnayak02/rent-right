import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Bikes', path: '/bikes' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-lg border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="PS Rentals" className="h-10 md:h-14 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-display text-lg font-semibold transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-primary'
                    : 'text-secondary-foreground hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Contact Info & CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a 
              href="tel:+919985819038" 
              className="flex items-center gap-2 text-secondary-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="font-medium">+91 99858 19038</span>
            </a>
            <Button asChild variant="default" className="font-display font-bold">
              <Link to="/bikes">Rent Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-secondary-foreground hover:text-primary transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-secondary border-t border-primary/20 animate-fade-in">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block font-display text-lg font-semibold transition-colors ${
                  isActive(link.path) ? 'text-primary' : 'text-secondary-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-primary/20 space-y-3">
              <a 
                href="tel:+919985819038" 
                className="flex items-center gap-2 text-secondary-foreground"
              >
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 99858 19038</span>
              </a>
              <a 
                href="#locations" 
                className="flex items-center gap-2 text-secondary-foreground"
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span>1 Location in Hyderabad</span>
              </a>
            </div>
            <Button asChild className="w-full font-display font-bold">
              <Link to="/bikes" onClick={() => setIsOpen(false)}>Rent Now</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
