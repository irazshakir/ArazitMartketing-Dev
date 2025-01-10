import React, { useState } from 'react';
import { Modal, Steps, Button, message } from 'antd';
import CustomUmrahHotels from './CustomUmrahHotels';
import CustomUmrahServices from './CustomUmrahServices';
import CustomUmrahPrices from './CustomUmrahPrices';
import theme from '../../theme';

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
      // API call will be implemented later
      message.success('Package created successfully');
      onCancel();
    } catch (error) {
      message.error('Failed to create package');
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


if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default CustomUmrahPackage; 