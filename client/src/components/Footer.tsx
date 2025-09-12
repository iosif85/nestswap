import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';

interface FooterProps {
  onNewsletterSignup?: (email: string) => void;
}

export default function Footer({ 
  onNewsletterSignup = () => console.log('Newsletter signup') 
}: FooterProps) {
  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    if (email) {
      onNewsletterSignup(email);
    }
  };

  return (
    <footer className="bg-card border-t border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Section */}
        <div className="border-b border-border pb-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Get the latest news about new properties and swap opportunities
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="flex-1"
                required
                data-testid="input-newsletter-email"
              />
              <Button type="submit" data-testid="button-newsletter-signup">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary font-['Poppins']">
              NestSwap
            </h3>
            <p className="text-sm text-muted-foreground">
              The trusted platform for caravan and cabin exchanges. Discover unique getaways while sharing your own property.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" data-testid="button-social-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-social-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" data-testid="button-social-instagram">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-4">
            <h4 className="font-semibold">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Browse Properties
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Search by Map
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Featured Destinations
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Travel Guides
                </Button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Help Center
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Safety Guidelines
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Contact Us
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                  Community
                </Button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>London, United Kingdom</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>hello@nestswap.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+44 20 7123 4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 NestSwap. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Button>
              <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                Terms of Service
              </Button>
              <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                Cookie Policy
              </Button>
              <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-foreground">
                Accessibility
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}