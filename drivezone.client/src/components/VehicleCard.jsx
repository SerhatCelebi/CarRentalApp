import React from "react";
import { Link } from "react-router-dom";
import { vehicleUtils } from "../services/vehicleService";

export const VehicleCard = ({
  vehicle,
  showBookingButton = true,
  showDetails = false,
}) => {
  if (!vehicle) return null;

  return (
    <div className="dz-vehicle-card">
      <div className="dz-vehicle-image">
        <img
          src={vehicleUtils.getImageUrl(vehicle)}
          alt={vehicleUtils.getDisplayName(vehicle)}
          loading="lazy"
        />
        <div className="dz-vehicle-badges">
          <span
            className={`dz-category-badge dz-${vehicle.category.toLowerCase()}`}
          >
            {vehicleUtils.getCategoryDisplay(vehicle.category)}
          </span>
          {vehicle.isAvailable ? (
            <span className="dz-availability-badge dz-available">
              <i className="fas fa-check-circle"></i> Müsait
            </span>
          ) : (
            <span className="dz-availability-badge dz-unavailable">
              <i className="fas fa-times-circle"></i> Kiralık
            </span>
          )}
        </div>
        {vehicle.imageGallery && vehicle.imageGallery.length > 1 && (
          <div className="dz-image-counter">
            <i className="fas fa-camera"></i> +{vehicle.imageGallery.length - 1}
          </div>
        )}
      </div>

      <div className="dz-vehicle-content">
        <div className="dz-vehicle-header">
          <h5 className="dz-vehicle-name">
            {vehicleUtils.getDisplayName(vehicle)}
          </h5>
          <div className="dz-vehicle-rating">
            <div className="dz-stars">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fas fa-star ${
                    i < (vehicle.rating || 4.5) ? "text-warning" : "text-muted"
                  }`}
                ></i>
              ))}
            </div>
            <span className="dz-rating-text">
              ({vehicle.reviewCount || 12} değerlendirme)
            </span>
          </div>
        </div>

        <div className="dz-vehicle-specs">
          <div className="dz-spec-item">
            <i className="fas fa-users"></i>
            <span>{vehicle.seatingCapacity} Kişi</span>
          </div>
          <div className="dz-spec-item">
            <i className="fas fa-cog"></i>
            <span>
              {vehicleUtils.getTransmissionDisplay(vehicle.transmission)}
            </span>
          </div>
          <div className="dz-spec-item">
            <i className="fas fa-gas-pump"></i>
            <span>{vehicleUtils.getFuelTypeDisplay(vehicle.fuelType)}</span>
          </div>
          <div className="dz-spec-item">
            <i className="fas fa-road"></i>
            <span>{vehicle.mileage.toLocaleString()} km</span>
          </div>
        </div>

        {showDetails && vehicle.description && (
          <p className="dz-vehicle-description">{vehicle.description}</p>
        )}

        <div className="dz-vehicle-features">
          <div className="dz-feature-tags">
            {vehicle.features?.slice(0, 3).map((feature, index) => (
              <span key={index} className="dz-feature-tag">
                {feature}
              </span>
            )) || [
              <span key="1" className="dz-feature-tag">
                Klima
              </span>,
              <span key="2" className="dz-feature-tag">
                Bluetooth
              </span>,
              <span key="3" className="dz-feature-tag">
                GPS
              </span>,
            ]}
          </div>
        </div>

        <div className="dz-vehicle-pricing">
          <div className="dz-price-section">
            <div className="dz-price-daily">
              <span className="dz-price-amount">
                {vehicleUtils.formatCurrency(vehicle.dailyRate)}
              </span>
              <span className="dz-price-unit">/gün</span>
            </div>
            <div className="dz-price-hourly">
              <span className="dz-price-amount">
                {vehicleUtils.formatCurrency(vehicle.hourlyRate)}
              </span>
              <span className="dz-price-unit">/saat</span>
            </div>
          </div>

          {vehicle.securityDeposit && (
            <div className="dz-deposit-info">
              <small>
                <i className="fas fa-shield-alt"></i>
                Depozito: {vehicleUtils.formatCurrency(vehicle.securityDeposit)}
              </small>
            </div>
          )}
        </div>

        <div className="dz-vehicle-actions">
          {showBookingButton && vehicle.isAvailable && (
            <Link
              to={`/vehicle-booking?vehicleId=${vehicle.vehicleId}`}
              className="btn dz-btn-primary w-100 mb-2"
            >
              <i className="fas fa-calendar-plus"></i> Rezervasyon Yap
            </Link>
          )}

          <div className="dz-secondary-actions">
            <Link
              to={`/vehicle-details/${vehicle.vehicleId}`}
              className="btn dz-btn-outline-secondary flex-fill"
            >
              <i className="fas fa-info-circle"></i> Detaylar
            </Link>
            <button
              className="btn dz-btn-outline-secondary ms-2"
              onClick={() => {
                /* Add to favorites logic */
              }}
              title="Favorilere ekle"
            >
              <i className="far fa-heart"></i>
            </button>
            <button
              className="btn dz-btn-outline-secondary ms-2"
              onClick={() => {
                /* Share logic */
              }}
              title="Paylaş"
            >
              <i className="fas fa-share-alt"></i>
            </button>
          </div>
        </div>

        {vehicle.promotions && vehicle.promotions.length > 0 && (
          <div className="dz-promotions">
            {vehicle.promotions.map((promo, index) => (
              <div key={index} className="dz-promo-badge">
                <i className="fas fa-percentage"></i>
                {promo.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
