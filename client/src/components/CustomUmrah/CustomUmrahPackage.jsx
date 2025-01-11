import React, { useState } from 'react';
import { Modal, Steps, Button, message } from 'antd';
import CustomUmrahHotels from './CustomUmrahHotels';
import CustomUmrahServices from './CustomUmrahServices';
import CustomUmrahPrices from './CustomUmrahPrices';
import theme from '../../theme';
import axios from 'axios';

const CustomUmrahPackage = ({ visible, onCancel, leadId }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    hotels: {},
    services: [],
    prices: {}
  });

  const steps = [
    { title: 'Hotel Details', content: 'hotels' },
    { title: 'Services', content: 'services' },
    { title: 'Pricing', content: 'prices' }
  ];

  const handleStepChange = (data, step) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  const handleSubmit = async () => {
    try {
      // First create hotel
      const hotelResponse = await axios.post('/api/custom-umrah/hotels', {
        ...formData.hotels,
        lead_id: leadId,
        updated_at: new Date().toISOString()
      });

      const hotelId = hotelResponse.data.id;

      // Then create services
      const servicesPromises = formData.services.map(service => 
        axios.post('/api/custom-umrah/services', {
          ...service,
          custom_umrah_hotel_id: hotelId,
          updated_at: new Date().toISOString()
        })
      );
      await Promise.all(servicesPromises);

      // Finally create price
      await axios.post('/api/custom-umrah/prices', {
        ...formData.prices,
        custom_umrah_hotel_id: hotelId,
        updated_at: new Date().toISOString()
      });

      message.success('Package created successfully');
      onCancel();
    } catch (error) {
      message.error('Failed to create package');
      console.error('Error:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CustomUmrahHotels
            data={formData.hotels}
            onChange={(data) => handleStepChange(data, 'hotels')}
          />
        );
      case 1:
        return (
          <CustomUmrahServices
            data={formData.services}
            onChange={(data) => handleStepChange(data, 'services')}
          />
        );
      case 2:
        return (
          <CustomUmrahPrices
            data={formData.prices}
            onChange={(data) => handleStepChange(data, 'prices')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title="Create Custom Umrah Package"
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={null}
    >
      <Steps 
        current={currentStep} 
        items={steps} 
        style={{ marginBottom: 24 }}
        className="custom-steps"
      />
      
      {renderStepContent()}

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        {currentStep > 0 && (
          <Button style={{ marginRight: 8 }} onClick={() => setCurrentStep(currentStep - 1)}>
            Previous
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button 
            type="primary" 
            onClick={() => setCurrentStep(currentStep + 1)}
            style={{ backgroundColor: theme.colors.primary }}
          >
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button 
            type="primary" 
            onClick={handleSubmit}
            style={{ backgroundColor: theme.colors.primary }}
          >
            Submit
          </Button>
        )}
      </div>
    </Modal>
  );
};


// if (typeof document !== 'undefined') {
//   const styleSheet = document.createElement('style');
//   styleSheet.innerText = styles;
//   document.head.appendChild(styleSheet);
// }

export default CustomUmrahPackage; 