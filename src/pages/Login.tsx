
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { login, loading, isAuthenticated } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Track login attempts for debugging
    setLoginAttempts(prev => prev + 1);
    console.log(`Login attempt ${loginAttempts + 1} for email: ${email}`);
    
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      // Log more information for debugging
      console.log(`Login failed for email: ${email}`);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-background p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-okash-primary">{t("app.name")}</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("app.login")}</CardTitle>
            <CardDescription>
              Enter your credentials to access the management system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("app.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@okash.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("app.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-okash-accent hover:bg-okash-secondary" 
                disabled={loading}
              >
                {loading ? "Authenticating..." : t("app.login.button")}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center mt-4 text-sm text-gray-500">
          <p>Demo credentials: admin@okash.com / password</p>
          {loginAttempts > 0 && (
            <p className="mt-2 text-xs text-red-500">
              Login attempts: {loginAttempts}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
