import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import {
  Settings,
  Shield,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SettingsPage() {
  const { user, firebaseUser, loading } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!loading && !firebaseUser) {
      navigate('/auth');
    }
  }, [firebaseUser, loading, navigate]);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async () => {
    if (!firebaseUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to change your password."
      });
      return;
    }

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match."
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New password must be at least 6 characters long."
      });
      return;
    }

    if (!passwordData.currentPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your current password."
      });
      return;
    }

    setUpdating(true);
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        firebaseUser.email!,
        passwordData.currentPassword
      );

      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, passwordData.newPassword);

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsEditing(false);

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully."
      });
    } catch (error: any) {
      let description = 'Failed to update password. Please try again.';

      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = 'Current password is incorrect.';
          break;
        case 'auth/weak-password':
          description = 'New password is too weak. Please choose a stronger password.';
          break;
        case 'auth/requires-recent-login':
          description = 'Please log out and log back in before changing your password.';
          break;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings.
          </p>
        </div>

        {/* Account Security */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Account Security</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Update your password to keep your account secure.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Password</Label>
                <p className="text-sm text-muted-foreground">
                  Account created on {firebaseUser?.metadata?.creationTime ?
                    new Date(firebaseUser.metadata.creationTime).toLocaleDateString() :
                    'Unknown date'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Change
              </Button>
            </div>

            {/* Password Change Form */}
            {isEditing && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter your current password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter your new password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm your new password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={updating}
                    className="flex items-center gap-2"
                  >
                    {updating ? 'Updating...' : 'Save Password'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
