import React from 'react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="dz-about-page">
      {/* Hero Section */}
      <section className="dz-hero-about py-5" style={{
        background: 'linear-gradient(135deg, var(--dz-primary) 0%, var(--dz-primary-800) 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="dz-heading-1 text-white mb-4">
                DriveZone Hakkında
              </h1>
              <p className="dz-text-lead text-white mb-4">
                Türkiye'nin önde gelen premium araç kiralama platformu olarak, 
                2024 yılından beri müşterilerimize en kaliteli hizmeti sunuyoruz.
              </p>
              <div className="dz-stats-inline">
                <div className="dz-stat-item me-4">
                  <h3 className="text-dz-accent">500+</h3>
                  <p className="mb-0">Premium Araç</p>
                </div>
                <div className="dz-stat-item me-4">
                  <h3 className="text-dz-accent">50K+</h3>
                  <p className="mb-0">Mutlu Müşteri</p>
                </div>
                <div className="dz-stat-item">
                  <h3 className="text-dz-accent">25+</h3>
                  <p className="mb-0">Şehir</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="dz-hero-image">
                <img 
                  src="/images/about-hero.jpg" 
                  alt="DriveZone About" 
                  className="img-fluid rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="dz-mission py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="dz-mission-card">
                <div className="dz-mission-icon">
                  <i className="fas fa-bullseye text-dz-primary"></i>
                </div>
                <h4>Misyonumuz</h4>
                <p>
                  Müşterilerimize premium araç kiralama deneyimi sunarak, 
                  her yolculuğu unutulmaz kılmak ve seyahat özgürlüğünü 
                  herkes için erişilebilir hale getirmek.
                </p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="dz-mission-card">
                <div className="dz-mission-icon">
                  <i className="fas fa-eye text-dz-success"></i>
                </div>
                <h4>Vizyonumuz</h4>
                <p>
                  Türkiye'nin ve Avrupa'nın en güvenilir ve yenilikçi 
                  araç kiralama platformu olarak, teknoloji ile mükemmel 
                  hizmeti birleştiren lider konumda olmak.
                </p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="dz-mission-card">
                <div className="dz-mission-icon">
                  <i className="fas fa-heart text-dz-accent"></i>
                </div>
                <h4>Değerlerimiz</h4>
                <p>
                  Müşteri memnuniyeti, güvenlik, şeffaflık, sürdürülebilirlik 
                  ve sürekli yenilik değerlerimizin temelini oluşturur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="dz-story py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="dz-heading-2 mb-4">Hikayemiz</h2>
              <p className="mb-4">
                DriveZone, araç kiralama sektöründeki eksiklikleri gören ve 
                müşteri deneyimini tamamen yeniden tasarlamak isteyen bir ekip 
                tarafından 2024 yılında kuruldu.
              </p>
              <p className="mb-4">
                Geleneksel araç kiralama şirketlerinin karmaşık süreçleri, 
                gizli ücretleri ve müşteri odaklı olmayan yaklaşımları yerine, 
                şeffaf, teknoloji odaklı ve premium bir hizmet sunmayı hedefledik.
              </p>
              <p className="mb-4">
                Bugün 500'ün üzerinde premium araçla, 25'ten fazla şehirde 
                hizmet veriyoruz ve 50.000'den fazla müşterimizin güvenini 
                kazandık.
              </p>
              <div className="dz-story-features">
                <div className="dz-feature-item">
                  <i className="fas fa-check-circle text-dz-success me-2"></i>
                  <span>%100 Dijital Rezervasyon</span>
                </div>
                <div className="dz-feature-item">
                  <i className="fas fa-check-circle text-dz-success me-2"></i>
                  <span>24/7 Müşteri Desteği</span>
                </div>
                <div className="dz-feature-item">
                  <i className="fas fa-check-circle text-dz-success me-2"></i>
                  <span>Gizli Ücret Yok</span>
                </div>
                <div className="dz-feature-item">
                  <i className="fas fa-check-circle text-dz-success me-2"></i>
                  <span>Premium Araç Garantisi</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="dz-story-timeline">
                <div className="dz-timeline-item">
                  <div className="dz-timeline-marker">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div className="dz-timeline-content">
                    <h5>2024 Q1</h5>
                    <p>DriveZone fikri doğdu ve geliştirmeye başlandı</p>
                  </div>
                </div>
                <div className="dz-timeline-item">
                  <div className="dz-timeline-marker">
                    <i className="fas fa-rocket"></i>
                  </div>
                  <div className="dz-timeline-content">
                    <h5>2024 Q2</h5>
                    <p>Platform beta versiyonu tamamlandı</p>
                  </div>
                </div>
                <div className="dz-timeline-item">
                  <div className="dz-timeline-marker">
                    <i className="fas fa-car"></i>
                  </div>
                  <div className="dz-timeline-content">
                    <h5>2024 Q3</h5>
                    <p>İlk 100 araçlık filo ile hizmete başladık</p>
                  </div>
                </div>
                <div className="dz-timeline-item">
                  <div className="dz-timeline-marker">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <div className="dz-timeline-content">
                    <h5>2024 Q4</h5>
                    <p>500+ araç, 25+ şehir, 50K+ mutlu müşteri</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="dz-team py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="dz-heading-2">Ekibimiz</h2>
            <p className="dz-text-lead text-muted">
              DriveZone'u mükemmelliğe taşıyan uzman ekibimiz
            </p>
          </div>
          
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="dz-team-card">
                <div className="dz-team-avatar">
                  <img src="/images/team/ceo.jpg" alt="CEO" />
                </div>
                <div className="dz-team-info">
                  <h5>Ahmet Yılmaz</h5>
                  <p className="text-muted">CEO & Kurucu</p>
                  <div className="dz-social-links">
                    <a href="#" className="text-dz-primary me-2">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="#" className="text-dz-primary">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="dz-team-card">
                <div className="dz-team-avatar">
                  <img src="/images/team/cto.jpg" alt="CTO" />
                </div>
                <div className="dz-team-info">
                  <h5>Elif Kaya</h5>
                  <p className="text-muted">CTO</p>
                  <div className="dz-social-links">
                    <a href="#" className="text-dz-primary me-2">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="#" className="text-dz-primary">
                      <i className="fab fa-github"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="dz-team-card">
                <div className="dz-team-avatar">
                  <img src="/images/team/operations.jpg" alt="Operations" />
                </div>
                <div className="dz-team-info">
                  <h5>Mehmet Demir</h5>
                  <p className="text-muted">Operasyon Direktörü</p>
                  <div className="dz-social-links">
                    <a href="#" className="text-dz-primary me-2">
                      <i className="fab fa-linkedin"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="dz-team-card">
                <div className="dz-team-avatar">
                  <img src="/images/team/marketing.jpg" alt="Marketing" />
                </div>
                <div className="dz-team-info">
                  <h5>Ayşe Öztürk</h5>
                  <p className="text-muted">Pazarlama Direktörü</p>
                  <div className="dz-social-links">
                    <a href="#" className="text-dz-primary me-2">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="#" className="text-dz-primary">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="dz-awards py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="dz-heading-2">Ödüllerimiz</h2>
            <p className="dz-text-lead text-muted">
              Sektördeki başarılarımız ve aldığımız ödüller
            </p>
          </div>
          
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="dz-award-card text-center">
                <div className="dz-award-icon">
                  <i className="fas fa-trophy text-dz-accent"></i>
                </div>
                <h5>En İyi Startup 2024</h5>
                <p className="text-muted">TechCrunch Türkiye</p>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="dz-award-card text-center">
                <div className="dz-award-icon">
                  <i className="fas fa-medal text-dz-primary"></i>
                </div>
                <h5>Müşteri Memnuniyeti</h5>
                <p className="text-muted">%98 Memnuniyet Oranı</p>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="dz-award-card text-center">
                <div className="dz-award-icon">
                  <i className="fas fa-star text-dz-success"></i>
                </div>
                <h5>5 Yıldız Platform</h5>
                <p className="text-muted">App Store & Google Play</p>
              </div>
            </div>
            
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="dz-award-card text-center">
                <div className="dz-award-icon">
                  <i className="fas fa-leaf text-dz-info"></i>
                </div>
                <h5>Çevre Dostu</h5>
                <p className="text-muted">%30 Hibrit/Elektrikli Filo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="dz-contact-cta py-5">
        <div className="container">
          <div className="dz-cta-card text-center">
            <h2 className="dz-heading-2 mb-4">Bizimle İletişime Geçin</h2>
            <p className="dz-text-lead mb-4">
              Sorularınız mı var? DriveZone ekibi size yardımcı olmak için burada!
            </p>
            <div className="dz-contact-methods">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="dz-contact-method">
                    <i className="fas fa-phone text-dz-primary"></i>
                    <h5>Telefon</h5>
                    <p>+90 212 123 45 67</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="dz-contact-method">
                    <i className="fas fa-envelope text-dz-success"></i>
                    <h5>E-posta</h5>
                    <p>info@drivezone.com</p>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="dz-contact-method">
                    <i className="fas fa-map-marker-alt text-dz-accent"></i>
                    <h5>Adres</h5>
                    <p>Maslak, İstanbul</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/contact" className="btn-dz-primary me-3">
                <i className="fas fa-envelope me-2"></i>
                İletişime Geç
              </Link>
              <Link to="/register" className="btn-dz-accent">
                <i className="fas fa-user-plus me-2"></i>
                Üye Ol
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
