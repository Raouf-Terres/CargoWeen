export default function Footer() {
  return (
    <footer className="relative bg-[#121B2D] py-16  top-0">
      {/* Rectangle flou */}
      <div
        className="absolute w-[618px] h-[318px] right-[10px] top-[10px] bg-[#00DDFF] blur-[200px] z-0"
      ></div>

      <div className="relative container mx-auto bg-[#FFFFFF4D] rounded-[56px] shadow-lg p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 px-4">
        {/* Logo et Carte */}
        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}
          <div className="w-[150px] mb-4">
            <img
              src="/logo.png"
              alt="Cargoween Logo"
              className="w-full h-auto"
            />
          </div>
          {/* Map */}
          <div className="w-[438px] h-[292px] bg-gray-700 rounded-[56px] overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d802.4587377969353!2d10.67790991590578!3d36.43737348009879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130299500c8b96b7%3A0x9063656468ec5150!2sCargoween!5e0!3m2!1sfr!2stn!4v1739154525299!5m2!1sfr!2stn"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          {/* Réseaux sociaux */}
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-white text-[24px]">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#" className="text-white text-[24px]">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="text-white text-[24px]">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Liens alignés */}
        <div className="flex flex-col lg:flex-row space-y-32 lg:space-y-0 lg:space-x-48">
          {/* Liens Company */}
          <div className="text-white space-y-4">
            <h3 className="text-[24px] font-medium">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">About Us</a></li>
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">Blog</a></li>
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">Careers</a></li>
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">Contact</a></li>
            </ul>
          </div>

          {/* Liens Get Help */}
          <div className="text-white space-y-4">
            <h3 className="text-[24px] font-medium">Get Help</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">Support Center</a></li>
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">FAQs</a></li>
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">Privacy Policy</a></li>
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">Terms of Service</a></li>
            </ul>
          </div>

          {/* Liens supplémentaires */}
          <div className="text-white space-y-4">
            <h3 className="text-[24px] font-medium">More</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">Pricing</a></li>
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">API Documentation</a></li>
              <li><a href="#" className="text-[18px] hover:text-[#00DDFF]">Refund Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
