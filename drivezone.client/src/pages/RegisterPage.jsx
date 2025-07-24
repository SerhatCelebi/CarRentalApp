import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMemberContext } from '../context/MemberContext';
import { memberService, memberUtils } from '../services/memberService';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useMemberContext();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Personal Details
    birthDate: '',
    fullAddress: '',
    city: '',
    zipCode: '',
    country: 'Türkiye',
    
    // Step 3: Driver Info
    nationalIdNumber: '',
    driverLicenseNumber: '',
    driverLicenseExpiry: '',
    driverLicenseCountry: 'Türkiye',
    emergencyContactName: '',
    emergencyContactPhone: '',
    
    // Step 4: Agreement
    acceptTerms: false,
    acceptPrivacyPolicy: false,
    subscribeToNewsletter: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'Ad alanı zorunludur';
        if (!formData.lastName.trim()) newErrors.lastName = 'Soyad alanı zorunludur';
        if (!formData.email.trim()) {
          newErrors.email = 'E-posta alanı zorunludur';
        } else if (!memberUtils.isValidEmail(formData.email)) {
          newErrors.email = 'Geçerli bir e-posta adresi girin';
        }
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Telefon numarası zorunludur';
        } else if (!memberUtils.isValidPhoneNumber(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Geçerli bir telefon numarası girin';
        }
        if (!formData.password) {
          newErrors.password = 'Şifre alanı zorunludur';
        } else if (!memberUtils.isStrongPassword(formData.password)) {
          newErrors.password = 'Şifre en az 8 karakter, büyük/küçük harf, rakam ve özel karakter içermelidir';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        }
        break;

      case 2:
        if (!formData.birthDate) {
          newErrors.birthDate = 'Doğum tarihi zorunludur';
        } else if (!memberUtils.isEligibleForRental(formData.birthDate)) {
          newErrors.birthDate = 'Araç kiralama için en az 21 yaşında olmalısınız';
        }
        if (!formData.fullAddress.trim()) newErrors.fullAddress = 'Adres alanı zorunludur';
        if (!formData.city.trim()) newErrors.city = 'Şehir alanı zorunludur';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'Posta kodu zorunludur';
        break;

      case 3:
        if (!formData.nationalIdNumber.trim()) {
          newErrors.nationalIdNumber = 'TC Kimlik No zorunludur';
        }
        if (!formData.driverLicenseNumber.trim()) {
          newErrors.driverLicenseNumber = 'Ehliyet numarası zorunludur';
        }
        if (!formData.driverLicenseExpiry) {
          newErrors.driverLicenseExpiry = 'Ehliyet geçerlilik tarihi zorunludur';
        } else if (!memberUtils.isDriverLicenseValid(formData.driverLicenseExpiry)) {
          newErrors.driverLicenseExpiry = 'Ehliyet en az 3 ay daha geçerli olmalıdır';
        }
        break;

      case 4:
        if (!formData.acceptTerms) {
          newErrors.acceptTerms = 'Kullanım şartlarını kabul etmelisiniz';
        }
        if (!formData.acceptPrivacyPolicy) {
          newErrors.acceptPrivacyPolicy = 'Gizlilik politikasını kabul etmelisiniz';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) return;

    setLoading(true);

    try {
      const registrationData = {
        username: formData.email, // Use email as username
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullAddress: formData.fullAddress,
        zipCode: formData.zipCode,
        city: formData.city,
        country: formData.country,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate,
        nationalIdNumber: formData.nationalIdNumber,
        driverLicenseNumber: formData.driverLicenseNumber,
        driverLicenseExpiry: formData.driverLicenseExpiry,
        driverLicenseCountry: formData.driverLicenseCountry,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        acceptTerms: formData.acceptTerms,
        acceptPrivacyPolicy: formData.acceptPrivacyPolicy,
        subscribeToNewsletter: formData.subscribeToNewsletter
      };

      const result = await memberService.register(registrationData);
      
      if (result && result.token) {
        // Auto-login after successful registration
        await login(result.token, result.member);
        navigate('/profile?welcome=true');
      } else {
        setErrors({ general: 'Kayıt işlemi başarısız oldu' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: error.message || 'Kayıt sırasında bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="dz-progress-bar mb-4">
      <div className="progress">
        <div 
          className="progress-bar bg-dz-primary" 
          style={{ width: `${(currentStep / 4) * 100}%` }}
        ></div>
      </div>
      <div className="dz-progress-steps mt-2">
        {[1, 2, 3, 4].map(step => (
          <div 
            key={step} 
            className={`dz-progress-step ${currentStep >= step ? 'active' : ''}`}
          >
            <span className="dz-step-number">{step}</span>
            <span className="dz-step-label">
              {step === 1 && 'Temel Bilgiler'}
              {step === 2 && 'Kişisel Detaylar'}
              {step === 3 && 'Ehliyet Bilgileri'}
              {step === 4 && 'Onaylar'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="dz-form-step">
      <h4 className="mb-4">Temel Bilgiler</h4>
      
      <div className="row">
        <div className="col-md-6">
          <div className="form-group-dz mb-3">
            <label htmlFor="firstName" className="form-label-dz">
              Ad *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={`form-control-dz ${errors.firstName ? 'is-invalid' : ''}`}
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Adınız"
            />
            {errors.firstName && <div className="form-error-dz">{errors.firstName}</div>}
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group-dz mb-3">
            <label htmlFor="lastName" className="form-label-dz">
              Soyad *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={`form-control-dz ${errors.lastName ? 'is-invalid' : ''}`}
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Soyadınız"
            />
            {errors.lastName && <div className="form-error-dz">{errors.lastName}</div>}
          </div>
        </div>
      </div>

      <div className="form-group-dz mb-3">
        <label htmlFor="email" className="form-label-dz">
          E-posta Adresi *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-control-dz ${errors.email ? 'is-invalid' : ''}`}
          value={formData.email}
          onChange={handleInputChange}
          placeholder="ornek@email.com"
        />
        {errors.email && <div className="form-error-dz">{errors.email}</div>}
      </div>

      <div className="form-group-dz mb-3">
        <label htmlFor="phoneNumber" className="form-label-dz">
          Telefon Numarası *
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          className={`form-control-dz ${errors.phoneNumber ? 'is-invalid' : ''}`}
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="0532 123 45 67"
        />
        {errors.phoneNumber && <div className="form-error-dz">{errors.phoneNumber}</div>}
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group-dz mb-3">
            <label htmlFor="password" className="form-label-dz">
              Şifre *
            </label>
            <div className="dz-password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`form-control-dz ${errors.password ? 'is-invalid' : ''}`}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Güçlü bir şifre oluşturun"
              />
              <button
                type="button"
                className="dz-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && <div className="form-error-dz">{errors.password}</div>}
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group-dz mb-3">
            <label htmlFor="confirmPassword" className="form-label-dz">
              Şifre Tekrar *
            </label>
            <div className="dz-password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className={`form-control-dz ${errors.confirmPassword ? 'is-invalid' : ''}`}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Şifrenizi tekrar girin"
              />
              <button
                type="button"
                className="dz-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.confirmPassword && <div className="form-error-dz">{errors.confirmPassword}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="dz-form-step">
      <h4 className="mb-4">Kişisel Detaylar</h4>
      
      <div className="form-group-dz mb-3">
        <label htmlFor="birthDate" className="form-label-dz">
          Doğum Tarihi *
        </label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          className={`form-control-dz ${errors.birthDate ? 'is-invalid' : ''}`}
          value={formData.birthDate}
          onChange={handleInputChange}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
        />
        {errors.birthDate && <div className="form-error-dz">{errors.birthDate}</div>}
      </div>

      <div className="form-group-dz mb-3">
        <label htmlFor="fullAddress" className="form-label-dz">
          Tam Adres *
        </label>
        <textarea
          id="fullAddress"
          name="fullAddress"
          className={`form-control-dz ${errors.fullAddress ? 'is-invalid' : ''}`}
          value={formData.fullAddress}
          onChange={handleInputChange}
          placeholder="Mahalle, sokak, bina no gibi detaylarıyla tam adresiniz"
          rows="3"
        />
        {errors.fullAddress && <div className="form-error-dz">{errors.fullAddress}</div>}
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group-dz mb-3">
            <label htmlFor="city" className="form-label-dz">
              Şehir *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              className={`form-control-dz ${errors.city ? 'is-invalid' : ''}`}
              value={formData.city}
              onChange={handleInputChange}
              placeholder="İstanbul"
            />
            {errors.city && <div className="form-error-dz">{errors.city}</div>}
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group-dz mb-3">
            <label htmlFor="zipCode" className="form-label-dz">
              Posta Kodu *
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              className={`form-control-dz ${errors.zipCode ? 'is-invalid' : ''}`}
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder="34000"
            />
            {errors.zipCode && <div className="form-error-dz">{errors.zipCode}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="dz-form-step">
      <h4 className="mb-4">Ehliyet ve Kimlik Bilgileri</h4>
      
      <div className="form-group-dz mb-3">
        <label htmlFor="nationalIdNumber" className="form-label-dz">
          TC Kimlik Numarası *
        </label>
        <input
          type="text"
          id="nationalIdNumber"
          name="nationalIdNumber"
          className={`form-control-dz ${errors.nationalIdNumber ? 'is-invalid' : ''}`}
          value={formData.nationalIdNumber}
          onChange={handleInputChange}
          placeholder="12345678901"
          maxLength="11"
        />
        {errors.nationalIdNumber && <div className="form-error-dz">{errors.nationalIdNumber}</div>}
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group-dz mb-3">
            <label htmlFor="driverLicenseNumber" className="form-label-dz">
              Ehliyet Numarası *
            </label>
            <input
              type="text"
              id="driverLicenseNumber"
              name="driverLicenseNumber"
              className={`form-control-dz ${errors.driverLicenseNumber ? 'is-invalid' : ''}`}
              value={formData.driverLicenseNumber}
              onChange={handleInputChange}
              placeholder="ABC123456"
            />
            {errors.driverLicenseNumber && <div className="form-error-dz">{errors.driverLicenseNumber}</div>}
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="form-group-dz mb-3">
            <label htmlFor="driverLicenseExpiry" className="form-label-dz">
              Ehliyet Geçerlilik Tarihi *
            </label>
            <input
              type="date"
              id="driverLicenseExpiry"
              name="driverLicenseExpiry"
              className={`form-control-dz ${errors.driverLicenseExpiry ? 'is-invalid' : ''}`}
              value={formData.driverLicenseExpiry}
              onChange={handleInputChange}
              min={new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]}
            />
            {errors.driverLicenseExpiry && <div className="form-error-dz">{errors.driverLicenseExpiry}</div>}
          </div>
        </div>
      </div>

      <div className="form-group-dz mb-3">
        <label htmlFor="emergencyContactName" className="form-label-dz">
          Acil Durum İletişim Kişisi
        </label>
        <input
          type="text"
          id="emergencyContactName"
          name="emergencyContactName"
          className="form-control-dz"
          value={formData.emergencyContactName}
          onChange={handleInputChange}
          placeholder="Ad Soyad"
        />
      </div>

      <div className="form-group-dz mb-3">
        <label htmlFor="emergencyContactPhone" className="form-label-dz">
          Acil Durum Telefon Numarası
        </label>
        <input
          type="tel"
          id="emergencyContactPhone"
          name="emergencyContactPhone"
          className="form-control-dz"
          value={formData.emergencyContactPhone}
          onChange={handleInputChange}
          placeholder="0532 123 45 67"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="dz-form-step">
      <h4 className="mb-4">Sözleşme ve Onaylar</h4>
      
      <div className="form-group-dz mb-3">
        <div className="form-check">
          <input
            type="checkbox"
            id="acceptTerms"
            name="acceptTerms"
            className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`}
            checked={formData.acceptTerms}
            onChange={handleInputChange}
          />
          <label htmlFor="acceptTerms" className="form-check-label">
            <Link to="/terms" target="_blank" className="dz-link">
              Kullanım Şartları ve Koşulları
            </Link>
            'nı okudum ve kabul ediyorum *
          </label>
        </div>
        {errors.acceptTerms && <div className="form-error-dz">{errors.acceptTerms}</div>}
      </div>

      <div className="form-group-dz mb-3">
        <div className="form-check">
          <input
            type="checkbox"
            id="acceptPrivacyPolicy"
            name="acceptPrivacyPolicy"
            className={`form-check-input ${errors.acceptPrivacyPolicy ? 'is-invalid' : ''}`}
            checked={formData.acceptPrivacyPolicy}
            onChange={handleInputChange}
          />
          <label htmlFor="acceptPrivacyPolicy" className="form-check-label">
            <Link to="/privacy" target="_blank" className="dz-link">
              Gizlilik Politikası ve KVKK
            </Link>
            'yı okudum ve kabul ediyorum *
          </label>
        </div>
        {errors.acceptPrivacyPolicy && <div className="form-error-dz">{errors.acceptPrivacyPolicy}</div>}
      </div>

      <div className="form-group-dz mb-4">
        <div className="form-check">
          <input
            type="checkbox"
            id="subscribeToNewsletter"
            name="subscribeToNewsletter"
            className="form-check-input"
            checked={formData.subscribeToNewsletter}
            onChange={handleInputChange}
          />
          <label htmlFor="subscribeToNewsletter" className="form-check-label">
            DriveZone'un kampanya ve duyurularından haberdar olmak istiyorum
          </label>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="fas fa-info-circle me-2"></i>
        <strong>DriveZone Premium Üyelik Avantajları:</strong>
        <ul className="mt-2 mb-0">
          <li>Tüm araç kategorilerinde %5-20 indirim</li>
          <li>Öncelikli rezervasyon hakkı</li>
          <li>Ücretsiz sigorta yükseltmeleri</li>
          <li>7/24 premium müşteri desteği</li>
          <li>Loyalty puan sistemi</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="dz-auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="dz-auth-card">
              <div className="dz-auth-header text-center mb-4">
                <h2 className="dz-heading-2">DriveZone'a Üye Olun</h2>
                <p className="dz-text-lead text-muted">
                  Premium araç kiralama deneyimi için hemen kayıt olun
                </p>
              </div>

              {renderProgressBar()}

              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}

                <div className="dz-form-actions d-flex justify-content-between mt-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="btn-dz-secondary"
                      onClick={prevStep}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Geri
                    </button>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      className="btn-dz-primary ms-auto"
                      onClick={nextStep}
                    >
                      İleri
                      <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn-dz-accent ms-auto"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="loading-dz me-2"></div>
                          Kayıt oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          Hesap Oluştur
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">
                  Zaten hesabınız var mı?{' '}
                  <Link to="/login" className="dz-link font-weight-bold">
                    Giriş yapın
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
