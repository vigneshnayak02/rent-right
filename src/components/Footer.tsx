import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import logo from '@/assets/logo.png';
import { LOCATIONS } from '@/types/bike';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logo} alt="PS Rentals" className="h-12 w-auto" />
            <p className="text-muted-foreground">
              Premium bike rentals in Hyderabad. Quality bikes, affordable prices, and hassle-free booking.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold text-primary mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/bikes" className="text-muted-foreground hover:text-primary transition-colors">All Bikes</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Locations */}
          <div id="locations">
            <h4 className="font-display text-lg font-bold text-primary mb-4">Our Locations</h4>
            <ul className="space-y-2">
              {LOCATIONS.map((loc) => (
                <li key={loc.id} className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{loc.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-bold text-primary mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:+919985819038" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 text-primary" />
                  +91 99858 19038
                </a>
              </li>
              <li>
                <a href="mailto:psrental08@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-4 w-4 text-primary" />
                  psrental08@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Working Hours:</span><br />
                Mon - Sun: 7:00 AM - 10:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-primary/20 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} PS Rentals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
