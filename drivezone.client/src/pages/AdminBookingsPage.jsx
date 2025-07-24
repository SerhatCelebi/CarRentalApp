import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMemberContext } from '../context/MemberContext';
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../utils/constants';

export const AdminBookingsPage = () => {
    const { isAdmin } = useMemberContext();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        status: '',
        memberName: '',
        vehicleMake: '',
        dateFrom: '',
        dateTo: ''
    });

    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    useEffect(() => {
        if (isAdmin()) {
            loadBookings();
        }
    }, []);

    useEffect(() => {
        filterAndSortBookings();
    }, [bookings, filters, sortBy, sortOrder]);

    const loadBookings = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/bookings', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('drivezone_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data || []);
            } else {
                throw new Error('Rezervasyonlar yüklenemedi');
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            setError(error.message);
            
            // Mock data for development
            const mockBookings = [
                {
                    bookingId: '1',
                    bookingReference: 'DZ-2024-001',
                    member: { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com' },
                    vehicle: { make: 'BMW', model: 'X5', licensePlate: '34 ABC 123' },
                    bookingStartDate: '2024-02-01T10:00:00',
                    bookingEndDate: '2024-02-05T10:00:00',
                    totalAmount: 2500,
                    status: 'Confirmed',
                    createdAt: '2024-01-28T14:30:00'
                },
                {
                    bookingId: '2',
                    bookingReference: 'DZ-2024-002',
                    member: { firstName: 'Zeynep', lastName: 'Kaya', email: 'zeynep@example.com' },
                    vehicle: { make: 'Audi', model: 'A4', licensePlate: '06 XYZ 789' },
                    bookingStartDate: '2024-02-02T14:00:00',
                    bookingEndDate: '2024-02-04T14:00:00',
                    totalAmount: 1200,
                    status: 'Pending',
                    createdAt: '2024-01-29T09:15:00'
                }
            ];
            setBookings(mockBookings);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortBookings = () => {
        let filtered = [...bookings];

        // Apply filters
        if (filters.status) {
            filtered = filtered.filter(booking => booking.status === filters.status);
        }
        
        if (filters.memberName) {
            filtered = filtered.filter(booking => 
                `${booking.member.firstName} ${booking.member.lastName}`
                    .toLowerCase()
                    .includes(filters.memberName.toLowerCase())
            );
        }

        if (filters.vehicleMake) {
            filtered = filtered.filter(booking =>
                booking.vehicle.make.toLowerCase().includes(filters.vehicleMake.toLowerCase())
            );
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(booking =>
                new Date(booking.bookingStartDate) >= new Date(filters.dateFrom)
            );
        }

        if (filters.dateTo) {
            filtered = filtered.filter(booking =>
                new Date(booking.bookingEndDate) <= new Date(filters.dateTo)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'memberName') {
                aValue = `${a.member.firstName} ${a.member.lastName}`;
                bValue = `${b.member.firstName} ${b.member.lastName}`;
            } else if (sortBy === 'vehicleName') {
                aValue = `${a.vehicle.make} ${a.vehicle.model}`;
                bValue = `${b.vehicle.make} ${b.vehicle.model}`;
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

        setFilteredBookings(filtered);
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
            status: '',
            memberName: '',
            vehicleMake: '',
            dateFrom: '',
            dateTo: ''
        });
    };

    const updateBookingStatus = async (bookingId, newStatus) => {
        try {
            const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('drivezone_token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setBookings(prev => prev.map(booking =>
                    booking.bookingId === bookingId
                        ? { ...booking, status: newStatus }
                        : booking
                ));
                alert('Rezervasyon durumu güncellendi.');
            } else {
                throw new Error('Durum güncellenemedi');
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
            alert('Durum güncellenirken hata oluştu: ' + error.message);
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
            month: 'short',
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
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.75rem',
            fontWeight: '500'
        };
    };

    // Pagination
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookings.slice(startIndex, endIndex);

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
                    <p className="mt-3">Rezervasyonlar yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dz-admin-bookings">
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
                                    <li className="breadcrumb-item active">Rezervasyon Yönetimi</li>
                                </ol>
                            </nav>
                            <h1 className="dz-page-title">Rezervasyon Yönetimi</h1>
                            <p className="dz-page-subtitle">
                                Toplam {filteredBookings.length} rezervasyon
                            </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <button 
                                className="btn dz-btn-outline-primary"
                                onClick={loadBookings}
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
                                <label className="form-label">Durum</label>
                                <select
                                    className="form-select"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="">Tümü</option>
                                    {Object.entries(BOOKING_STATUS_LABELS).map(([status, label]) => (
                                        <option key={status} value={status}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Üye Adı</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={filters.memberName}
                                    onChange={(e) => handleFilterChange('memberName', e.target.value)}
                                    placeholder="Üye ara..."
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Araç Markası</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={filters.vehicleMake}
                                    onChange={(e) => handleFilterChange('vehicleMake', e.target.value)}
                                    placeholder="Marka ara..."
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Başlangıç</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Bitiş</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button
                                    className="btn dz-btn-outline-secondary w-100"
                                    onClick={clearFilters}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Temizle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="dz-card">
                    <div className="dz-card-header d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Rezervasyonlar</h6>
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
                                <option value="createdAt-desc">Yeni Önce</option>
                                <option value="createdAt-asc">Eski Önce</option>
                                <option value="bookingStartDate-asc">Başlangıç Tarihi (A-Z)</option>
                                <option value="bookingStartDate-desc">Başlangıç Tarihi (Z-A)</option>
                                <option value="totalAmount-desc">Tutar (Yüksek-Düşük)</option>
                                <option value="totalAmount-asc">Tutar (Düşük-Yüksek)</option>
                            </select>
                        </div>
                    </div>
                    <div className="dz-card-body p-0">
                        {currentBookings.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Rezervasyon No</th>
                                            <th>Üye</th>
                                            <th>Araç</th>
                                            <th>Tarihler</th>
                                            <th>Tutar</th>
                                            <th>Durum</th>
                                            <th>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentBookings.map((booking) => (
                                            <tr key={booking.bookingId}>
                                                <td>
                                                    <Link 
                                                        to={`/admin/bookings/${booking.bookingId}`}
                                                        className="text-decoration-none fw-bold"
                                                    >
                                                        {booking.bookingReference}
                                                    </Link>
                                                    <br />
                                                    <small className="text-muted">
                                                        {formatDate(booking.createdAt)}
                                                    </small>
                                                </td>
                                                <td>
                                                    <div>
                                                        <strong>
                                                            {booking.member.firstName} {booking.member.lastName}
                                                        </strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {booking.member.email}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <strong>
                                                            {booking.vehicle.make} {booking.vehicle.model}
                                                        </strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {booking.vehicle.licensePlate}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>
                                                        <small>
                                                            <i className="fas fa-calendar-plus me-1"></i>
                                                            {formatDate(booking.bookingStartDate)}
                                                        </small>
                                                        <br />
                                                        <small>
                                                            <i className="fas fa-calendar-minus me-1"></i>
                                                            {formatDate(booking.bookingEndDate)}
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong className="text-success">
                                                        {formatCurrency(booking.totalAmount)}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span style={getStatusBadgeClass(booking.status)}>
                                                        {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group">
                                                        <Link
                                                            to={`/admin/bookings/${booking.bookingId}`}
                                                            className="btn btn-sm dz-btn-outline-primary"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </Link>
                                                        <button
                                                            className="btn btn-sm dz-btn-outline-success"
                                                            onClick={() => updateBookingStatus(booking.bookingId, 'Confirmed')}
                                                            disabled={booking.status === 'Confirmed'}
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-sm dz-btn-outline-danger"
                                                            onClick={() => updateBookingStatus(booking.bookingId, 'Cancelled')}
                                                            disabled={booking.status === 'Cancelled'}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <i className="fas fa-calendar-times text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                <h5>Rezervasyon Bulunamadı</h5>
                                <p className="text-muted">
                                    {error ? 'Rezervasyonlar yüklenirken hata oluştu.' : 'Seçilen kriterlere uygun rezervasyon bulunmuyor.'}
                                </p>
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
            </div>
        </div>
    );
}; 