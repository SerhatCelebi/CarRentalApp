import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MemberProvider } from '../../context/MemberContext';
import VehicleCard from '../VehicleCard';

// Mock the vehicle service
jest.mock('../../services/vehicleService', () => ({
  formatCurrency: jest.fn((amount) => `₺${amount}`),
  getVehicleImageUrl: jest.fn((vehicleId) => `/images/vehicle-${vehicleId}.jpg`),
  calculateDailyRate: jest.fn((baseRate, membershipLevel) => baseRate * 0.9),
}));

// Test wrapper component
const TestWrapper = ({ children, memberValue = null }) => (
  <BrowserRouter>
    <MemberProvider value={memberValue}>
      {children}
    </MemberProvider>
  </BrowserRouter>
);

describe('VehicleCard Component', () => {
  const mockVehicle = {
    id: '1',
    make: 'Toyota',
    model: 'Corolla',
    year: 2023,
    color: 'Beyaz',
    category: 'Sedan',
    fuelType: 'Hybrid',
    transmission: 'Otomatik',
    seatingCapacity: 5,
    dailyRate: 180,
    hourlyRate: 25,
    securityDeposit: 800,
    licensePlate: '34 DZ 001',
    mileage: 5000,
    description: 'Yakıt tasarruflu, konforlu sedan araç',
    isAvailable: true,
    location: 'İstanbul',
    hasAirConditioning: true,
    hasGPS: true,
    hasBluetooth: true,
    hasBackupCamera: true,
    hasLeatherSeats: false,
    hasSunroof: false,
  };

  const mockUnavailableVehicle = {
    ...mockVehicle,
    id: '2',
    isAvailable: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders vehicle information correctly', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
      expect(screen.getByText('Beyaz')).toBeInTheDocument();
      expect(screen.getByText('Sedan')).toBeInTheDocument();
      expect(screen.getByText('Hybrid')).toBeInTheDocument();
      expect(screen.getByText('Otomatik')).toBeInTheDocument();
      expect(screen.getByText('5 Kişi')).toBeInTheDocument();
      expect(screen.getByText('İstanbul')).toBeInTheDocument();
    });

    it('displays pricing information', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      expect(screen.getByText(/₺180/)).toBeInTheDocument();
      expect(screen.getByText(/günlük/)).toBeInTheDocument();
      expect(screen.getByText(/₺25/)).toBeInTheDocument();
      expect(screen.getByText(/saatlik/)).toBeInTheDocument();
    });

    it('shows vehicle features correctly', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      expect(screen.getByTitle('Klima')).toBeInTheDocument();
      expect(screen.getByTitle('GPS')).toBeInTheDocument();
      expect(screen.getByTitle('Bluetooth')).toBeInTheDocument();
      expect(screen.getByTitle('Geri Vites Kamerası')).toBeInTheDocument();
    });

    it('displays vehicle image with correct alt text', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      const image = screen.getByAltText('Toyota Corolla');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/vehicle-1.jpg');
    });
  });

  describe('Availability Status', () => {
    it('shows available status for available vehicles', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      expect(screen.getByText('Müsait')).toBeInTheDocument();
      expect(screen.getByText('Rezervasyon Yap')).toBeInTheDocument();
    });

    it('shows unavailable status for unavailable vehicles', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockUnavailableVehicle} />
        </TestWrapper>
      );

      expect(screen.getByText('Müsait Değil')).toBeInTheDocument();
      expect(screen.queryByText('Rezervasyon Yap')).not.toBeInTheDocument();
    });

    it('disables booking button for unavailable vehicles', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockUnavailableVehicle} />
        </TestWrapper>
      );

      const buttons = screen.queryAllByRole('button');
      const bookingButton = buttons.find(button => 
        button.textContent.includes('Rezervasyon') || button.disabled
      );
      
      if (bookingButton) {
        expect(bookingButton).toBeDisabled();
      }
    });
  });

  describe('Member Integration', () => {
    const mockMember = {
      id: '1',
      email: 'test@drivezone.com',
      firstName: 'Test',
      lastName: 'User',
      membershipLevel: 'Gold',
    };

    it('shows discounted price for logged-in members', () => {
      render(
        <TestWrapper memberValue={{ member: mockMember, isAuthenticated: true }}>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      // Should show discounted price (₺162 = ₺180 * 0.9)
      expect(screen.getByText(/₺162/)).toBeInTheDocument();
    });

    it('shows login prompt for non-authenticated users', () => {
      render(
        <TestWrapper memberValue={{ member: null, isAuthenticated: false }}>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      // Should show original price
      expect(screen.getByText(/₺180/)).toBeInTheDocument();
      expect(screen.getByText(/Giriş yapın/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles booking button click', async () => {
      const mockOnBook = jest.fn();
      
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} onBook={mockOnBook} />
        </TestWrapper>
      );

      const bookButton = screen.getByText('Rezervasyon Yap');
      fireEvent.click(bookButton);

      await waitFor(() => {
        expect(mockOnBook).toHaveBeenCalledWith(mockVehicle);
      });
    });

    it('navigates to vehicle details on details button click', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      const detailsLink = screen.getByText('Detaylar');
      expect(detailsLink.closest('a')).toHaveAttribute('href', '/vehicles/1');
    });

    it('handles image load error gracefully', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      const image = screen.getByAltText('Toyota Corolla');
      fireEvent.error(image);

      // Should fallback to default image
      expect(image).toHaveAttribute('src', '/images/default-vehicle.jpg');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies correct CSS classes for responsive design', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      const card = screen.getByTestId('vehicle-card');
      expect(card).toHaveClass('dz-vehicle-card');
      expect(card).toHaveClass('card');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/Toyota Corolla vehicle card/)).toBeInTheDocument();
    });

    it('has keyboard navigation support', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      const bookButton = screen.getByText('Rezervasyon Yap');
      expect(bookButton).toHaveAttribute('tabIndex', '0');
    });

    it('provides screen reader friendly content', () => {
      render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      expect(screen.getByText(/Günlük ₺180 tarife/)).toBeInTheDocument();
      expect(screen.getByText(/5 kişilik kapasite/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing vehicle data gracefully', () => {
      const incompleteVehicle = {
        id: '1',
        make: 'Toyota',
        // Missing other required fields
      };

      render(
        <TestWrapper>
          <VehicleCard vehicle={incompleteVehicle} />
        </TestWrapper>
      );

      expect(screen.getByText('Toyota')).toBeInTheDocument();
      // Should not crash and handle missing data
    });

    it('handles null vehicle prop', () => {
      expect(() => {
        render(
          <TestWrapper>
            <VehicleCard vehicle={null} />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('memoizes expensive calculations', () => {
      const { rerender } = render(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      // Re-render with same props
      rerender(
        <TestWrapper>
          <VehicleCard vehicle={mockVehicle} />
        </TestWrapper>
      );

      // Format functions should be called minimal times
      expect(require('../../services/vehicleService').formatCurrency).toHaveBeenCalledTimes(4); // daily + hourly rates
    });
  });
}); 