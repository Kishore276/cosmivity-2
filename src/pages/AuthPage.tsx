import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Chrome, GraduationCap, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StarsBackground } from '@/components/ui/stars-background';
import { BgGradient } from '@/components/ui/bg-gradient';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { OrbitalLoader } from '@/components/ui/orbital-loader'


interface AuthFormData {
  email: string
  password: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
  college?: string;
}

const AuthPage: React.FC = () => {
  const defaultTab = 'signin';
  const showSocialAuth = true;
  const title = 'Welcome';
  const subtitle = 'Sign in to your account or create a new one';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { firebaseUser, loading } = useUser();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [signInData, setSignInData] = useState<AuthFormData>({
    email: '',
    password: ''
  });
  
  const [signUpData, setSignUpData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    college: '',
  });
  
  const handleSubmit = async (e: React.FormEvent, type: 'signin' | 'signup') => {
    e.preventDefault()
    setIsLoading(true)
    
    if (type === 'signup') {
        if (signUpData.password !== signUpData.confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
            setIsLoading(false);
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password);
            const user = userCredential.user;

            const newUserProfile = {
                name: `${signUpData.firstName} ${signUpData.lastName}`,
                email: signUpData.email,
                college: signUpData.college || '',
                bio: '',
                avatarUrl: '',
                github: '',
                linkedin: '',
                website: '',
                skills: [],
                experience: [],
                projects: [],
                certifications: [],
                title: '',
                location: '',
                phone: '',
            };

            await setDoc(doc(db, "users", user.uid), newUserProfile);
            
            toast({ variant: 'success', title: 'Success', description: 'Your account has been created.' });
            // The onAuthStateChanged listener in UserContext will handle the redirect
            navigate('/dashboard');

        } catch (error: any) {
            let description = 'An unexpected error occurred. Please try again.';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    description = 'An account with this email already exists.';
                    break;
                case 'auth/invalid-email':
                    description = 'The email address is not valid.';
                    break;
                case 'auth/weak-password':
                    description = 'The password is too weak. Please choose a stronger password.';
                    break;
            }
            toast({ variant: 'destructive', title: 'Sign-up Failed', description });
        }

    } else { // Sign-in
        try {
            await signInWithEmailAndPassword(auth, signInData.email, signInData.password);
            toast({ variant: 'success', title: 'Success', description: "You've been signed in." });
            // The onAuthStateChanged listener in UserContext will handle the redirect
            navigate('/dashboard');
        } catch (error: any) {
            let description = 'An unexpected error occurred. Please try again.';
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                     description = 'Invalid credentials. Please check your email and password.';
                     break;
                case 'auth/invalid-email':
                    description = 'The email address is not valid.';
                    break;
                case 'auth/user-disabled':
                    description = 'This user account has been disabled.';
                    break;
            }
            toast({ variant: 'destructive', title: 'Sign-in Failed', description });
        }
    }
    
    setIsLoading(false)
  }


  const handleSocialAuth = async (providerName: string) => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        toast({ variant: 'success', title: 'Success', description: "You've been signed in." });
        // The onAuthStateChanged listener will handle user creation/redirect
        navigate('/dashboard');
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Authentication Failed', description: error.message });
    }
    setIsLoading(false);
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <OrbitalLoader message="Loading..." />
      </div>
    );
  }

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        <StarsBackground />
        <BgGradient
          gradientFrom="rgba(99, 102, 241, 0.1)"
          gradientTo="rgba(168, 85, 247, 0.05)"
          gradientSize="120% 120%"
          gradientPosition="30% 20%"
          className="opacity-60"
        />
      
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 border-border bg-card/80 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={(e) => handleSubmit(e, 'signin')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-border"
                    />
                    <Label htmlFor="remember" className="text-sm">Remember me</Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        className="pl-10"
                        value={signUpData.firstName ?? ''}
                        onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={signUpData.lastName ?? ''}
                      onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                 <div className="space-y-2">
                  <Label htmlFor="college">University Name (Optional)</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="college"
                      type="text"
                      placeholder="e.g. University of Technology"
                      className="pl-10"
                      value={signUpData.college ?? ''}
                      onChange={(e) => setSignUpData({ ...signUpData, college: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      className="pl-10 pr-10"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                      value={signUpData.confirmPassword ?? ''}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded border-border"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{' '}
                    <button type="button" className="text-primary hover:underline">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-primary hover:underline">
                      Privacy Policy
                    </button>
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Social Authentication */}
          {showSocialAuth && (
            <>
              <div className="relative my-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card/80 px-2 text-xs text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1">
                <Button
                  variant="outline"
                  onClick={() => handleSocialAuth('google')}
                  className="w-full"
                  disabled={isLoading}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </div>
            </>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {activeTab === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
              className="text-primary hover:underline font-medium"
            >
              {activeTab === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
