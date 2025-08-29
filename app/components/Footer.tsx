import Image from "next/image";
import EcoHarvest from "../images/ecoHarvestNavLogo2.png";


const Footer = () => {
  return (
    <footer className="bg-gradient-to-b w-[99vw] overflow-x-hidden from-[#101010] to-[#000000] text-white relative overflow-hidden">
      {/* Decorative background elements */}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-3">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              
                <Image alt="hello" width={250} src={EcoHarvest} />
             
              
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Connecting restaurants and hotels with consumers to reduce food waste through innovative surplus food solutions and sustainable product repurposing.
            </p>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-200 mb-3">Stay Updated</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm focus:outline-none focus:border-[#FDAA1C] transition-colors"
                />
                <button className="px-4 py-2 bg-[#FDAA1C] hover:bg-yellow-600 rounded-r-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="ml-[45px]">
            <h3 className="text-[23px] font-semibold mb-6 text-white relative">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "About Us", href: "/about" },
                { label: "Shop", href: "/shop" },
                { label: "Sustainability", href: "/sustainability" },
                { label: "For Restaurants", href: "/restaurants" },
                { label: "Contact", href: "/contact" }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-[#FDAA1C] transition-colors duration-200 text-sm flex items-center group"
                  >
                    <svg className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-[23px] font-semibold mb-6 text-white relative">
              Support
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Help Center", href: "/help" },
                { label: "FAQ", href: "/faq" },
                { label: "Returns & Refunds", href: "/returns" },
                { label: "Shipping Info", href: "/shipping" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-[#FDAA1C] transition-colors duration-200 text-sm flex items-center group"
                  >
                    <svg className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-[23px] font-semibold mb-6 text-white relative">
              Get in Touch
              
            </h3>
            
            {/* Contact Info */}
            <div className="space-y-1 mb-6">
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 text-[#FDAA1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <a href="mailto:support@ecoharvest.lk" className="hover:text-[#FDAA1C] transition-colors">
                  support@ecoharvest.lk
                </a>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 text-[#FDAA1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span>+94 112 345 678</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-8 h-8  rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-4 h-4 text-[#FDAA1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span>Colombo, Sri Lanka</span>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-sm font-semibold text-gray-200 mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                {[
                  { href: "https://facebook.com/ecoharvest", icon: "M18.77 7.46H15.5v-1.4c0-.74.18-.93.93-.93H18.77V2.5h-3.4c-2.68 0-4.14 1.39-4.14 3.9v1.06h-2.6v2.83h2.6V19h4.14v-8.71h2.83L18.77 7.46z" },
                  { href: "https://twitter.com/ecoharvest", icon: "M23.32 4.56c-.88.39-1.83.66-2.83.78 1.02-.61 1.8-1.57 2.17-2.72-.95.56-2.01.97-3.13 1.2-.9-.96-2.18-1.56-3.59-1.56-2.72 0-4.92 2.2-4.92 4.92 0 .39.05.76.13 1.12-4.09-.2-7.72-2.16-10.14-5.14-.42.73-.67 1.57-.67 2.48 0 1.71.87 3.22 2.19 4.1-.81-.03-1.57-.25-2.23-.62v.06c0 2.38 1.69 4.37 3.95 4.83-.41.11-.85.17-1.3.17-.31 0-.62-.03-.92-.09.63 1.95 2.45 3.38 4.6 3.42-1.68 1.32-3.81 2.1-6.12 2.1-.4 0-.79-.02-1.17-.07 2.18 1.4 4.77 2.21 7.56 2.21 9.05 0 14-7.5 14-13.99 0-.21 0-.42-.01-.63.96-.69 1.8-1.56 2.46-2.55z" },
                  { href: "https://instagram.com/ecoharvest", icon: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.69-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07c-4.35.2-6.78 2.63-6.98 6.98C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.35 2.63 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.63 6.98-6.98C23.99 15.67 24 15.26 24 12s-.01-3.67-.07-4.95c-.2-4.35-2.63-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" },
                  { href: "https://linkedin.com/company/ecoharvest", icon: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43c-1.14 0-2.07-.93-2.07-2.07s.93-2.07 2.07-2.07 2.07.93 2.07 2.07-.93 2.07-2.07 2.07zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href} 
                    className="w-10 h-10 bg-gray-800 hover:bg-[#FDAA1C] rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        

        {/* Copyright */}
        <div className="border-t border-gray-800 pb-3 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>© {new Date().getFullYear()} EcoHarvest. All Rights Reserved.</p>
          </div>
         
        </div>
      </div>
    </footer>
  );
};

export default Footer;