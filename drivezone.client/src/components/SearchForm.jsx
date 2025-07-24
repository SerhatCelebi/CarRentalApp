import React, { useState } from "react";

export const SearchForm = ({ onSearch, initialValues = {} }) => {
  const [searchData, setSearchData] = useState({
    location: initialValues.location || "TR",
    startDate: initialValues.startDate || "",
    endDate: initialValues.endDate || "",
    category: initialValues.category || "",
    minSeating: initialValues.minSeating || "",
    maxDailyRate: initialValues.maxDailyRate || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate date range
    if (searchData.startDate && searchData.endDate) {
      if (new Date(searchData.startDate) >= new Date(searchData.endDate)) {
        alert("Bitiş tarihi başlangıç tarihinden sonra olmalıdır");
        return;
      }
    }

    onSearch(searchData);
  };

  const clearSearch = () => {
    const clearedData = {
      location: "TR",
      startDate: "",
      endDate: "",
      category: "",
      minSeating: "",
      maxDailyRate: "",
    };
    setSearchData(clearedData);
    onSearch(clearedData);
  };

  return (
    <div className="dz-search-form-container">
      <form onSubmit={handleSubmit} className="dz-search-form">
        <div className="row g-3">
          {/* Location */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label">
              <i className="fas fa-map-marker-alt me-1"></i>
              Şehir
            </label>
            <select
              name="location"
              className="form-select dz-input"
              value={searchData.location}
              onChange={handleInputChange}
            >
              <option value="TR">İstanbul</option>
              <option value="AN">Ankara</option>
              <option value="IZ">İzmir</option>
              <option value="ANT">Antalya</option>
              <option value="BR">Bursa</option>
              <option value="AD">Adana</option>
              <option value="GAZ">Gaziantep</option>
              <option value="KON">Konya</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label">
              <i className="fas fa-calendar-plus me-1"></i>
              Alış Tarihi
            </label>
            <input
              type="datetime-local"
              name="startDate"
              className="form-control dz-input"
              value={searchData.startDate}
              onChange={handleInputChange}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* End Date */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label">
              <i className="fas fa-calendar-minus me-1"></i>
              Dönüş Tarihi
            </label>
            <input
              type="datetime-local"
              name="endDate"
              className="form-control dz-input"
              value={searchData.endDate}
              onChange={handleInputChange}
              min={
                searchData.startDate || new Date().toISOString().slice(0, 16)
              }
            />
          </div>

          {/* Category */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label">
              <i className="fas fa-car me-1"></i>
              Kategori
            </label>
            <select
              name="category"
              className="form-select dz-input"
              value={searchData.category}
              onChange={handleInputChange}
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

          {/* Seating Capacity */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label">
              <i className="fas fa-users me-1"></i>
              Koltuk Sayısı
            </label>
            <select
              name="minSeating"
              className="form-select dz-input"
              value={searchData.minSeating}
              onChange={handleInputChange}
            >
              <option value="">Fark Etmez</option>
              <option value="2">2+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
              <option value="7">7+</option>
              <option value="9">9+</option>
            </select>
          </div>

          {/* Max Daily Rate */}
          <div className="col-md-6 col-lg-3">
            <label className="form-label">
              <i className="fas fa-money-bill-wave me-1"></i>
              Max. Günlük Fiyat
            </label>
            <input
              type="number"
              name="maxDailyRate"
              className="form-control dz-input"
              placeholder="₺ Max fiyat"
              value={searchData.maxDailyRate}
              onChange={handleInputChange}
              min="0"
              step="50"
            />
          </div>

          {/* Search Buttons */}
          <div className="col-md-12 col-lg-6">
            <label className="form-label d-block">&nbsp;</label>
            <div className="d-flex gap-2">
              <button type="submit" className="btn dz-btn-primary flex-fill">
                <i className="fas fa-search me-2"></i>
                Ara
              </button>
              <button
                type="button"
                className="btn dz-btn-outline-secondary"
                onClick={clearSearch}
              >
                <i className="fas fa-times me-2"></i>
                Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="dz-quick-filters mt-3">
          <div className="d-flex flex-wrap gap-2">
            <span className="dz-filter-label">Hızlı Seçim:</span>
            <button
              type="button"
              className="btn dz-btn-outline-primary dz-btn-sm"
              onClick={() => {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                setSearchData((prev) => ({
                  ...prev,
                  startDate: today.toISOString().slice(0, 16),
                  endDate: tomorrow.toISOString().slice(0, 16),
                }));
              }}
            >
              Bugün-Yarın
            </button>
            <button
              type="button"
              className="btn dz-btn-outline-primary dz-btn-sm"
              onClick={() => {
                const today = new Date();
                const nextWeek = new Date(today);
                nextWeek.setDate(nextWeek.getDate() + 7);

                setSearchData((prev) => ({
                  ...prev,
                  startDate: today.toISOString().slice(0, 16),
                  endDate: nextWeek.toISOString().slice(0, 16),
                }));
              }}
            >
              1 Hafta
            </button>
            <button
              type="button"
              className="btn dz-btn-outline-primary dz-btn-sm"
              onClick={() => {
                setSearchData((prev) => ({
                  ...prev,
                  category: "Luxury",
                }));
              }}
            >
              Lüks Araçlar
            </button>
            <button
              type="button"
              className="btn dz-btn-outline-primary dz-btn-sm"
              onClick={() => {
                setSearchData((prev) => ({
                  ...prev,
                  category: "Electric",
                }));
              }}
            >
              Elektrikli
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
