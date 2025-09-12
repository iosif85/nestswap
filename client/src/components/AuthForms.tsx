import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

interface AuthFormsProps {
  onLogin?: (email: string, password: string) => void;
  onRegister?: (userData: any) => void;
  onForgotPassword?: (email: string) => void;
}

export default function AuthForms({
  onLogin = () => console.log('Login attempted'),
  onRegister = () => console.log('Registration attempted'),
  onForgotPassword = () => console.log('Password reset requested'),
}: AuthFormsProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    country: '',
    agreeToTerms: false,
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginForm.email, loginForm.password);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!registerForm.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    onRegister(registerForm);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    onForgotPassword(forgotPasswordEmail);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Log In</TabsTrigger>
          <TabsTrigger value="register">Sign Up</TabsTrigger>
        </TabsList>

        {/* Login Form */}
        <TabsContent value="login" className="space-y-6 mt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Log in to access your NestSwap account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="pl-10"
                  required
                  data-testid="input-login-email"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                  data-testid="input-login-password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="text-sm p-0 h-auto"
                onClick={() => setActiveTab('forgot-password')}
                data-testid="button-forgot-password"
              >
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full" data-testid="button-login-submit">
              Log In
            </Button>
          </form>
        </TabsContent>

        {/* Register Form */}
        <TabsContent value="register" className="space-y-6 mt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Join NestSwap</h2>
            <p className="text-muted-foreground mt-2">
              Create an account to start swapping
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Full Name</Label>
                <div className="relative">
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="pl-10"
                    required
                    data-testid="input-register-name"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="pl-10"
                    required
                    data-testid="input-register-email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone</Label>
                  <div className="relative">
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="+44 7700 900000"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      className="pl-10"
                      data-testid="input-register-phone"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-country">Country</Label>
                  <div className="relative">
                    <Input
                      id="register-country"
                      type="text"
                      placeholder="United Kingdom"
                      value={registerForm.country}
                      onChange={(e) => setRegisterForm({ ...registerForm, country: e.target.value })}
                      className="pl-10"
                      required
                      data-testid="input-register-country"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                    data-testid="input-register-password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="pl-10"
                    required
                    data-testid="input-register-confirm-password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agree-terms"
                checked={registerForm.agreeToTerms}
                onCheckedChange={(checked) => 
                  setRegisterForm({ ...registerForm, agreeToTerms: checked as boolean })
                }
                data-testid="checkbox-agree-terms"
              />
              <Label htmlFor="agree-terms" className="text-sm">
                I agree to the{' '}
                <Button variant="ghost" className="text-sm p-0 h-auto">
                  Terms & Conditions
                </Button>{' '}
                and{' '}
                <Button variant="ghost" className="text-sm p-0 h-auto">
                  Privacy Policy
                </Button>
              </Label>
            </div>

            <Button type="submit" className="w-full" data-testid="button-register-submit">
              Create Account
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {/* Forgot Password Form */}
      {activeTab === 'forgot-password' && (
        <div className="space-y-6 mt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
            <p className="text-muted-foreground mt-2">
              Enter your email to receive a reset link
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="your@email.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-forgot-email"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button type="submit" className="w-full" data-testid="button-reset-submit">
              Send Reset Link
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setActiveTab('login')}
              data-testid="button-back-to-login"
            >
              Back to Log In
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}