import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMemberContext } from '../context/MemberContext';
import { getBookingById, cancelBooking } from '../services/bookingService';
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../utils/constants';

export const BookingDetailsPage = () => {
    const { bookingId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isLoggedIn, member } = useMemberContext();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const isSuccess = searchParams.get('success') === 'true';

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }

        if (bookingId) {
            loadBookingDetails();
        }
    }, [bookingId, isLoggedIn]);

    const loadBookingDetails = async () => {
        setLoading(true);
        setError('');

        try {
            const bookingData = await getBookingById(bookingId);
            setBooking(bookingData);
        } catch (error) {
            setError('Rezervasyon detayları yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) {
            alert('Lütfen iptal nedenini belirtin.');
            return;
        }

        setCancelling(true);

        try {
            await cancelBooking(bookingId, cancelReason);
            setBooking(prev => ({ ...prev, status: 'Cancelled' }));
            setShowCancelModal(false);
            alert('Rezervasyonunuz başarıyla iptal edildi.');
        } catch (error) {
            alert('Rezervasyon iptal edilirken hata oluştu: ' + error.message);
        } finally {
            setCancelling(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        const color = BOOKING_STATUS_COLORS[status] || '#6c757d';
        return {
            backgroundColor: color,
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.875rem',
            fontWeight: '500'
        };
    };

    const canCancelBooking = () => {
        if (!booking) return false;
        
        const cancelableStatuses = ['Pending', 'Confirmed'];
        const isStatusCancelable = cancelableStatuses.includes(booking.status);
        const isNotStarted = new Date(booking.bookingStartDate) > new Date();
        
        return isStatusCancelable && isNotStarted;
    };

    if (loading) {
        return (
            <div className="dz-booking-details-page">
                <div className="container">
                    <div className="dz-loading-state text-center py-5">
                        <div className="spinner-border dz-spinner-primary" role="status">
                            <span className="visually-hidden">Yükleniyor...</span>
                        </div>
                        <p className="mt-3">Rezervasyon detayları yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dz-booking-details-page">
                <div className="container">
                    <div className="dz-error-state text-center py-5">
                        <div className="dz-error-icon mb-3">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h4>Hata Oluştu</h4>
                        <p className="text-muted mb-4">{error}</p>
                        <button 
                            className="btn dz-btn-primary"
                            onClick={() => navigate('/my-bookings')}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            Rezervasyonlarıma Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="dz-booking-details-page">
                <div className="container">
                    <div className="dz-empty-state text-center py-5">
                        <div className="dz-empty-icon mb-3">
                            <i className="fas fa-calendar-times"></i>
                        </div>
                        <h4>Rezervasyon Bulunamadı</h4>
                        <p className="text-muted mb-4">
                            Aradığınız rezervasyon bulunamadı veya erişim izniniz yok.
                        </p>
                        <button 
                            className="btn dz-btn-primary"
                            onClick={() => navigate('/my-bookings')}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            Rezervasyonlarıma Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dz-booking-details-page">
            <div className="container">
                {/* Success Message */}
                {isSuccess && (
                    <div className="alert alert-success dz-alert mb-4" role="alert">
                        <i className="fas fa-check-circle me-2"></i>
                        <strong>Rezervasyon Oluşturuldu!</strong> Rezervasyonunuz başarıyla oluşturuldu ve onay için değerlendirilecek.
                    </div>
                )}

                {/* Page Header */}
                <div className="dz-page-header py-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <a href="/my-bookings">Rezervasyonlarım</a>
                                    </li>
                                    <li className="breadcrumb-item active">Rezervasyon Detayı</li>
                                </ol>
                            </nav>
                            <h1 className="dz-page-title">Rezervasyon Detayları</h1>
                            <p className="dz-page-subtitle">
                                Rezervasyon No: {booking.bookingReference}
                            </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <span style={getStatusBadgeClass(booking.status)}>
                                {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Booking Information */}
                    <div className="col-lg-8 mb-4">
                        <div className="dz-card">
                            <div className="dz-card-header">
                                <h5 className="mb-0">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Rezervasyon Bilgileri
                                </h5>
                            </div>
                            <div className="dz-card-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Rezervasyon No</label>
                                        <p className="mb-0">{booking.bookingReference}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Durum</label>
                                        <p className="mb-0">
                                            <span style={getStatusBadgeClass(booking.status)}>
                                                {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Alış Tarihi</label>
                                        <p className="mb-0">
                                            <i className="fas fa-calendar-plus me-2"></i>
                                            {formatDate(booking.bookingStartDate)}
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Dönüş Tarihi</label>
                                        <p className="mb-0">
                                            <i className="fas fa-calendar-minus me-2"></i>
                                            {formatDate(booking.bookingEndDate)}
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Sigorta Türü</label>
                                        <p className="mb-0">
                                            <i className="fas fa-shield-alt me-2"></i>
                                            {booking.insuranceType}
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Oluşturma Tarihi</label>
                                        <p className="mb-0">{formatDate(booking.createdAt)}</p>
                                    </div>
                                    {booking.specialRequests && (
                                        <div className="col-12 mb-3">
                                            <label className="form-label fw-bold">Özel İstekler</label>
                                            <p className="mb-0">{booking.specialRequests}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Information */}
                        {booking.vehicle && (
                            <div className="dz-card mt-4">
                                <div className="dz-card-header">
                                    <h5 className="mb-0">
                                        <i className="fas fa-car me-2"></i>
                                        Araç Bilgileri
                                    </h5>
                                </div>
                                <div className="dz-card-body">
                                    <div className="row align-items-center">
                                        <div className="col-md-4">
                                            <img 
                                                src={booking.vehicle.imageUrl || `/images/vehicles/${booking.vehicle.make.toLowerCase()}-${booking.vehicle.model.toLowerCase()}.jpg`}
                                                alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                                                className="img-fluid rounded"
                                                style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="col-md-8">
                                            <h4>{booking.vehicle.make} {booking.vehicle.model}</h4>
                                            <div className="row">
                                                <div className="col-sm-6 mb-2">
                                                    <i className="fas fa-calendar me-2"></i>
                                                    <strong>Yıl:</strong> {booking.vehicle.manufactureYear}
                                                </div>
                                                <div className="col-sm-6 mb-2">
                                                    <i className="fas fa-palette me-2"></i>
                                                    <strong>Renk:</strong> {booking.vehicle.color}
                                                </div>
                                                <div className="col-sm-6 mb-2">
                                                    <i className="fas fa-users me-2"></i>
                                                    <strong>Koltuk:</strong> {booking.vehicle.seatingCapacity}
                                                </div>
                                                <div className="col-sm-6 mb-2">
                                                    <i className="fas fa-cog me-2"></i>
                                                    <strong>Vites:</strong> {booking.vehicle.transmission}
                                                </div>
                                                <div className="col-sm-6 mb-2">
                                                    <i className="fas fa-gas-pump me-2"></i>
                                                    <strong>Yakıt:</strong> {booking.vehicle.fuelType}
                                                </div>
                                                <div className="col-sm-6 mb-2">
                                                    <i className="fas fa-id-card me-2"></i>
                                                    <strong>Plaka:</strong> {booking.vehicle.licensePlate}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Summary & Actions */}
                    <div className="col-lg-4">
                        {/* Payment Summary */}
                        <div className="dz-card mb-4">
                            <div className="dz-card-header">
                                <h5 className="mb-0">
                                    <i className="fas fa-money-bill-wave me-2"></i>
                                    Ödeme Özeti
                                </h5>
                            </div>
                            <div className="dz-card-body">
                                <div className="dz-payment-breakdown">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Araç Kirası:</span>
                                        <span>{formatCurrency(booking.baseAmount)}</span>
                                    </div>
                                    {booking.insuranceCost > 0 && (
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Sigorta:</span>
                                            <span>{formatCurrency(booking.insuranceCost)}</span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>KDV (%18):</span>
                                        <span>{formatCurrency(booking.taxAmount)}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-3">
                                        <strong>Toplam:</strong>
                                        <strong className="text-success">{formatCurrency(booking.totalAmount)}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Depozito:</span>
                                        <span>{formatCurrency(booking.securityDeposit)}</span>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Ödeme Durumu: <strong>{booking.paymentStatus || 'Beklemede'}</strong>
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="dz-card">
                            <div className="dz-card-header">
                                <h5 className="mb-0">
                                    <i className="fas fa-tasks me-2"></i>
                                    İşlemler
                                </h5>
                            </div>
                            <div className="dz-card-body">
                                <div className="d-grid gap-2">
                                    {canCancelBooking() && (
                                        <button
                                            className="btn dz-btn-danger"
                                            onClick={() => setShowCancelModal(true)}
                                        >
                                            <i className="fas fa-times me-2"></i>
                                            Rezervasyonu İptal Et
                                        </button>
                                    )}
                                    
                                    <button
                                        className="btn dz-btn-outline-primary"
                                        onClick={() => window.print()}
                                    >
                                        <i className="fas fa-print me-2"></i>
                                        Yazdır
                                    </button>

                                    <button
                                        className="btn dz-btn-outline-secondary"
                                        onClick={() => navigate('/my-bookings')}
                                    >
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Rezervasyonlarıma Dön
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cancel Modal */}
                {showCancelModal && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Rezervasyonu İptal Et</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowCancelModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p>Bu rezervasyonu iptal etmek istediğinizden emin misiniz?</p>
                                    <div className="mb-3">
                                        <label className="form-label">İptal Nedeni *</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            placeholder="Lütfen iptal nedeninizi belirtin..."
                                        />
                                    </div>
                                    <div className="alert alert-warning">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        <strong>Uyarı:</strong> İptal politikamıza göre iade tutarı hesaplanacaktır.
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowCancelModal(false)}
                                    >
                                        Vazgeç
                                    </button>
                                    <button
                                        type="button"
                                        className="btn dz-btn-danger"
                                        onClick={handleCancelBooking}
                                        disabled={cancelling || !cancelReason.trim()}
                                    >
                                        {cancelling ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                İptal Ediliyor...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-times me-2"></i>
                                                İptal Et
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 