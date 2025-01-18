import { Form, Input, Button, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import ArazitLogo from '../assets/Arazit.svg';
import { authService } from '../services/authService';
import { message } from 'antd';
import { useState, useEffect } from 'react';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // No token, stay on login page
      return;
    }

    // If session exists, verify it using existing authService
    const checkSession = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          // Session is valid, redirect to appropriate dashboard
          switch (currentUser.userData.roles.role_name) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'manager':
              navigate('/manager/dashboard');
              break;
            default:
              navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
      }
    };

    checkSession();
  }, [navigate]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await authService.signIn(values);
      const { userData, token } = response;
      
      // Save token to localStorage (this will work for both admin and user)
      if (token) {
        localStorage.setItem('token', token);
        
        // Also store the JWT token for user dashboard
        if (userData.roles.role_name === 'user') {
          try {
            // Generate JWT token for user dashboard
            const jwtResponse = await authService.generateUserToken({
              userId: userData.id,
              role: userData.roles.role_name
            });
            
            if (jwtResponse.token) {
              localStorage.setItem('user_jwt', jwtResponse.token);
            }
          } catch (jwtError) {
            console.error('JWT generation failed:', jwtError);
            // Continue with normal flow even if JWT generation fails
          }
        }
      }
      
      // Keep existing role-based routing
      switch (userData.roles.role_name) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'manager':
          navigate('/manager/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
      
      message.success('Successfully logged in!');
    } catch (error) {
      message.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <img 
            src={ArazitLogo} 
            alt="Arazit Logo" 
            className="h-16 mx-auto mb-4"
          />
          <Title level={2} style={{ color: theme.colors.primary, marginBottom: 8 }}>
            Laibarak CRM
          </Title>
          <Text className="text-gray-500">
            CRM for Travel & Umrah Industry
          </Text>
        </div>

        <Divider />

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Email Address"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a 
                href="#" 
                className="text-sm"
                style={{ color: theme.colors.primary }}
              >
                Forgot password?
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ 
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.primary,
                height: '48px'
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text className="text-gray-500">
            Don't have an account?{' '}
            <a 
              href="#" 
              style={{ color: theme.colors.primary }}
            >
              Contact Admin
            </a>
          </Text>
        </div>

        <div className="mt-8 text-center">
          <Text className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-gray-600">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-gray-600">Privacy Policy</a>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login; 