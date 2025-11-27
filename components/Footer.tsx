import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-gt-dark/90 backdrop-blur-md py-6 relative z-10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="col-span-2">
            <h3 className="text-xl font-bold text-white mb-2">Nub.<span className="text-gt-gold">market</span></h3>
            <p className="text-slate-500 text-sm max-w-sm">
              We are a third-party marketplace and not affiliated with Ubisoft or Growtopia. 
              All trademarks belong to their respective owners.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">Support</h4>
            <ul className="space-y-1 text-sm text-slate-400">
              <li><a href="#" className="hover:text-gt-gold">Help Center</a></li>
              <li><a href="#" className="hover:text-gt-gold">Terms of Service</a></li>
              <li><a href="#" className="hover:text-gt-gold">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">Crypto</h4>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>Bitcoin (BTC)</li>
              <li>Ethereum (ETH)</li>
              <li>Litecoin (LTC)</li>
              <li>Tether (USDT)</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-slate-600 border-t border-slate-800 pt-4">
          &copy; {new Date().getFullYear()} Nub.market. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;