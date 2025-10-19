import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-primary-800 to-primary-900 text-white mt-20">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl">🍊</span>
              <h3 className="text-2xl font-bold">FreshJuice</h3>
            </div>
            <p className="text-primary-100 mb-4">
              Delivering fresh, healthy orange juice to your doorstep in minutes. 
              Quality you can taste, freshness you can feel.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-primary-100">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/menu" className="hover:text-white transition-colors">Menu</a></li>
              <li><a href="/order" className="hover:text-white transition-colors">Order Now</a></li>
              <li><a href="/track" className="hover:text-white transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-primary-100">
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <span>hello@freshjuice.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 text-center text-primary-200">
          <p className="flex items-center justify-center space-x-1">
            <span>Made with</span>
            <Heart size={16} className="text-red-400 fill-current" />
            <span>for fresh juice lovers</span>
          </p>
          <p className="mt-2 text-sm">© 2024 FreshJuice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
