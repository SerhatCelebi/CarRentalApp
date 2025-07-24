import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMemberContext } from '../context/MemberContext';
import { memberService } from '../services/memberService';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useMemberContext();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectUrl);
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('E-posta ve şifre alanları zorunludur');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await memberService.login({
        email: formData.email,
        password: formData.password
      });

      if (result && result.token) {
        await login(result.token, result.member);
        navigate(redirectUrl);
      } else {
        setError('Giriş başarısız oldu. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Giriş sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dz-auth-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="dz-auth-card">
              <div className="dz-auth-header text-center mb-4">
                <h2 className="dz-heading-2">DriveZone'a Giriş</h2>
                <p className="dz-text-lead text-muted">
                  Premium araç kiralama hesabınıza giriş yapın
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="dz-form">
                <div className="form-group-dz mb-3">
                  <label htmlFor="email" className="form-label-dz">
                    <i className="fas fa-envelope me-2"></i>
                    E-posta Adresi *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control-dz"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ornek@email.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group-dz mb-3">
                  <label htmlFor="password" className="form-label-dz">
                    <i className="fas fa-lock me-2"></i>
                    Şifre *
                  </label>
                  <div className="dz-password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className="form-control-dz"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Şifrenizi girin"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="dz-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-group-dz mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      className="form-check-input"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="rememberMe" className="form-check-label">
                      Beni hatırla
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-dz-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-dz me-2"></div>
                      Giriş yapılıyor...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Giriş Yap
                    </>
                  )}
                </button>

                <div className="text-center mb-3">
                  <Link to="/forgot-password" className="dz-link">
                    Şifremi unuttum
                  </Link>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="mb-0">
                    Henüz hesabınız yok mu?{' '}
                    <Link to="/register" className="dz-link font-weight-bold">
                      Ücretsiz kayıt olun
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Features Section */}
            <div className="dz-auth-features mt-4">
              <div className="row text-center">
                <div className="col-4">
                  <div className="dz-feature-item">
                    <i className="fas fa-shield-alt text-dz-success"></i>
                    <small>Güvenli</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="dz-feature-item">
                    <i className="fas fa-clock text-dz-primary"></i>
                    <small>7/24 Destek</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="dz-feature-item">
                    <i className="fas fa-star text-dz-accent"></i>
                    <small>Premium Hizmet</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
