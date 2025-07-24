import React from "react";
import { Link } from "react-router-dom";
import { bookingUtils } from "../services/bookingService";
import { vehicleUtils } from "../services/vehicleService";

export const BookingCard = ({
  booking,
  showActions = true,
  compact = false,
}) => {
  if (!booking) return null;

  const statusInfo = bookingUtils.getStatusDisplay(booking.status);
  const canCancel = bookingUtils.canBeCancelled(booking);
  const canModify = bookingUtils.canBeModified(booking);

  return (
    <div className={`dz-booking-card ${compact ? "dz-compact" : ""}`}>
      <div className="dz-booking-header">
        <div className="dz-booking-reference">
          <h6 className="mb-0">{bookingUtils.getDisplayReference(booking)}</h6>
          <small className="text-muted">
            {new Date(booking.createdAt).toLocaleDateString("tr-TR")}
          </small>
        </div>
        <div className={`dz-status-badge dz-status-${statusInfo.color}`}>
          <span className="dz-status-icon">{statusInfo.icon}</span>
          <span className="dz-status-text">{statusInfo.text}</span>
        </div>
      </div>

      <div className="dz-booking-content">
        {booking.vehicle && (
          <div className="dz-vehicle-info">
            <div className="dz-vehicle-image">
              <img
                src={vehicleUtils.getImageUrl(booking.vehicle)}
                alt={vehicleUtils.getDisplayName(booking.vehicle)}
              />
            </div>
            <div className="dz-vehicle-details">
              <h6 className="dz-vehicle-name">
                {vehicleUtils.getDisplayName(booking.vehicle)}
              </h6>
              <div className="dz-vehicle-specs">
                <span>
                  <i className="fas fa-users"></i>{" "}
                  {booking.vehicle.seatingCapacity}
                </span>
                <span>
                  <i className="fas fa-cog"></i> {booking.vehicle.transmission}
                </span>
                <span>
                  <i className="fas fa-gas-pump"></i> {booking.vehicle.fuelType}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="dz-booking-details">
          <div className="dz-booking-dates">
            <div className="dz-date-section">
              <div className="dz-date-label">
                <i className="fas fa-calendar-plus text-success"></i>
                <span>Alış</span>
              </div>
              <div className="dz-date-value">
                {new Date(booking.bookingStartDate).toLocaleDateString(
                  "tr-TR",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
                <small className="d-block">
                  {new Date(booking.bookingStartDate).toLocaleTimeString(
                    "tr-TR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </small>
              </div>
            </div>

            <div className="dz-duration-arrow">
              <i className="fas fa-arrow-right"></i>
              <small>
                {bookingUtils.formatDuration(
                  booking.bookingStartDate,
                  booking.bookingEndDate
                )}
              </small>
            </div>

            <div className="dz-date-section">
              <div className="dz-date-label">
                <i className="fas fa-calendar-minus text-danger"></i>
                <span>Dönüş</span>
              </div>
              <div className="dz-date-value">
                {new Date(booking.bookingEndDate).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                <small className="d-block">
                  {new Date(booking.bookingEndDate).toLocaleTimeString(
                    "tr-TR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </small>
              </div>
            </div>
          </div>

          {!compact && (
            <>
              <div className="dz-booking-extras">
                <div className="dz-extra-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>
                    {bookingUtils.getInsuranceDisplay(booking.insuranceType)}
                  </span>
                </div>
                {booking.specialRequests && (
                  <div className="dz-extra-item">
                    <i className="fas fa-comment"></i>
                    <span>Özel İstek: {booking.specialRequests}</span>
                  </div>
                )}
                {booking.promoCode && (
                  <div className="dz-extra-item">
                    <i className="fas fa-percentage"></i>
                    <span>Promosyon: {booking.promoCode}</span>
                  </div>
                )}
              </div>

              <div className="dz-booking-pricing">
                <div className="dz-price-breakdown">
                  <div className="dz-price-line">
                    <span>Araç Kirası:</span>
                    <span>
                      {vehicleUtils.formatCurrency(booking.baseAmount)}
                    </span>
                  </div>
                  {booking.insuranceCost > 0 && (
                    <div className="dz-price-line">
                      <span>Sigorta:</span>
                      <span>
                        {vehicleUtils.formatCurrency(booking.insuranceCost)}
                      </span>
                    </div>
                  )}
                  <div className="dz-price-line">
                    <span>KDV (%18):</span>
                    <span>
                      {vehicleUtils.formatCurrency(booking.taxAmount)}
                    </span>
                  </div>
                  <hr className="dz-price-divider" />
                  <div className="dz-price-line dz-total">
                    <span>Toplam:</span>
                    <span>
                      {vehicleUtils.formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>
                <div className="dz-deposit-info">
                  <small>
                    <i className="fas fa-shield-alt"></i>
                    Depozito:{" "}
                    {vehicleUtils.formatCurrency(booking.securityDeposit)}
                  </small>
                </div>
              </div>
            </>
          )}
        </div>

        {showActions && (
          <div className="dz-booking-actions">
            <Link
              to={`/booking-details/${booking.bookingId}`}
              className="btn dz-btn-outline-primary"
            >
              <i className="fas fa-info-circle"></i> Detaylar
            </Link>

            {canModify && (
              <Link
                to={`/booking-modify/${booking.bookingId}`}
                className="btn dz-btn-outline-secondary"
              >
                <i className="fas fa-edit"></i> Düzenle
              </Link>
            )}

            {canCancel && (
              <button
                className="btn dz-btn-outline-danger"
                onClick={() => {
                  /* Cancel booking logic */
                }}
              >
                <i className="fas fa-times"></i> İptal Et
              </button>
            )}

            <div className="dz-booking-actions-more">
              <button className="btn dz-btn-link" title="Faturayı İndir">
                <i className="fas fa-download"></i>
              </button>
              <button className="btn dz-btn-link" title="Paylaş">
                <i className="fas fa-share-alt"></i>
              </button>
              <button className="btn dz-btn-link" title="Destek">
                <i className="fas fa-headset"></i>
              </button>
            </div>
          </div>
        )}

        {booking.status === "Active" && (
          <div className="dz-booking-countdown">
            <div className="dz-countdown-info">
              <i className="fas fa-clock text-warning"></i>
              <span>
                Rezervasyonunuzun bitmesine{" "}
                {bookingUtils.getDaysUntilBooking(booking.bookingEndDate)} gün
                kaldı
              </span>
            </div>
          </div>
        )}

        {booking.paymentStatus === "Pending" && (
          <div className="dz-payment-warning">
            <i className="fas fa-exclamation-triangle text-warning"></i>
            <span>
              Ödemeniz bekleniyor. Rezervasyonunuzu garantilemek için lütfen
              ödemeyi tamamlayın.
            </span>
            <Link
              to={`/payment/${booking.bookingId}`}
              className="btn dz-btn-warning btn-sm ms-2"
            >
              Ödeme Yap
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
