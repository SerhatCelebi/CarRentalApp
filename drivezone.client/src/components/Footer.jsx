import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="dz-footer">
      <div className="container">
        <div className="row">
          {/* Company Info */}
          <div className="col-lg-4 mb-4">
            <div className="dz-footer-brand">
              <img
                src="/images/drivezone-logo-white.png"
                alt="DriveZone"
                className="dz-footer-logo"
              />
              <h5>DriveZone</h5>
              <p className="dz-footer-tagline">
                Premium araç kiralama deneyimi. Türkiye'nin en güvenilir araç
                kiralama platformu.
              </p>
            </div>
            <div className="dz-social-links">
              <a href="#" className="dz-social-link">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="dz-social-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="dz-social-link">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="dz-social-link">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="dz-footer-title">Hızlı Linkler</h6>
            <ul className="dz-footer-links">
              <li>
                <Link to="/">Ana Sayfa</Link>
              </li>
              <li>
                <Link to="/available-vehicles">Araçlar</Link>
              </li>
              <li>
                <Link to="/about">Hakkımızda</Link>
              </li>
              <li>
                <Link to="/contact">İletişim</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="dz-footer-title">Hizmetler</h6>
            <ul className="dz-footer-links">
              <li>
                <Link to="/services/daily-rental">Günlük Kiralama</Link>
              </li>
              <li>
                <Link to="/services/long-term">Uzun Dönem</Link>
              </li>
              <li>
                <Link to="/services/corporate">Kurumsal</Link>
              </li>
              <li>
                <Link to="/services/luxury">Luxury Araçlar</Link>
              </li>
              <li>
                <Link to="/services/airport">Havalimanı</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="dz-footer-title">Destek</h6>
            <ul className="dz-footer-links">
              <li>
                <Link to="/help">Yardım Merkezi</Link>
              </li>
              <li>
                <Link to="/faq">Sık Sorulan Sorular</Link>
              </li>
              <li>
                <Link to="/terms">Kullanım Koşulları</Link>
              </li>
              <li>
                <Link to="/privacy">Gizlilik Politikası</Link>
              </li>
              <li>
                <Link to="/insurance">Sigorta Bilgileri</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="dz-footer-title">İletişim</h6>
            <div className="dz-contact-info">
              <div className="dz-contact-item">
                <i className="fas fa-phone"></i>
                <span>0850 123 45 67</span>
              </div>
              <div className="dz-contact-item">
                <i className="fas fa-envelope"></i>
                <span>info@drivezone.com</span>
              </div>
              <div className="dz-contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>İstanbul, Türkiye</span>
              </div>
              <div className="dz-contact-item">
                <i className="fas fa-clock"></i>
                <span>7/24 Hizmet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <hr className="dz-footer-divider" />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="dz-copyright">
              © {currentYear} DriveZone. Tüm hakları saklıdır.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="dz-footer-badges">
              <img
                src="/images/badges/ssl-secure.png"
                alt="SSL Secure"
                className="dz-badge"
              />
              <img
                src="/images/badges/verified.png"
                alt="Verified"
                className="dz-badge"
              />
              <img
                src="/images/badges/customer-service.png"
                alt="24/7 Support"
                className="dz-badge"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
