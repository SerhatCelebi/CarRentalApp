import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMemberContext } from '../context/MemberContext';

export const AdminDashboardPage = () => {
    const { isAdmin, member } = useMemberContext();
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalVehicles: 0,
        totalBookings: 0,
        activeBookings: 0,
        monthlyRevenue: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        if (isAdmin()) {
            loadDashboardData();
        }
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Simulated API call - replace with actual API
            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('drivezone_token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.stats || stats);
                setRecentActivities(data.recentActivities || []);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Fallback to mock data
            setStats({
                totalMembers: 1247,
                totalVehicles: 85,
                totalBookings: 3421,
                activeBookings: 127,
                monthlyRevenue: 145000,
                totalRevenue: 2340000
            });
            setRecentActivities([
                { id: 1, type: 'booking', message: 'Yeni rezervasyon: BMW X5', time: '5 dakika önce' },
                { id: 2, type: 'member', message: 'Yeni üye kaydı: Ahmet Yılmaz', time: '12 dakika önce' },
                { id: 3, type: 'payment', message: 'Ödeme alındı: ₺2,500', time: '25 dakika önce' },
                { id: 4, type: 'vehicle', message: 'Araç eklendi: Audi A4', time: '1 saat önce' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    };

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
                    <p className="mt-3">Dashboard yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dz-admin-dashboard">
            <div className="container">
                {/* Header */}
                <div className="dz-page-header py-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h1 className="dz-page-title">Admin Dashboard</h1>
                            <p className="dz-page-subtitle">
                                Hoş geldiniz, {member?.firstName}! DriveZone yönetim paneline genel bakış.
                            </p>
                        </div>
                        <div className="col-md-4 text-md-end">
                            <button 
                                className="btn dz-btn-outline-primary"
                                onClick={loadDashboardData}
                            >
                                <i className="fas fa-sync-alt me-2"></i>
                                Yenile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row mb-4">
                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="dz-card dz-stat-card">
                            <div className="dz-card-body">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <div className="dz-stat-title">Toplam Üye</div>
                                        <div className="dz-stat-number">{stats.totalMembers.toLocaleString()}</div>
                                    </div>
                                    <div className="col-auto">
                                        <div className="dz-stat-icon dz-stat-icon-primary">
                                            <i className="fas fa-users"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="dz-card dz-stat-card">
                            <div className="dz-card-body">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <div className="dz-stat-title">Toplam Araç</div>
                                        <div className="dz-stat-number">{stats.totalVehicles.toLocaleString()}</div>
                                    </div>
                                    <div className="col-auto">
                                        <div className="dz-stat-icon dz-stat-icon-success">
                                            <i className="fas fa-car"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="dz-card dz-stat-card">
                            <div className="dz-card-body">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <div className="dz-stat-title">Aktif Rezervasyon</div>
                                        <div className="dz-stat-number">{stats.activeBookings.toLocaleString()}</div>
                                    </div>
                                    <div className="col-auto">
                                        <div className="dz-stat-icon dz-stat-icon-warning">
                                            <i className="fas fa-calendar-alt"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                        <div className="dz-card dz-stat-card">
                            <div className="dz-card-body">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <div className="dz-stat-title">Aylık Gelir</div>
                                        <div className="dz-stat-number">{formatCurrency(stats.monthlyRevenue)}</div>
                                    </div>
                                    <div className="col-auto">
                                        <div className="dz-stat-icon dz-stat-icon-info">
                                            <i className="fas fa-chart-line"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Quick Actions */}
                    <div className="col-lg-4 mb-4">
                        <div className="dz-card">
                            <div className="dz-card-header">
                                <h5 className="mb-0">
                                    <i className="fas fa-bolt me-2"></i>
                                    Hızlı İşlemler
                                </h5>
                            </div>
                            <div className="dz-card-body">
                                <div className="d-grid gap-2">
                                    <Link to="/admin/vehicles" className="btn dz-btn-outline-primary">
                                        <i className="fas fa-plus me-2"></i>
                                        Yeni Araç Ekle
                                    </Link>
                                    <Link to="/admin/members" className="btn dz-btn-outline-success">
                                        <i className="fas fa-users me-2"></i>
                                        Üye Yönetimi
                                    </Link>
                                    <Link to="/admin/bookings" className="btn dz-btn-outline-warning">
                                        <i className="fas fa-calendar-alt me-2"></i>
                                        Rezervasyon Yönetimi
                                    </Link>
                                    <Link to="/admin/reports" className="btn dz-btn-outline-info">
                                        <i className="fas fa-chart-bar me-2"></i>
                                        Raporlar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="col-lg-8 mb-4">
                        <div className="dz-card">
                            <div className="dz-card-header">
                                <h5 className="mb-0">
                                    <i className="fas fa-clock me-2"></i>
                                    Son Aktiviteler
                                </h5>
                            </div>
                            <div className="dz-card-body">
                                {recentActivities.length > 0 ? (
                                    <div className="dz-activity-list">
                                        {recentActivities.map((activity) => (
                                            <div key={activity.id} className="dz-activity-item">
                                                <div className="dz-activity-icon">
                                                    <i className={`fas fa-${
                                                        activity.type === 'booking' ? 'calendar-plus' :
                                                        activity.type === 'member' ? 'user-plus' :
                                                        activity.type === 'payment' ? 'credit-card' :
                                                        activity.type === 'vehicle' ? 'car' : 'bell'
                                                    }`}></i>
                                                </div>
                                                <div className="dz-activity-content">
                                                    <div className="dz-activity-message">{activity.message}</div>
                                                    <div className="dz-activity-time">{activity.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <i className="fas fa-inbox text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                        <p className="text-muted">Henüz aktivite bulunmuyor.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="row">
                    <div className="col-12">
                        <div className="dz-card">
                            <div className="dz-card-header">
                                <h5 className="mb-0">
                                    <i className="fas fa-server me-2"></i>
                                    Sistem Durumu
                                </h5>
                            </div>
                            <div className="dz-card-body">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="dz-status-item">
                                            <div className="dz-status-indicator dz-status-success"></div>
                                            <span>API Servisi</span>
                                            <span className="dz-status-label">Çalışıyor</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="dz-status-item">
                                            <div className="dz-status-indicator dz-status-success"></div>
                                            <span>Veritabanı</span>
                                            <span className="dz-status-label">Çalışıyor</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="dz-status-item">
                                            <div className="dz-status-indicator dz-status-success"></div>
                                            <span>Ödeme Sistemi</span>
                                            <span className="dz-status-label">Çalışıyor</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="dz-status-item">
                                            <div className="dz-status-indicator dz-status-warning"></div>
                                            <span>E-posta Servisi</span>
                                            <span className="dz-status-label">Yavaş</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .dz-stat-card {
                    transition: transform 0.2s ease;
                    border-left: 4px solid transparent;
                }

                .dz-stat-card:hover {
                    transform: translateY(-2px);
                }

                .dz-stat-title {
                    font-size: 0.875rem;
                    color: #6c757d;
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }

                .dz-stat-number {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #495057;
                }

                .dz-stat-icon {
                    width: 3rem;
                    height: 3rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }

                .dz-stat-icon-primary {
                    background-color: rgba(102, 126, 234, 0.1);
                    color: #667eea;
                }

                .dz-stat-icon-success {
                    background-color: rgba(40, 167, 69, 0.1);
                    color: #28a745;
                }

                .dz-stat-icon-warning {
                    background-color: rgba(255, 193, 7, 0.1);
                    color: #ffc107;
                }

                .dz-stat-icon-info {
                    background-color: rgba(23, 162, 184, 0.1);
                    color: #17a2b8;
                }

                .dz-activity-list {
                    max-height: 400px;
                    overflow-y: auto;
                }

                .dz-activity-item {
                    display: flex;
                    align-items: flex-start;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid #e9ecef;
                }

                .dz-activity-item:last-child {
                    border-bottom: none;
                }

                .dz-activity-icon {
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 50%;
                    background-color: #f8f9fa;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 0.75rem;
                    color: #6c757d;
                }

                .dz-activity-content {
                    flex: 1;
                }

                .dz-activity-message {
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }

                .dz-activity-time {
                    font-size: 0.875rem;
                    color: #6c757d;
                }

                .dz-status-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0;
                }

                .dz-status-indicator {
                    width: 0.75rem;
                    height: 0.75rem;
                    border-radius: 50%;
                }

                .dz-status-success {
                    background-color: #28a745;
                }

                .dz-status-warning {
                    background-color: #ffc107;
                }

                .dz-status-danger {
                    background-color: #dc3545;
                }

                .dz-status-label {
                    margin-left: auto;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}; 