import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMemberContext } from "../context/MemberContext";
import { getVehicleById } from "../services/vehicleService";
import {
  createBooking,
  calculateBookingCost,
} from "../services/bookingService";

export const VehicleBookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn, member } = useMemberContext();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [costEstimate, setCostEstimate] = useState(null);

  const [bookingData, setBookingData] = useState({
    vehicleId: searchParams.get("vehicleId") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    insuranceType: "Basic",
    specialRequests: "",
    promoCode: "",
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(
        "/login?redirect=" +
          encodeURIComponent(window.location.pathname + window.location.search)
      );
      return;
    }

    if (bookingData.vehicleId) {
      loadVehicle();
    }
  }, [bookingData.vehicleId, isLoggedIn]);

  useEffect(() => {
    if (vehicle && bookingData.startDate && bookingData.endDate) {
      calculateCost();
    }
  }, [
    vehicle,
    bookingData.startDate,
    bookingData.endDate,
    bookingData.insuranceType,
    bookingData.promoCode,
  ]);

  const loadVehicle = async () => {
    setLoading(true);
    setError("");

    try {
      const vehicleData = await getVehicleById(bookingData.vehicleId);
      setVehicle(vehicleData);
    } catch (error) {
      setError("Araç bilgileri yüklenirken hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = async () => {
    if (!vehicle || !bookingData.startDate || !bookingData.endDate) return;

    setCalculating(true);
    setCostEstimate(null);

    try {
      const cost = await calculateBookingCost({
        vehicleId: bookingData.vehicleId,
        memberId: member?.id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        insuranceType: bookingData.insuranceType,
        promoCode: bookingData.promoCode,
      });

      setCostEstimate(cost);
    } catch (error) {
      console.error("Cost calculation error:", error);
    } finally {
      setCalculating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehicle || !costEstimate) {
      setError(
        "Lütfen tüm bilgileri doldurun ve fiyat hesaplamasını bekleyin."
      );
      return;
    }

    // Validate dates
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);
    const now = new Date();

    if (startDate < now) {
      setError("Başlangıç tarihi geçmiş bir tarih olamaz.");
      return;
    }

    if (startDate >= endDate) {
      setError("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const booking = await createBooking({
        vehicleId: bookingData.vehicleId,
        bookingStartDate: bookingData.startDate,
        bookingEndDate: bookingData.endDate,
        insuranceType: bookingData.insuranceType,
        specialRequests: bookingData.specialRequests,
        promoCode: bookingData.promoCode,
      });

      // Redirect to booking confirmation
      navigate(`/booking-details/${booking.bookingId}?success=true`);
    } catch (error) {
      setError("Rezervasyon oluşturulurken hata oluştu: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const getDuration = () => {
    if (!bookingData.startDate || !bookingData.endDate) return null;

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    return {
      days: diffDays,
      hours: diffHours,
      totalHours: diffTime / (1000 * 60 * 60),
    };
  };

  if (loading) {
    return (
      <div className="dz-booking-page">
        <div className="container">
          <div className="dz-loading-state text-center py-5">
            <div className="spinner-border dz-spinner-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
            <p className="mt-3">Araç bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="dz-booking-page">
        <div className="container">
          <div className="dz-error-state text-center py-5">
            <div className="dz-error-icon mb-3">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h4>Araç bulunamadı</h4>
            <p className="text-muted mb-4">
              İstediğiniz araç bulunamadı veya artık mevcut değil.
            </p>
            <button
              className="btn dz-btn-primary"
              onClick={() => navigate("/available-vehicles")}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Araçlara Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  const duration = getDuration();

  return (
    <div className="dz-booking-page">
      <div className="container">
        {/* Page Header */}
        <div className="dz-page-header py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="/available-vehicles">Araçlar</a>
                  </li>
                  <li className="breadcrumb-item active">Rezervasyon</li>
                </ol>
              </nav>
              <h1 className="dz-page-title">Rezervasyon Yap</h1>
              <p className="dz-page-subtitle">
                {vehicle.make} {vehicle.model} için rezervasyon oluşturun
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Vehicle Information */}
          <div className="col-lg-4 mb-4">
            <div className="dz-vehicle-summary">
              <div className="dz-vehicle-image">
                <img
                  src={
                    vehicle.imageUrl ||
                    `/images/vehicles/${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase()}.jpg`
                  }
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="img-fluid rounded"
                />
              </div>
              <div className="dz-vehicle-info mt-3">
                <h4>
                  {vehicle.make} {vehicle.model}
                </h4>
                <div className="dz-vehicle-details">
                  <div className="dz-detail-item">
                    <i className="fas fa-calendar me-2"></i>
                    <span>{vehicle.manufactureYear}</span>
                  </div>
                  <div className="dz-detail-item">
                    <i className="fas fa-palette me-2"></i>
                    <span>{vehicle.color}</span>
                  </div>
                  <div className="dz-detail-item">
                    <i className="fas fa-users me-2"></i>
                    <span>{vehicle.seatingCapacity} Kişi</span>
                  </div>
                  <div className="dz-detail-item">
                    <i className="fas fa-cog me-2"></i>
                    <span>
                      {vehicle.transmission === "Automatic"
                        ? "Otomatik"
                        : "Manuel"}
                    </span>
                  </div>
                  <div className="dz-detail-item">
                    <i className="fas fa-gas-pump me-2"></i>
                    <span>
                      {vehicle.fuelType === "Gasoline"
                        ? "Benzin"
                        : vehicle.fuelType === "Diesel"
                        ? "Dizel"
                        : "Elektrik"}
                    </span>
                  </div>
                </div>

                <div className="dz-pricing-info mt-3">
                  <div className="dz-rate-item">
                    <span className="dz-rate-label">Günlük:</span>
                    <span className="dz-rate-value">
                      {formatCurrency(vehicle.dailyRate)}
                    </span>
                  </div>
                  <div className="dz-rate-item">
                    <span className="dz-rate-label">Saatlik:</span>
                    <span className="dz-rate-value">
                      {formatCurrency(vehicle.hourlyRate)}
                    </span>
                  </div>
                  <div className="dz-rate-item">
                    <span className="dz-rate-label">Depozito:</span>
                    <span className="dz-rate-value">
                      {formatCurrency(vehicle.securityDeposit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="col-lg-8">
            <div className="dz-booking-form-card">
              <div className="dz-card-header">
                <h5 className="mb-0">
                  <i className="fas fa-calendar-plus me-2"></i>
                  Rezervasyon Bilgileri
                </h5>
              </div>
              <div className="dz-card-body">
                {error && (
                  <div
                    className="alert alert-danger dz-alert mb-4"
                    role="alert"
                  >
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Date Selection */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="fas fa-calendar-plus me-1"></i>
                        Alış Tarihi ve Saati *
                      </label>
                      <input
                        type="datetime-local"
                        name="startDate"
                        className="form-control dz-input"
                        value={bookingData.startDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        <i className="fas fa-calendar-minus me-1"></i>
                        Dönüş Tarihi ve Saati *
                      </label>
                      <input
                        type="datetime-local"
                        name="endDate"
                        className="form-control dz-input"
                        value={bookingData.endDate}
                        onChange={handleInputChange}
                        min={
                          bookingData.startDate ||
                          new Date().toISOString().slice(0, 16)
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* Duration Display */}
                  {duration && (
                    <div className="dz-duration-display mb-4">
                      <div className="dz-duration-info">
                        <i className="fas fa-clock me-2"></i>
                        <span>
                          Kiralama Süresi: <strong>{duration.days} gün</strong>
                          {duration.totalHours % 24 > 0 && (
                            <span>
                              {" "}
                              ve{" "}
                              <strong>
                                {Math.floor(duration.totalHours % 24)} saat
                              </strong>
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Insurance Selection */}
                  <div className="mb-4">
                    <label className="form-label">
                      <i className="fas fa-shield-alt me-1"></i>
                      Sigorta Paketi *
                    </label>
                    <div className="dz-insurance-options">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="insuranceType"
                          id="basic"
                          value="Basic"
                          checked={bookingData.insuranceType === "Basic"}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="basic">
                          <strong>Temel Sigorta</strong>
                          <small className="d-block text-muted">
                            Temel hasar koruması
                          </small>
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="insuranceType"
                          id="premium"
                          value="Premium"
                          checked={bookingData.insuranceType === "Premium"}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="premium">
                          <strong>Premium Sigorta</strong>
                          <small className="d-block text-muted">
                            Genişletilmiş hasar koruması
                          </small>
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="insuranceType"
                          id="comprehensive"
                          value="Comprehensive"
                          checked={
                            bookingData.insuranceType === "Comprehensive"
                          }
                          onChange={handleInputChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="comprehensive"
                        >
                          <strong>Kapsamlı Sigorta</strong>
                          <small className="d-block text-muted">
                            Tam kapsamlı koruma
                          </small>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-4">
                    <label className="form-label">
                      <i className="fas fa-percentage me-1"></i>
                      Promosyon Kodu
                    </label>
                    <input
                      type="text"
                      name="promoCode"
                      className="form-control dz-input"
                      placeholder="Promosyon kodunuz varsa girin"
                      value={bookingData.promoCode}
                      onChange={handleInputChange}
                    />
                    {member?.membershipLevel !== "Bronze" && (
                      <small className="form-text text-success">
                        <i className="fas fa-star me-1"></i>
                        {member?.membershipLevel} üye indiriminiz otomatik
                        uygulanacak
                      </small>
                    )}
                  </div>

                  {/* Special Requests */}
                  <div className="mb-4">
                    <label className="form-label">
                      <i className="fas fa-comment me-1"></i>
                      Özel İstekler
                    </label>
                    <textarea
                      name="specialRequests"
                      className="form-control dz-input"
                      rows="3"
                      placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
                      value={bookingData.specialRequests}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Cost Summary */}
                  {costEstimate && (
                    <div className="dz-cost-summary mb-4">
                      <h6>
                        <i className="fas fa-calculator me-2"></i>
                        Fiyat Özeti
                      </h6>
                      <div className="dz-cost-breakdown">
                        <div className="dz-cost-line">
                          <span>Araç Kirası:</span>
                          <span>{formatCurrency(costEstimate.baseAmount)}</span>
                        </div>
                        {costEstimate.insuranceCost > 0 && (
                          <div className="dz-cost-line">
                            <span>Sigorta:</span>
                            <span>
                              {formatCurrency(costEstimate.insuranceCost)}
                            </span>
                          </div>
                        )}
                        {costEstimate.discount > 0 && (
                          <div className="dz-cost-line text-success">
                            <span>İndirim:</span>
                            <span>
                              -{formatCurrency(costEstimate.discount)}
                            </span>
                          </div>
                        )}
                        <div className="dz-cost-line">
                          <span>KDV (%18):</span>
                          <span>{formatCurrency(costEstimate.taxAmount)}</span>
                        </div>
                        <hr />
                        <div className="dz-cost-line dz-total">
                          <span>
                            <strong>Toplam:</strong>
                          </span>
                          <span>
                            <strong>
                              {formatCurrency(costEstimate.totalAmount)}
                            </strong>
                          </span>
                        </div>
                        <div className="dz-cost-line dz-deposit">
                          <span>Depozito:</span>
                          <span>{formatCurrency(vehicle.securityDeposit)}</span>
                        </div>
                      </div>
                      {calculating && (
                        <div className="text-center mt-2">
                          <small className="text-muted">
                            <i className="fas fa-spinner fa-spin me-1"></i>
                            Fiyat hesaplanıyor...
                          </small>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Terms and Submit */}
                  <div className="dz-booking-footer">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="acceptTerms"
                        required
                      />
                      <label className="form-check-label" htmlFor="acceptTerms">
                        <a href="/terms" target="_blank">
                          Kiralama Koşulları
                        </a>
                        'nı okudum ve kabul ediyorum
                      </label>
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        type="button"
                        className="btn dz-btn-outline-secondary me-md-2"
                        onClick={() => navigate("/available-vehicles")}
                      >
                        <i className="fas fa-arrow-left me-2"></i>
                        Geri Dön
                      </button>
                      <button
                        type="submit"
                        className="btn dz-btn-success"
                        disabled={submitting || calculating || !costEstimate}
                      >
                        {submitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Rezervasyon Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check me-2"></i>
                            Rezervasyonu Onayla
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
