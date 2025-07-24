import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMemberContext } from "../context/MemberContext";

export const Navbar = () => {
  const { isLoggedIn, member, logout, isAdmin } = useMemberContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg dz-navbar">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand dz-brand" to="/">
          <img
            src="/images/drivezone-logo.png"
            alt="DriveZone"
            className="dz-logo"
          />
          <span className="dz-brand-text">DriveZone</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="fas fa-home"></i> Ana Sayfa
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/available-vehicles">
                <i className="fas fa-car"></i> Araçlar
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                <i className="fas fa-info-circle"></i> Hakkımızda
              </Link>
            </li>
            {isLoggedIn() && (
              <li className="nav-item">
                <Link className="nav-link" to="/my-bookings">
                  <i className="fas fa-calendar-alt"></i> Rezervasyonlarım
                </Link>
              </li>
            )}
            {isAdmin() && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fas fa-cog"></i> Admin Panel
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/admin/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/vehicles">
                      Araç Yönetimi
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/bookings">
                      Rezervasyon Yönetimi
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          {/* User section */}
          <ul className="navbar-nav">
            {!isLoggedIn() ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="fas fa-sign-in-alt"></i> Giriş Yap
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn dz-btn-secondary ms-2" to="/register">
                    <i className="fas fa-user-plus"></i> Üye Ol
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle dz-user-menu"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <img
                    src={member?.profileImage || "/images/default-avatar.png"}
                    alt="Profile"
                    className="dz-avatar"
                  />
                  <span className="dz-welcome">
                    Hoş geldin, {member?.firstName}
                    <small className="dz-membership-badge dz-badge-{member?.membershipLevel?.toLowerCase()}">
                      {member?.membershipLevel}
                    </small>
                  </span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li className="dropdown-header">
                    <div className="dz-user-info">
                      <strong>
                        {member?.firstName} {member?.lastName}
                      </strong>
                      <small>{member?.email}</small>
                      <div className="dz-loyalty-info">
                        <i className="fas fa-star text-warning"></i>
                        {member?.loyaltyPoints || 0} Puan
                      </div>
                    </div>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="fas fa-user"></i> Profilim
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-bookings">
                      <i className="fas fa-calendar-alt"></i> Rezervasyonlarım
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/loyalty">
                      <i className="fas fa-star"></i> Sadakat Puanları
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt"></i> Çıkış Yap
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
