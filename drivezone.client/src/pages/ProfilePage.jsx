import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMemberContext } from '../context/MemberContext';
import { memberService, memberUtils } from '../services/memberService';

export const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const { member, updateMember, isAuthenticated } = useMemberContext();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({});
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const isWelcome = searchParams.get('welcome') === 'true';

  useEffect(() => {
    if (isAuthenticated && member) {
      setProfileData(member);
      loadLoyaltyData();
    }
  }, [isAuthenticated, member]);

  useEffect(() => {
    if (isWelcome) {
      setSuccess('Hoş geldiniz! Hesabınız başarıyla oluşturuldu.');
    }
  }, [isWelcome]);

  const loadLoyaltyData = async () => {
    try {
      const loyalty = await memberService.getLoyaltyInfo();
      setLoyaltyData(loyalty);
    } catch (error) {
      console.error('Error loading loyalty data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await memberService.updateProfile(profileData);
      
      if (result) {
        updateMember(profileData);
        setSuccess('Profiliniz başarıyla güncellendi');
      }
    } catch (error) {
      setError(error.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // Password change logic would go here
    setSuccess('Şifre değiştirme e-postası gönderildi');
  };

  if (!isAuthenticated || !member) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2>Giriş Yapın</h2>
          <p>Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="dz-profile-tab">
      <div className="row">
        <div className="col-lg-8">
          <form onSubmit={handleProfileUpdate}>
            <div className="card-dz mb-4">
              <div className="card-dz-header">
                <h5>Kişisel Bilgiler</h5>
              </div>
              <div className="card-dz-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group-dz mb-3">
                      <label className="form-label-dz">Ad</label>
                      <input
                        type="text"
                        name="firstName"
                        className="form-control-dz"
                        value={profileData.firstName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-dz mb-3">
                      <label className="form-label-dz">Soyad</label>
                      <input
                        type="text"
                        name="lastName"
                        className="form-control-dz"
                        value={profileData.lastName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group-dz mb-3">
                  <label className="form-label-dz">E-posta</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control-dz"
                    value={profileData.email || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group-dz mb-3">
                  <label className="form-label-dz">Telefon</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="form-control-dz"
                    value={profileData.phoneNumber || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group-dz mb-3">
                  <label className="form-label-dz">Adres</label>
                  <textarea
                    name="fullAddress"
                    className="form-control-dz"
                    rows="3"
                    value={profileData.fullAddress || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group-dz mb-3">
                      <label className="form-label-dz">Şehir</label>
                      <input
                        type="text"
                        name="city"
                        className="form-control-dz"
                        value={profileData.city || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-dz mb-3">
                      <label className="form-label-dz">Posta Kodu</label>
                      <input
                        type="text"
                        name="zipCode"
                        className="form-control-dz"
                        value={profileData.zipCode || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-dz mb-4">
              <div className="card-dz-header">
                <h5>Ehliyet Bilgileri</h5>
              </div>
              <div className="card-dz-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group-dz mb-3">
                      <label className="form-label-dz">Ehliyet Numarası</label>
                      <input
                        type="text"
                        name="driverLicenseNumber"
                        className="form-control-dz"
                        value={profileData.driverLicenseNumber || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group-dz mb-3">
                      <label className="form-label-dz">Geçerlilik Tarihi</label>
                      <input
                        type="date"
                        name="driverLicenseExpiry"
                        className="form-control-dz"
                        value={profileData.driverLicenseExpiry ? new Date(profileData.driverLicenseExpiry).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                {profileData.driverLicenseExpiry && (
                  <div className={`alert ${memberUtils.isDriverLicenseValid(profileData.driverLicenseExpiry) ? 'alert-success' : 'alert-warning'}`}>
                    <i className={`fas ${memberUtils.isDriverLicenseValid(profileData.driverLicenseExpiry) ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                    Ehliyet durumu: {memberUtils.isDriverLicenseValid(profileData.driverLicenseExpiry) ? 'Geçerli' : 'Geçerlilik süresi yakında dolacak'}
                  </div>
                )}
              </div>
            </div>

            <div className="text-end">
              <button
                type="submit"
                className="btn-dz-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="loading-dz me-2"></div>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Değişiklikleri Kaydet
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="col-lg-4">
          <div className="card-dz">
            <div className="card-dz-header">
              <h5>Üyelik Bilgileri</h5>
            </div>
            <div className="card-dz-body">
              <div className="dz-membership-info">
                <div className="dz-member-tier mb-3">
                  <span className={`dz-tier-badge dz-tier-${member.membershipLevel?.toLowerCase()}`}>
                    {memberUtils.getMembershipTierDisplay(member.membershipLevel)}
                  </span>
                </div>
                
                <div className="dz-member-stats">
                  <div className="dz-stat-row">
                    <span>Üyelik Tarihi:</span>
                    <span>{new Date(member.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="dz-stat-row">
                    <span>Loyalty Puanları:</span>
                    <span className="text-dz-accent fw-bold">{member.loyaltyPoints || 0}</span>
                  </div>
                  <div className="dz-stat-row">
                    <span>Toplam Harcama:</span>
                    <span>{memberUtils.formatCurrency(member.totalSpent || 0)}</span>
                  </div>
                  <div className="dz-stat-row">
                    <span>VIP Üyelik:</span>
                    <span className={member.isVipMember ? 'text-dz-accent' : 'text-muted'}>
                      {member.isVipMember ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
                
                {loyaltyData && (
                  <div className="dz-loyalty-progress mt-3">
                    <small className="text-muted">Sonraki seviye için:</small>
                    <div className="progress mt-1">
                      <div 
                        className="progress-bar bg-dz-accent" 
                        style={{ width: `${loyaltyData.progressToNext}%` }}
                      ></div>
                    </div>
                    <small className="text-muted">
                      {loyaltyData.pointsToNextLevel} puan kaldı
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="dz-security-tab">
      <div className="row">
        <div className="col-lg-6">
          <div className="card-dz">
            <div className="card-dz-header">
              <h5>Şifre Değiştir</h5>
            </div>
            <div className="card-dz-body">
              <form onSubmit={handlePasswordChange}>
                <div className="form-group-dz mb-3">
                  <label className="form-label-dz">Mevcut Şifre</label>
                  <input
                    type="password"
                    className="form-control-dz"
                    placeholder="Mevcut şifrenizi girin"
                  />
                </div>
                
                <div className="form-group-dz mb-3">
                  <label className="form-label-dz">Yeni Şifre</label>
                  <input
                    type="password"
                    className="form-control-dz"
                    placeholder="Yeni şifrenizi girin"
                  />
                </div>
                
                <div className="form-group-dz mb-3">
                  <label className="form-label-dz">Yeni Şifre (Tekrar)</label>
                  <input
                    type="password"
                    className="form-control-dz"
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>
                
                <button type="submit" className="btn-dz-primary">
                  <i className="fas fa-lock me-2"></i>
                  Şifreyi Değiştir
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6">
          <div className="card-dz">
            <div className="card-dz-header">
              <h5>Güvenlik Ayarları</h5>
            </div>
            <div className="card-dz-body">
              <div className="dz-security-options">
                <div className="dz-security-item">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="emailNotifications"
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor="emailNotifications">
                      E-posta Bildirimleri
                    </label>
                  </div>
                  <small className="text-muted">
                    Rezervasyon ve kampanya bildirimleri
                  </small>
                </div>
                
                <div className="dz-security-item">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="smsNotifications"
                    />
                    <label className="form-check-label" htmlFor="smsNotifications">
                      SMS Bildirimleri
                    </label>
                  </div>
                  <small className="text-muted">
                    Rezervasyon onayları ve hatırlatmalar
                  </small>
                </div>
                
                <div className="dz-security-item">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="marketingEmails"
                      defaultChecked
                    />
                    <label className="form-check-label" htmlFor="marketingEmails">
                      Pazarlama E-postaları
                    </label>
                  </div>
                  <small className="text-muted">
                    Özel teklifler ve kampanyalar
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoyaltyTab = () => (
    <div className="dz-loyalty-tab">
      {loyaltyData ? (
        <div className="row">
          <div className="col-lg-8">
            <div className="card-dz mb-4">
              <div className="card-dz-header">
                <h5>Loyalty Program Genel Bakış</h5>
              </div>
              <div className="card-dz-body">
                <div className="dz-loyalty-overview">
                  <div className="row text-center">
                    <div className="col-md-3">
                      <div className="dz-loyalty-stat">
                        <h3 className="text-dz-accent">{loyaltyData.currentPoints}</h3>
                        <p>Mevcut Puanlar</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="dz-loyalty-stat">
                        <h3 className="text-dz-primary">{loyaltyData.totalEarned}</h3>
                        <p>Toplam Kazanılan</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="dz-loyalty-stat">
                        <h3 className="text-dz-success">{loyaltyData.totalRedeemed}</h3>
                        <p>Kullanılan Puanlar</p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="dz-loyalty-stat">
                        <h3 className="text-dz-info">{loyaltyData.pointsToNextLevel}</h3>
                        <p>Sonraki Seviye</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-dz">
              <div className="card-dz-header">
                <h5>Puan Geçmişi</h5>
              </div>
              <div className="card-dz-body">
                <div className="dz-loyalty-history">
                  {loyaltyData.history?.map((item, index) => (
                    <div key={index} className="dz-loyalty-item">
                      <div className="dz-loyalty-icon">
                        <i className={`fas ${item.type === 'earned' ? 'fa-plus-circle text-dz-success' : 'fa-minus-circle text-dz-danger'}`}></i>
                      </div>
                      <div className="dz-loyalty-details">
                        <h6>{item.description}</h6>
                        <small className="text-muted">{new Date(item.date).toLocaleDateString('tr-TR')}</small>
                      </div>
                      <div className="dz-loyalty-points">
                        <span className={item.type === 'earned' ? 'text-dz-success' : 'text-dz-danger'}>
                          {item.type === 'earned' ? '+' : '-'}{item.points}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card-dz">
              <div className="card-dz-header">
                <h5>Avantajlar</h5>
              </div>
              <div className="card-dz-body">
                <div className="dz-loyalty-benefits">
                  <div className="dz-benefit-item">
                    <i className="fas fa-star text-dz-accent"></i>
                    <span>Her 100₺ harcamada 10 puan</span>
                  </div>
                  <div className="dz-benefit-item">
                    <i className="fas fa-gift text-dz-primary"></i>
                    <span>500 puan = 50₺ indirim</span>
                  </div>
                  <div className="dz-benefit-item">
                    <i className="fas fa-crown text-dz-success"></i>
                    <span>VIP üyelik avantajları</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="loading-dz"></div>
          <p>Loyalty bilgileri yükleniyor...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="dz-profile-page">
      <div className="container py-4">
        {/* Profile Header */}
        <div className="dz-profile-header mb-4">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center">
                <div className="dz-profile-avatar me-3">
                  <div className="dz-avatar-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <div>
                  <h2 className="dz-heading-2 mb-1">
                    {memberUtils.getDashboardGreeting(member)}
                  </h2>
                  <p className="text-dz-primary mb-0">
                    {memberUtils.getMembershipTierDisplay(member.membershipLevel)} Üye
                    {member.isVipMember && <span className="ms-2 badge bg-dz-accent">VIP</span>}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="dz-profile-stats">
                <span className="dz-stat-item me-3">
                  <i className="fas fa-calendar-check text-dz-success"></i>
                  <span>Üye: {memberUtils.calculateAge(member.createdAt)} gün</span>
                </span>
                <span className="dz-stat-item">
                  <i className="fas fa-star text-dz-accent"></i>
                  <span>{member.loyaltyPoints || 0} Puan</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="fas fa-check-circle me-2"></i>
            {success}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setSuccess('')}
            ></button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError('')}
            ></button>
          </div>
        )}

        {/* Profile Navigation */}
        <div className="dz-profile-nav mb-4">
          <ul className="nav nav-tabs dz-nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="fas fa-user me-2"></i>
                Profil Bilgileri
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <i className="fas fa-shield-alt me-2"></i>
                Güvenlik
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'loyalty' ? 'active' : ''}`}
                onClick={() => setActiveTab('loyalty')}
              >
                <i className="fas fa-star me-2"></i>
                Loyalty Program
              </button>
            </li>
          </ul>
        </div>

        {/* Tab Content */}
        <div className="dz-profile-content">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'loyalty' && renderLoyaltyTab()}
        </div>
      </div>
    </div>
  );
};
