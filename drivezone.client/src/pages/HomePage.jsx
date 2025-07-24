import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllVehicles, vehicleUtils } from '../services/vehicleService';
import { useMemberContext } from '../context/MemberContext';
import { VehicleCard } from '../components/VehicleCard';
import { SearchForm } from '../components/SearchForm';

export const HomePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { member } = useMemberContext();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await getAllVehicles();
      
      if (response && response.length > 0) {
        setVehicles(response);
        // Get featured vehicles (premium and luxury categories)
        const featured = response
          .filter(v => v.category === 'Premium' || v.category === 'Luxury')
          .slice(0, 6);
        setFeaturedVehicles(featured);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Araçlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchParams) => {
    try {
      setLoading(true);
      // Implement search functionality
      const searchResults = vehicles.filter(vehicle => {
        let matches = true;
        
        if (searchParams.make && !vehicle.make.toLowerCase().includes(searchParams.make.toLowerCase())) {
          matches = false;
        }
        if (searchParams.category && vehicle.category !== searchParams.category) {
          matches = false;
        }
        if (searchParams.maxPrice && vehicle.dailyRate > searchParams.maxPrice) {
          matches = false;
        }
        
        return matches;
      });
      
      setFeaturedVehicles(searchResults.slice(0, 6));
    } catch (err) {
      console.error('Error searching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="loading-dz"></div>
        <span className="ms-2">Yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="dz-main-content">
      {/* Hero Section */}
      <section className="hero-section py-5 mb-5" style={{
        background: 'linear-gradient(135deg, var(--dz-primary) 0%, var(--dz-primary-600) 100%)',
        borderRadius: 'var(--dz-rounded-lg)',
        color: 'white'
      }}>
        <div className="container text-center">
          <h1 className="dz-heading-1 text-white mb-4">
            DriveZone'a Hoş Geldiniz
          </h1>
          <p className="dz-text-lead text-white mb-4">
            Premium araç kiralama deneyimi için doğru yerdesiniz. 
            {member ? ` Merhaba ${member.firstName}!` : ' Hemen üye olun ve özel fırsatlardan yararlanın.'}
          </p>
          {!member && (
            <div className="d-flex justify-content-center gap-3">
              <Link to="/register" className="btn-dz-accent">
                Üye Ol
              </Link>
              <Link to="/login" className="btn-dz-secondary">
                Giriş Yap
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section mb-5">
        <div className="container">
          <div className="card-dz">
            <h2 className="dz-heading-2 text-center mb-4">Araç Ara</h2>
            <SearchForm onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="featured-vehicles mb-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="dz-heading-2">Öne Çıkan Araçlar</h2>
            <Link to="/vehicles" className="btn-dz-primary">
              Tüm Araçları Gör
            </Link>
          </div>
          
          {featuredVehicles.length > 0 ? (
            <div className="row g-4">
              {featuredVehicles.map(vehicle => (
                <div key={vehicle.vehicleId} className="col-lg-4 col-md-6">
                  <VehicleCard vehicle={vehicle} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="dz-text-lead text-muted">Henüz araç bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section mb-5">
        <div className="container">
          <h2 className="dz-heading-2 text-center mb-5">Neden DriveZone?</h2>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="card-dz text-center">
                <div className="mb-3">
                  <i className="fas fa-car text-dz-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="dz-heading-3">Premium Araç Filosu</h3>
                <p className="dz-text-lead">
                  En yeni model ve lüks araçlardan oluşan geniş filomuzla her ihtiyacınıza uygun araç.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card-dz text-center">
                <div className="mb-3">
                  <i className="fas fa-shield-alt text-dz-success" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="dz-heading-3">Güvenli Kiralama</h3>
                <p className="dz-text-lead">
                  Comprehensive sigorta seçenekleri ve 7/24 roadside yardım hizmeti ile güvenli yolculuk.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card-dz text-center">
                <div className="mb-3">
                  <i className="fas fa-star text-dz-accent" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="dz-heading-3">Loyalty Program</h3>
                <p className="dz-text-lead">
                  Her kiralamada puan kazanın, VIP üyelik avantajlarından faydalanın.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card-dz text-center">
                <div className="mb-3">
                  <i className="fas fa-mobile-alt text-dz-info" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="dz-heading-3">Kolay Rezervasyon</h3>
                <p className="dz-text-lead">
                  Online platform ile dakikalar içinde rezervasyon yapın, mobil uygulamamızı kullanın.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card-dz text-center">
                <div className="mb-3">
                  <i className="fas fa-clock text-dz-warning" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="dz-heading-3">7/24 Hizmet</h3>
                <p className="dz-text-lead">
                  Gece gündüz kesintisiz hizmet, acil durumlarda yanınızdayız.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card-dz text-center">
                <div className="mb-3">
                  <i className="fas fa-credit-card text-dz-secondary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="dz-heading-3">Esnek Ödeme</h3>
                <p className="dz-text-lead">
                  Kredi kartı, banka kartı ve havale ile güvenli ödeme seçenekleri.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5" style={{
        backgroundColor: 'var(--dz-gray-900)',
        color: 'white',
        borderRadius: 'var(--dz-rounded-lg)',
        marginBottom: '2rem'
      }}>
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-item">
                <h3 className="dz-heading-1 text-dz-accent">500+</h3>
                <p className="dz-text-lead">Premium Araç</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-item">
                <h3 className="dz-heading-1 text-dz-primary">50.000+</h3>
                <p className="dz-text-lead">Mutlu Müşteri</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-item">
                <h3 className="dz-heading-1 text-dz-success">25+</h3>
                <p className="dz-text-lead">Şehir</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-item">
                <h3 className="dz-heading-1 text-dz-secondary">7/24</h3>
                <p className="dz-text-lead">Destek Hizmeti</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section text-center">
        <div className="container">
          <div className="card-dz">
            <h2 className="dz-heading-2">Hemen Rezervasyon Yapın</h2>
            <p className="dz-text-lead mb-4">
              DriveZone ile premium araç kiralama deneyimini yaşayın.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/vehicles" className="btn-dz-primary">
                Araçları İncele
              </Link>
              {!member && (
                <Link to="/register" className="btn-dz-accent">
                  Ücretsiz Üye Ol
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
