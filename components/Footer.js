export default function Footer() {
  return (
    <footer className="bg-white pt-10 pb-0">
      <div className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Social Media Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6">SOCIAL MEDIA</h3>
            <div className="flex space-x-6">
              {/* Facebook Icon */}
              <a href="#" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              
              {/* Twitter/X Icon */}
              <a href="#" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* Instagram Icon */}
              <a href="#" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Company Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6">COMPANY</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:underline">About BGH</a></li>
              <li><a href="#" className="hover:underline">BGH Careers</a></li>
              <li><a href="#" className="hover:underline">BGH Global Brands</a></li>
              <li><a href="#" className="hover:underline">Newsletters</a></li>
              <li><a href="#" className="hover:underline">Connect</a></li>
            </ul>
          </div>
          
          {/* App Links & Legal Section */}
          <div>
            <div className="flex space-x-4 mb-4">
              <a href="#" aria-label="App Store">
                <img src="/images/app-store-badge.png" alt="Download on the App Store" className="h-10" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40" fill="none"><rect width="120" height="40" rx="5" fill="black"/><text x="30" y="25" font-family="Arial" font-size="10" fill="white">App Store</text></svg>';
                  }}
                />
              </a>
              <a href="#" aria-label="Google Play">
                <img src="/images/google-play-badge.png" alt="Get it on Google Play" className="h-10"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="135" height="40" viewBox="0 0 135 40" fill="none"><rect width="135" height="40" rx="5" fill="black"/><text x="25" y="25" font-family="Arial" font-size="10" fill="white">Google Play</text></svg>';
                  }}
                />
              </a>
            </div>
            
            <p className="text-gray-500 italic mb-2">Coming soon</p>
            
            <ul className="space-y-3">
              <li><a href="#" className="hover:underline">Terms of Use</a></li>
              <li><a href="#" className="hover:underline">Privacy and Cookie Corner</a></li>
              <li><a href="#" className="hover:underline">Site Map</a></li>
              <li><a href="#" className="hover:underline">Feedback</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="bg-amber-500 py-4 text-center text-white">
        © 2025 BGH. All rights reserved.
      </div>
    </footer>
  );
}