import React, { useState, useEffect } from "react";
import { useMemberContext } from "../context/MemberContext";
import { BookingCard } from "../components/BookingCard";
import { getMyBookings } from "../services/bookingService";

export const MyBookingsPage = () => {
  const { isLoggedIn } = useMemberContext();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    if (isLoggedIn()) {
      loadBookings();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, activeFilter, sortBy, sortOrder]);

  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const bookingsData = await getMyBookings();
      setBookings(bookingsData);
    } catch (error) {
      setError("Rezervasyonlar yüklenirken hata oluştu: " + error.message);
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    // Apply status filter
    if (activeFilter !== "all") {
      switch (activeFilter) {
        case "active":
          filtered = filtered.filter(
            (b) => b.status === "Active" || b.status === "Confirmed"
          );
          break;
        case "completed":
          filtered = filtered.filter((b) => b.status === "Completed");
          break;
        case "cancelled":
          filtered = filtered.filter((b) => b.status === "Cancelled");
          break;
        case "pending":
          filtered = filtered.filter((b) => b.status === "Pending");
          break;
        default:
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.bookingStartDate) - new Date(b.bookingStartDate);
          break;
        case "created":
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case "amount":
          comparison = a.totalAmount - b.totalAmount;
          break;
        case "vehicle":
          const vehicleA = a.vehicle
            ? `${a.vehicle.make} ${a.vehicle.model}`
            : "";
          const vehicleB = b.vehicle
            ? `${b.vehicle.make} ${b.vehicle.model}`
            : "";
          comparison = vehicleA.localeCompare(vehicleB);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredBookings(filtered);
  };

  const getStatusCounts = () => {
    return {
      all: bookings.length,
      active: bookings.filter(
        (b) => b.status === "Active" || b.status === "Confirmed"
      ).length,
      completed: bookings.filter((b) => b.status === "Completed").length,
      cancelled: bookings.filter((b) => b.status === "Cancelled").length,
      pending: bookings.filter((b) => b.status === "Pending").length,
    };
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  if (!isLoggedIn()) {
    return (
      <div className="dz-bookings-page">
        <div className="container">
          <div className="dz-auth-required text-center py-5">
            <div className="dz-auth-icon mb-3">
              <i className="fas fa-lock"></i>
            </div>
            <h4>Giriş Gerekli</h4>
            <p className="text-muted mb-4">
              Rezervasyonlarınızı görüntülemek için giriş yapmanız gerekir.
            </p>
            <a href="/login" className="btn dz-btn-primary">
              <i className="fas fa-sign-in-alt me-2"></i>
              Giriş Yap
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dz-bookings-page">
        <div className="container">
          <div className="dz-loading-state text-center py-5">
            <div className="spinner-border dz-spinner-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
            <p className="mt-3">Rezervasyonlarınız yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="dz-bookings-page">
      <div className="container">
        {/* Page Header */}
        <div className="dz-page-header py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="dz-page-title">Rezervasyonlarım</h1>
              <p className="dz-page-subtitle">
                Geçmiş ve mevcut rezervasyonlarınızı yönetin
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <a href="/available-vehicles" className="btn dz-btn-primary">
                <i className="fas fa-plus me-2"></i>
                Yeni Rezervasyon
              </a>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="alert alert-danger dz-alert mb-4" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button className="btn btn-link ms-2 p-0" onClick={loadBookings}>
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="dz-booking-filters mb-4">
          <ul className="nav nav-pills" role="tablist">
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
                type="button"
              >
                Tümü
                <span className="dz-count-badge">{statusCounts.all}</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeFilter === "active" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("active")}
                type="button"
              >
                Aktif
                <span className="dz-count-badge">{statusCounts.active}</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeFilter === "pending" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("pending")}
                type="button"
              >
                Beklemede
                <span className="dz-count-badge">{statusCounts.pending}</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeFilter === "completed" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("completed")}
                type="button"
              >
                Tamamlanan
                <span className="dz-count-badge">{statusCounts.completed}</span>
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${
                  activeFilter === "cancelled" ? "active" : ""
                }`}
                onClick={() => setActiveFilter("cancelled")}
                type="button"
              >
                İptal Edilen
                <span className="dz-count-badge">{statusCounts.cancelled}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Sort Controls */}
        {filteredBookings.length > 0 && (
          <div className="dz-sort-controls mb-4">
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="dz-sort-buttons">
                  <span className="me-3">Sırala:</span>
                  <button
                    className={`btn dz-btn-sm me-2 ${
                      sortBy === "date"
                        ? "dz-btn-primary"
                        : "dz-btn-outline-secondary"
                    }`}
                    onClick={() => handleSortChange("date")}
                  >
                    Rezervasyon Tarihi
                    {sortBy === "date" && (
                      <i
                        className={`fas fa-sort-${
                          sortOrder === "asc" ? "up" : "down"
                        } ms-1`}
                      ></i>
                    )}
                  </button>
                  <button
                    className={`btn dz-btn-sm me-2 ${
                      sortBy === "created"
                        ? "dz-btn-primary"
                        : "dz-btn-outline-secondary"
                    }`}
                    onClick={() => handleSortChange("created")}
                  >
                    Oluşturma Tarihi
                    {sortBy === "created" && (
                      <i
                        className={`fas fa-sort-${
                          sortOrder === "asc" ? "up" : "down"
                        } ms-1`}
                      ></i>
                    )}
                  </button>
                  <button
                    className={`btn dz-btn-sm me-2 ${
                      sortBy === "amount"
                        ? "dz-btn-primary"
                        : "dz-btn-outline-secondary"
                    }`}
                    onClick={() => handleSortChange("amount")}
                  >
                    Tutar
                    {sortBy === "amount" && (
                      <i
                        className={`fas fa-sort-${
                          sortOrder === "asc" ? "up" : "down"
                        } ms-1`}
                      ></i>
                    )}
                  </button>
                  <button
                    className={`btn dz-btn-sm ${
                      sortBy === "vehicle"
                        ? "dz-btn-primary"
                        : "dz-btn-outline-secondary"
                    }`}
                    onClick={() => handleSortChange("vehicle")}
                  >
                    Araç
                    {sortBy === "vehicle" && (
                      <i
                        className={`fas fa-sort-${
                          sortOrder === "asc" ? "up" : "down"
                        } ms-1`}
                      ></i>
                    )}
                  </button>
                </div>
              </div>
              <div className="col-md-6 text-md-end">
                <small className="text-muted">
                  {filteredBookings.length} rezervasyon gösteriliyor
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="dz-bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="dz-empty-state text-center py-5">
              <div className="dz-empty-icon mb-3">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h4>
                {activeFilter === "all"
                  ? "Henüz rezervasyonunuz yok"
                  : activeFilter === "active"
                  ? "Aktif rezervasyonunuz yok"
                  : activeFilter === "pending"
                  ? "Bekleyen rezervasyonunuz yok"
                  : activeFilter === "completed"
                  ? "Tamamlanmış rezervasyonunuz yok"
                  : "İptal edilmiş rezervasyonunuz yok"}
              </h4>
              <p className="text-muted mb-4">
                {activeFilter === "all"
                  ? "İlk rezervasyonunuzu yapmak için araçlarımıza göz atın."
                  : "Bu kategoride gösterilecek rezervasyon bulunmuyor."}
              </p>
              {activeFilter === "all" ? (
                <a href="/available-vehicles" className="btn dz-btn-primary">
                  <i className="fas fa-car me-2"></i>
                  Araçları İncele
                </a>
              ) : (
                <button
                  className="btn dz-btn-outline-primary"
                  onClick={() => setActiveFilter("all")}
                >
                  <i className="fas fa-list me-2"></i>
                  Tüm Rezervasyonları Göster
                </button>
              )}
            </div>
          ) : (
            <div className="row g-4">
              {filteredBookings.map((booking) => (
                <div key={booking.bookingId} className="col-12">
                  <BookingCard
                    booking={booking}
                    showActions={true}
                    compact={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More Button (if needed for pagination) */}
        {filteredBookings.length >= 10 && (
          <div className="text-center mt-4">
            <button
              className="btn dz-btn-outline-primary"
              onClick={loadBookings}
            >
              <i className="fas fa-plus me-2"></i>
              Daha Fazla Yükle
            </button>
          </div>
        )}

        {/* Quick Stats */}
        {bookings.length > 0 && (
          <div className="dz-booking-stats mt-5">
            <div className="row text-center">
              <div className="col-md-3 col-6 mb-3">
                <div className="dz-stat-card">
                  <div className="dz-stat-number">{bookings.length}</div>
                  <div className="dz-stat-label">Toplam Rezervasyon</div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="dz-stat-card">
                  <div className="dz-stat-number">{statusCounts.completed}</div>
                  <div className="dz-stat-label">Tamamlanan</div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="dz-stat-card">
                  <div className="dz-stat-number">
                    ₺
                    {bookings
                      .filter((b) => b.status === "Completed")
                      .reduce((sum, b) => sum + b.totalAmount, 0)
                      .toLocaleString()}
                  </div>
                  <div className="dz-stat-label">Toplam Harcama</div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="dz-stat-card">
                  <div className="dz-stat-number">
                    {bookings.length > 0
                      ? Math.round(
                          bookings
                            .filter((b) => b.status === "Completed")
                            .reduce((sum, b) => {
                              const duration =
                                new Date(b.bookingEndDate) -
                                new Date(b.bookingStartDate);
                              return (
                                sum +
                                Math.ceil(duration / (1000 * 60 * 60 * 24))
                              );
                            }, 0)
                        )
                      : 0}
                  </div>
                  <div className="dz-stat-label">Toplam Gün</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
