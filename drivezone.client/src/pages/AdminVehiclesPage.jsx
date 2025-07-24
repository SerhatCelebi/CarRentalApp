import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMemberContext } from '../context/MemberContext';
import { VEHICLE_CATEGORIES, VEHICLE_CATEGORY_LABELS, FUEL_TYPES, FUEL_TYPE_LABELS, TRANSMISSION_TYPES, TRANSMISSION_TYPE_LABELS } from '../utils/constants';

export const AdminVehiclesPage = () => {
    const { isAdmin } = useMemberContext();
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const [filters, setFilters] = useState({
        category: '',
        fuelType: '',
        transmission: '',
        isAvailable: '',
        search: ''
    });

    const [sortBy, setSortBy] = useState('make');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);

    const [newVehicle, setNewVehicle] = useState({
        make: '',
        model: '',
        manufactureYear: new Date().getFullYear(),
        color: '',
        category: VEHICLE_CATEGORIES.ECONOMY,
        fuelType: FUEL_TYPES.GASOLINE,
        transmission: TRANSMISSION_TYPES.MANUAL,
        seatingCapacity: 5,
        dailyRate: 0,
        hourlyRate: 0,
        securityDeposit: 0,
        mileage: 0,
        licensePlate: '',
        description: '',
        location: 'TR',
        imageUrl: '',
        hasAirConditioning: true,
        hasGPS: false,
        hasBluetoothAudio: true,
        hasUSBPort: true,
        hasSunroof: false,
        hasBackupCamera: false
    });

    useEffect(() => {
        if (isAdmin()) {
            loadVehicles();
        }
    }, []);

    useEffect(() => {
        filterAndSortVehicles();
    }, [vehicles, filters, sortBy, sortOrder]);

    const loadVehicles = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/vehicles', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('drivezone_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setVehicles(data || []);
            } else {
                throw new Error('Araçlar yüklenemedi');
            }
        } catch (error) {
            console.error('Error loading vehicles:', error);
            setError(error.message);
            
            // Mock data for development
            const mockVehicles = [
                {
                    vehicleId: '1',
                    make: 'BMW',
                    model: 'X5',
                    manufactureYear: 2022,
                    color: 'Beyaz',
                    category: 'Luxury',
                    fuelType: 'Gasoline',
                    transmission: 'Automatic',
                    seatingCapacity: 7,
                    dailyRate: 500,
                    hourlyRate: 25,
                    securityDeposit: 2000,
                    mileage: 15000,
                    licensePlate: '34 ABC 123',
                    isAvailable: true,
                    location: 'TR',
                    hasAirConditioning: true,
                    hasGPS: true
                },
                {
                    vehicleId: '2',
                    make: 'Volkswagen',
                    model: 'Golf',
                    manufactureYear: 2021,
                    color: 'Gri',
                    category: 'Compact',
                    fuelType: 'Diesel',
                    transmission: 'Manual',
                    seatingCapacity: 5,
                    dailyRate: 200,
                    hourlyRate: 12,
                    securityDeposit: 800,
                    mileage: 25000,
                    licensePlate: '06 XYZ 789',
                    isAvailable: false,
                    location: 'AN',
                    hasAirConditioning: true,
                    hasGPS: false
                }
            ];
            setVehicles(mockVehicles);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortVehicles = () => {
        let filtered = [...vehicles];

        // Apply filters
        if (filters.category) {
            filtered = filtered.filter(vehicle => vehicle.category === filters.category);
        }
        
        if (filters.fuelType) {
            filtered = filtered.filter(vehicle => vehicle.fuelType === filters.fuelType);
        }

        if (filters.transmission) {
            filtered = filtered.filter(vehicle => vehicle.transmission === filters.transmission);
        }

        if (filters.isAvailable !== '') {
            const isAvailable = filters.isAvailable === 'true';
            filtered = filtered.filter(vehicle => vehicle.isAvailable === isAvailable);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(vehicle =>
                vehicle.make.toLowerCase().includes(searchTerm) ||
                vehicle.model.toLowerCase().includes(searchTerm) ||
                vehicle.licensePlate.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'vehicleName') {
                aValue = `${a.make} ${a.model}`;
                bValue = `${b.make} ${b.model}`;
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredVehicles(filtered);
        setCurrentPage(1);
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            fuelType: '',
            transmission: '',
            isAvailable: '',
            search: ''
        });
    };

    const toggleVehicleAvailability = async (vehicleId, currentStatus) => {
        try {
            const response = await fetch(`/api/admin/vehicles/${vehicleId}/availability`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('drivezone_token')}`
                },
                body: JSON.stringify({ isAvailable: !currentStatus })
            });

            if (response.ok) {
                setVehicles(prev => prev.map(vehicle =>
                    vehicle.vehicleId === vehicleId
                        ? { ...vehicle, isAvailable: !currentStatus }
                        : vehicle
                ));
                alert('Araç durumu güncellendi.');
            } else {
                throw new Error('Durum güncellenemedi');
            }
        } catch (error) {
            console.error('Error updating vehicle availability:', error);
            alert('Durum güncellenirken hata oluştu: ' + error.message);
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/admin/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('drivezone_token')}`
                },
                body: JSON.stringify(newVehicle)
            });

            if (response.ok) {
                const addedVehicle = await response.json();
                setVehicles(prev => [...prev, addedVehicle]);
                setShowAddModal(false);
                setNewVehicle({
                    make: '',
                    model: '',
                    manufactureYear: new Date().getFullYear(),
                    color: '',
                    category: VEHICLE_CATEGORIES.ECONOMY,
                    fuelType: FUEL_TYPES.GASOLINE,
                    transmission: TRANSMISSION_TYPES.MANUAL,
                    seatingCapacity: 5,
                    dailyRate: 0,
                    hourlyRate: 0,
                    securityDeposit: 0,
                    mileage: 0,
                    licensePlate: '',
                    description: '',
                    location: 'TR',
                    imageUrl: '',
                    hasAirConditioning: true,
                    hasGPS: false,
                    hasBluetoothAudio: true,
                    hasUSBPort: true,
                    hasSunroof: false,
                    hasBackupCamera: false
                });
                alert('Araç başarıyla eklendi.');
            } else {
                throw new Error('Araç eklenemedi');
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
            alert('Araç eklenirken hata oluştu: ' + error.message);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

    // Pagination
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

    if (!isAdmin()) {
        return (
            <div className="container">
                <div className="dz-error-state text-center py-5">
                    <div className="dz-error-icon mb-3">
                        <i className="fas fa-lock"></i>
                    </div>
                    <h4>Erişim Reddedildi</h4>
                    <p className="text-muted mb-4">Bu sayfaya erişim izniniz bulunmuyor.</p>
                    <Link to="/" className="btn dz-btn-primary">Ana Sayfaya Dön</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container">
                <div className="dz-loading-state text-center py-5">
                    <div className="spinner-border dz-spinner-primary" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                    <p className="mt-3">Araçlar yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dz-admin-vehicles">
            <div className="container">
                {/* Header */}
                <div className="dz-page-header py-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <Link to="/admin/dashboard">Admin</Link>
                                    </li>
                                    <li className="breadcrumb-item active">Araç Yönetimi</li>
                                </ol>
                            </nav>
                            <h1 className="dz-page-title">Araç Yönetimi</h1>
                            <p className="dz-page-subtitle">
                                Toplam {filteredVehicles.length} araç
                            </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <button 
                                className="btn dz-btn-primary me-2"
                                onClick={() => setShowAddModal(true)}
                            >
                                <i className="fas fa-plus me-2"></i>
                                Yeni Araç
                            </button>
                            <button 
                                className="btn dz-btn-outline-primary"
                                onClick={loadVehicles}
                            >
                                <i className="fas fa-sync-alt me-2"></i>
                                Yenile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="dz-card mb-4">
                    <div className="dz-card-header">
                        <h6 className="mb-0">
                            <i className="fas fa-filter me-2"></i>
                            Filtreler
                        </h6>
                    </div>
                    <div className="dz-card-body">
                        <div className="row">
                            <div className="col-md-2">
                                <label className="form-label">Kategori</label>
                                <select
                                    className="form-select"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <option value="">Tümü</option>
                                    {Object.entries(VEHICLE_CATEGORY_LABELS).map(([category, label]) => (
                                        <option key={category} value={category}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Yakıt Türü</label>
                                <select
                                    className="form-select"
                                    value={filters.fuelType}
                                    onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                                >
                                    <option value="">Tümü</option>
                                    {Object.entries(FUEL_TYPE_LABELS).map(([fuelType, label]) => (
                                        <option key={fuelType} value={fuelType}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Vites Türü</label>
                                <select
                                    className="form-select"
                                    value={filters.transmission}
                                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                                >
                                    <option value="">Tümü</option>
                                    {Object.entries(TRANSMISSION_TYPE_LABELS).map(([transmission, label]) => (
                                        <option key={transmission} value={transmission}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Durum</label>
                                <select
                                    className="form-select"
                                    value={filters.isAvailable}
                                    onChange={(e) => handleFilterChange('isAvailable', e.target.value)}
                                >
                                    <option value="">Tümü</option>
                                    <option value="true">Müsait</option>
                                    <option value="false">Dolu</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Ara</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Marka, model veya plaka ara..."
                                />
                            </div>
                            <div className="col-md-1 d-flex align-items-end">
                                <button
                                    className="btn dz-btn-outline-secondary w-100"
                                    onClick={clearFilters}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicles Grid */}
                <div className="dz-card">
                    <div className="dz-card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Araçlar</h6>
                        <div className="d-flex align-items-center gap-2">
                            <select
                                className="form-select form-select-sm"
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                            >
                                <option value="make-asc">Marka (A-Z)</option>
                                <option value="make-desc">Marka (Z-A)</option>
                                <option value="dailyRate-asc">Günlük Fiyat (Düşük-Yüksek)</option>
                                <option value="dailyRate-desc">Günlük Fiyat (Yüksek-Düşük)</option>
                                <option value="manufactureYear-desc">Yıl (Yeni-Eski)</option>
                                <option value="mileage-asc">Kilometre (Düşük-Yüksek)</option>
                            </select>
                        </div>
                    </div>
                    <div className="dz-card-body">
                        {currentVehicles.length > 0 ? (
                            <div className="row">
                                {currentVehicles.map((vehicle) => (
                                    <div key={vehicle.vehicleId} className="col-lg-4 col-md-6 mb-4">
                                        <div className="dz-vehicle-admin-card">
                                            <div className="dz-vehicle-image">
                                                <img 
                                                    src={vehicle.imageUrl || `/images/vehicles/${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase()}.jpg`}
                                                    alt={`${vehicle.make} ${vehicle.model}`}
                                                    className="img-fluid"
                                                    onError={(e) => {
                                                        e.target.src = '/images/vehicles/default-vehicle.jpg';
                                                    }}
                                                />
                                                <div className="dz-vehicle-status">
                                                    <span className={`badge ${vehicle.isAvailable ? 'bg-success' : 'bg-danger'}`}>
                                                        {vehicle.isAvailable ? 'Müsait' : 'Dolu'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="dz-vehicle-content p-3">
                                                <h5 className="dz-vehicle-title">
                                                    {vehicle.make} {vehicle.model}
                                                </h5>
                                                <div className="dz-vehicle-details">
                                                    <div className="row text-sm">
                                                        <div className="col-6">
                                                            <i className="fas fa-calendar me-1"></i>
                                                            {vehicle.manufactureYear}
                                                        </div>
                                                        <div className="col-6">
                                                            <i className="fas fa-palette me-1"></i>
                                                            {vehicle.color}
                                                        </div>
                                                        <div className="col-6">
                                                            <i className="fas fa-gas-pump me-1"></i>
                                                            {FUEL_TYPE_LABELS[vehicle.fuelType]}
                                                        </div>
                                                        <div className="col-6">
                                                            <i className="fas fa-cog me-1"></i>
                                                            {TRANSMISSION_TYPE_LABELS[vehicle.transmission]}
                                                        </div>
                                                        <div className="col-6">
                                                            <i className="fas fa-users me-1"></i>
                                                            {vehicle.seatingCapacity} kişi
                                                        </div>
                                                        <div className="col-6">
                                                            <i className="fas fa-tachometer-alt me-1"></i>
                                                            {vehicle.mileage?.toLocaleString()} km
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="dz-vehicle-pricing mt-3">
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <small className="text-muted">Günlük</small>
                                                            <div className="fw-bold text-success">
                                                                {formatCurrency(vehicle.dailyRate)}
                                                            </div>
                                                        </div>
                                                        <div className="col-6">
                                                            <small className="text-muted">Saatlik</small>
                                                            <div className="fw-bold text-info">
                                                                {formatCurrency(vehicle.hourlyRate)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="dz-vehicle-actions mt-3">
                                                    <div className="btn-group w-100">
                                                        <Link
                                                            to={`/admin/vehicles/${vehicle.vehicleId}`}
                                                            className="btn btn-sm dz-btn-outline-primary"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </Link>
                                                        <button
                                                            className={`btn btn-sm ${vehicle.isAvailable ? 'dz-btn-outline-warning' : 'dz-btn-outline-success'}`}
                                                            onClick={() => toggleVehicleAvailability(vehicle.vehicleId, vehicle.isAvailable)}
                                                        >
                                                            <i className={`fas ${vehicle.isAvailable ? 'fa-pause' : 'fa-play'}`}></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm dz-btn-outline-info"
                                                            onClick={() => alert('Maintenance feature coming soon!')}
                                                        >
                                                            <i className="fas fa-wrench"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                {vehicle.licensePlate && (
                                                    <div className="dz-license-plate mt-2 text-center">
                                                        <small className="badge bg-dark">
                                                            {vehicle.licensePlate}
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <i className="fas fa-car text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                <h5>Araç Bulunamadı</h5>
                                <p className="text-muted">
                                    {error ? 'Araçlar yüklenirken hata oluştu.' : 'Seçilen kriterlere uygun araç bulunmuyor.'}
                                </p>
                                <button className="btn dz-btn-primary" onClick={() => setShowAddModal(true)}>
                                    <i className="fas fa-plus me-2"></i>
                                    İlk Aracı Ekle
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="dz-card-footer">
                            <nav>
                                <ul className="pagination justify-content-center mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        >
                                            Önceki
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setCurrentPage(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        >
                                            Sonraki
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>

                {/* Add Vehicle Modal */}
                {showAddModal && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Yeni Araç Ekle</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowAddModal(false)}
                                    ></button>
                                </div>
                                <form onSubmit={handleAddVehicle}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Marka *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newVehicle.make}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, make: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Model *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newVehicle.model}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Yıl</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={newVehicle.manufactureYear}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, manufactureYear: parseInt(e.target.value) }))}
                                                    min="1990"
                                                    max={new Date().getFullYear() + 1}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Renk</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newVehicle.color}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, color: e.target.value }))}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Plaka *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newVehicle.licensePlate}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value }))}
                                                    placeholder="34 ABC 123"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Kategori</label>
                                                <select
                                                    className="form-select"
                                                    value={newVehicle.category}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, category: e.target.value }))}
                                                >
                                                    {Object.entries(VEHICLE_CATEGORY_LABELS).map(([category, label]) => (
                                                        <option key={category} value={category}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Yakıt Türü</label>
                                                <select
                                                    className="form-select"
                                                    value={newVehicle.fuelType}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, fuelType: e.target.value }))}
                                                >
                                                    {Object.entries(FUEL_TYPE_LABELS).map(([fuelType, label]) => (
                                                        <option key={fuelType} value={fuelType}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Vites Türü</label>
                                                <select
                                                    className="form-select"
                                                    value={newVehicle.transmission}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, transmission: e.target.value }))}
                                                >
                                                    {Object.entries(TRANSMISSION_TYPE_LABELS).map(([transmission, label]) => (
                                                        <option key={transmission} value={transmission}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Günlük Fiyat (₺)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={newVehicle.dailyRate}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, dailyRate: parseFloat(e.target.value) }))}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Saatlik Fiyat (₺)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={newVehicle.hourlyRate}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) }))}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label">Depozito (₺)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={newVehicle.securityDeposit}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, securityDeposit: parseFloat(e.target.value) }))}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">Açıklama</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    value={newVehicle.description}
                                                    onChange={(e) => setNewVehicle(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Araç hakkında ek bilgiler..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowAddModal(false)}
                                        >
                                            İptal
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn dz-btn-primary"
                                        >
                                            <i className="fas fa-plus me-2"></i>
                                            Araç Ekle
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .dz-vehicle-admin-card {
                    border: 1px solid #e9ecef;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    background: white;
                }

                .dz-vehicle-admin-card:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                }

                .dz-vehicle-image {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                }

                .dz-vehicle-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .dz-vehicle-status {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                }

                .dz-vehicle-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    color: #495057;
                }

                .dz-vehicle-details {
                    margin-bottom: 1rem;
                }

                .dz-vehicle-details .row > div {
                    padding: 0.25rem 0;
                    font-size: 0.875rem;
                    color: #6c757d;
                }

                .dz-vehicle-pricing {
                    border-top: 1px solid #e9ecef;
                    padding-top: 0.75rem;
                }

                .dz-license-plate {
                    border-top: 1px solid #e9ecef;
                    padding-top: 0.5rem;
                }
            `}</style>
        </div>
    );
}; 