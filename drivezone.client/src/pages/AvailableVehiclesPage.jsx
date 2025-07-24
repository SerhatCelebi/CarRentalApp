import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { VehicleCard } from "../components/VehicleCard";
import { getAllVehicles, searchVehicles } from "../services/vehicleService";

export const AvailableVehiclesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "TR",
    category: searchParams.get("category") || "",
    fuelType: searchParams.get("fuelType") || "",
    transmission: searchParams.get("transmission") || "",
    minSeating: searchParams.get("minSeating") || "",
    maxDailyRate: searchParams.get("maxDailyRate") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });

  const [sortBy, setSortBy] = useState("dailyRate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  useEffect(() => {
    loadVehicles();
  }, [filters, sortBy, sortOrder]);

  const loadVehicles = async () => {
    setLoading(true);
    setError("");

    try {
      let result;
      const hasFilters = Object.values(filters).some((value) => value !== "");

      if (hasFilters) {
        result = await searchVehicles({
          location: filters.location || undefined,
          category: filters.category || undefined,
          fuelType: filters.fuelType || undefined,
          transmission: filters.transmission || undefined,
          minSeating: filters.minSeating
            ? parseInt(filters.minSeating)
            : undefined,
          maxDailyRate: filters.maxDailyRate
            ? parseFloat(filters.maxDailyRate)
            : undefined,
          availableFrom: filters.startDate || undefined,
          availableTo: filters.endDate || undefined,
        });
      } else {
        result = await getAllVehicles({ availableOnly: true });
      }

      // Sort vehicles
      const sortedVehicles = [...result].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "dailyRate":
            comparison = a.dailyRate - b.dailyRate;
            break;
          case "make":
            comparison = a.make.localeCompare(b.make);
            break;
          case "category":
            comparison = a.category.localeCompare(b.category);
            break;
          case "year":
            comparison = a.manufactureYear - b.manufactureYear;
            break;
          default:
            comparison = 0;
        }

        return sortOrder === "desc" ? -comparison : comparison;
      });

      setVehicles(sortedVehicles);
    } catch (error) {
      setError("Araçlar yüklenirken bir hata oluştu: " + error.message);
      console.error("Error loading vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    // Update URL search params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) newSearchParams.set(key, val);
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const clearedFilters = {
      location: "TR",
      category: "",
      fuelType: "",
      transmission: "",
      minSeating: "",
      maxDailyRate: "",
      startDate: "",
      endDate: "",
    };
    setFilters(clearedFilters);
    setSearchParams({});
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  return (
    <div className="dz-vehicles-page">
      <div className="container">
        {/* Page Header */}
        <div className="dz-page-header py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="dz-page-title">Müsait Araçlar</h1>
              <p className="dz-page-subtitle">
                {vehicles.length} araç bulundu
                {filters.startDate && filters.endDate && (
                  <span>
                    {" "}
                    • {new Date(filters.startDate).toLocaleDateString(
                      "tr-TR"
                    )}{" "}
                    - {new Date(filters.endDate).toLocaleDateString("tr-TR")}
                  </span>
                )}
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="dz-view-controls">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${
                      viewMode === "grid"
                        ? "dz-btn-primary"
                        : "dz-btn-outline-secondary"
                    }`}
                    onClick={() => setViewMode("grid")}
                    title="Izgara Görünümü"
                  >
                    <i className="fas fa-th"></i>
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      viewMode === "list"
                        ? "dz-btn-primary"
                        : "dz-btn-outline-secondary"
                    }`}
                    onClick={() => setViewMode("list")}
                    title="Liste Görünümü"
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="dz-filters-card">
              <div className="dz-filters-header">
                <h5 className="mb-0">
                  <i className="fas fa-filter me-2"></i>
                  Filtrele
                </h5>
                <button
                  className="btn dz-btn-link dz-btn-sm"
                  onClick={clearFilters}
                >
                  Temizle
                </button>
              </div>

              <div className="dz-filters-body">
                {/* Location Filter */}
                <div className="dz-filter-group">
                  <label className="dz-filter-label">Şehir</label>
                  <select
                    className="form-select dz-input"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                  >
                    <option value="TR">İstanbul</option>
                    <option value="AN">Ankara</option>
                    <option value="IZ">İzmir</option>
                    <option value="ANT">Antalya</option>
                    <option value="BR">Bursa</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="dz-filter-group">
                  <label className="dz-filter-label">Tarih Aralığı</label>
                  <div className="row g-2">
                    <div className="col-12">
                      <input
                        type="datetime-local"
                        className="form-control dz-input"
                        placeholder="Başlangıç"
                        value={filters.startDate}
                        onChange={(e) =>
                          handleFilterChange("startDate", e.target.value)
                        }
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <div className="col-12">
                      <input
                        type="datetime-local"
                        className="form-control dz-input"
                        placeholder="Bitiş"
                        value={filters.endDate}
                        onChange={(e) =>
                          handleFilterChange("endDate", e.target.value)
                        }
                        min={
                          filters.startDate ||
                          new Date().toISOString().slice(0, 16)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="dz-filter-group">
                  <label className="dz-filter-label">Kategori</label>
                  <select
                    className="form-select dz-input"
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                  >
                    <option value="">Tüm Kategoriler</option>
                    <option value="Economy">Ekonomi</option>
                    <option value="Compact">Kompakt</option>
                    <option value="MidSize">Orta Sınıf</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Lüks</option>
                    <option value="SUV">SUV</option>
                    <option value="Sports">Spor</option>
                    <option value="Electric">Elektrikli</option>
                  </select>
                </div>

                {/* Fuel Type Filter */}
                <div className="dz-filter-group">
                  <label className="dz-filter-label">Yakıt Türü</label>
                  <select
                    className="form-select dz-input"
                    value={filters.fuelType}
                    onChange={(e) =>
                      handleFilterChange("fuelType", e.target.value)
                    }
                  >
                    <option value="">Tüm Yakıt Türleri</option>
                    <option value="Gasoline">Benzin</option>
                    <option value="Diesel">Dizel</option>
                    <option value="Electric">Elektrik</option>
                    <option value="Hybrid">Hibrit</option>
                    <option value="PluginHybrid">Plug-in Hibrit</option>
                  </select>
                </div>

                {/* Transmission Filter */}
                <div className="dz-filter-group">
                  <label className="dz-filter-label">Vites</label>
                  <select
                    className="form-select dz-input"
                    value={filters.transmission}
                    onChange={(e) =>
                      handleFilterChange("transmission", e.target.value)
                    }
                  >
                    <option value="">Tüm Vites Türleri</option>
                    <option value="Manual">Manuel</option>
                    <option value="Automatic">Otomatik</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>

                {/* Seating Capacity */}
                <div className="dz-filter-group">
                  <label className="dz-filter-label">
                    Minimum Koltuk Sayısı
                  </label>
                  <select
                    className="form-select dz-input"
                    value={filters.minSeating}
                    onChange={(e) =>
                      handleFilterChange("minSeating", e.target.value)
                    }
                  >
                    <option value="">Fark Etmez</option>
                    <option value="2">2+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                    <option value="7">7+</option>
                  </select>
                </div>

                {/* Max Daily Rate */}
                <div className="dz-filter-group">
                  <label className="dz-filter-label">
                    Maksimum Günlük Fiyat
                  </label>
                  <input
                    type="number"
                    className="form-control dz-input"
                    placeholder="₺ Maksimum fiyat"
                    value={filters.maxDailyRate}
                    onChange={(e) =>
                      handleFilterChange("maxDailyRate", e.target.value)
                    }
                    min="0"
                    step="50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicles List */}
          <div className="col-lg-9">
            {/* Sort Controls */}
            <div className="dz-sort-controls mb-4">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="dz-sort-buttons">
                    <span className="me-3">Sırala:</span>
                    <button
                      className={`btn dz-btn-sm me-2 ${
                        sortBy === "dailyRate"
                          ? "dz-btn-primary"
                          : "dz-btn-outline-secondary"
                      }`}
                      onClick={() => handleSortChange("dailyRate")}
                    >
                      Fiyat{" "}
                      {sortBy === "dailyRate" && (
                        <i
                          className={`fas fa-sort-${
                            sortOrder === "asc" ? "up" : "down"
                          } ms-1`}
                        ></i>
                      )}
                    </button>
                    <button
                      className={`btn dz-btn-sm me-2 ${
                        sortBy === "make"
                          ? "dz-btn-primary"
                          : "dz-btn-outline-secondary"
                      }`}
                      onClick={() => handleSortChange("make")}
                    >
                      Marka{" "}
                      {sortBy === "make" && (
                        <i
                          className={`fas fa-sort-${
                            sortOrder === "asc" ? "up" : "down"
                          } ms-1`}
                        ></i>
                      )}
                    </button>
                    <button
                      className={`btn dz-btn-sm me-2 ${
                        sortBy === "year"
                          ? "dz-btn-primary"
                          : "dz-btn-outline-secondary"
                      }`}
                      onClick={() => handleSortChange("year")}
                    >
                      Yıl{" "}
                      {sortBy === "year" && (
                        <i
                          className={`fas fa-sort-${
                            sortOrder === "asc" ? "up" : "down"
                          } ms-1`}
                        ></i>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="dz-loading-state text-center py-5">
                <div
                  className="spinner-border dz-spinner-primary"
                  role="status"
                >
                  <span className="visually-hidden">Yükleniyor...</span>
                </div>
                <p className="mt-3">Araçlar yükleniyor...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="alert alert-danger dz-alert" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {/* Vehicles Grid/List */}
            {!loading && !error && (
              <>
                {vehicles.length === 0 ? (
                  <div className="dz-empty-state text-center py-5">
                    <div className="dz-empty-icon mb-3">
                      <i className="fas fa-car-side"></i>
                    </div>
                    <h4>Araç bulunamadı</h4>
                    <p className="text-muted mb-4">
                      Aradığınız kriterlere uygun araç bulunamadı. Lütfen
                      filtrelerinizi değiştirip tekrar deneyin.
                    </p>
                    <button
                      className="btn dz-btn-primary"
                      onClick={clearFilters}
                    >
                      <i className="fas fa-filter me-2"></i>
                      Filtreleri Temizle
                    </button>
                  </div>
                ) : (
                  <div
                    className={`dz-vehicles-grid ${
                      viewMode === "list" ? "dz-list-view" : ""
                    }`}
                  >
                    <div className="row g-4">
                      {vehicles.map((vehicle) => (
                        <div
                          key={vehicle.vehicleId}
                          className={
                            viewMode === "grid" ? "col-md-6 col-xl-4" : "col-12"
                          }
                        >
                          <VehicleCard
                            vehicle={vehicle}
                            showBookingButton={true}
                            showDetails={viewMode === "list"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Load More Button (if needed for pagination) */}
            {!loading && vehicles.length > 0 && vehicles.length >= 12 && (
              <div className="text-center mt-4">
                <button className="btn dz-btn-outline-primary">
                  <i className="fas fa-plus me-2"></i>
                  Daha Fazla Araç Yükle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
