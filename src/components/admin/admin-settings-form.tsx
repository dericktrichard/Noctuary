'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { updateAdminEmailAction, updateAdminPasswordAction } from '@/app/actions/admin-settings';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Save } from 'lucide-react';

interface AdminSettingsFormProps {
  currentEmail: string;
}

export function AdminSettingsForm({ currentEmail }: AdminSettingsFormProps) {
  const router = useRouter();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Email update
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Password update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !emailPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsUpdatingEmail(true);

    const result = await updateAdminEmailAction(newEmail, emailPassword);

    if (result.success) {
      toast.success('Email updated successfully! Please log in again.');
      setNewEmail('');
      setEmailPassword('');
      // Redirect to login
      setTimeout(() => {
        router.push('/admin/login');
      }, 2000);
    } else {
      toast.error(result.error || 'Failed to update email');
    }

    setIsUpdatingEmail(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsUpdatingPassword(true);

    const result = await updateAdminPasswordAction(currentPassword, newPassword);

    if (result.success) {
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.error || 'Failed to update password');
    }

    setIsUpdatingPassword(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Change Email */}
      <Card className="glass-card p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Change Email</h2>
        </div>

        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <Label htmlFor="current-email" className="font-nunito">Current Email</Label>
            <Input
              id="current-email"
              type="email"
              value={currentEmail}
              disabled
              className="mt-2 bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="new-email" className="font-nunito">New Email</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="new@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="email-password" className="font-nunito">Confirm Password</Label>
            <Input
              id="email-password"
              type="password"
              placeholder="Enter your current password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isUpdatingEmail}
            className="w-full font-nunito"
          >
            {isUpdatingEmail ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Email
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card className="glass-card p-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Change Password</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <Label htmlFor="current-password" className="font-nunito">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="new-password" className="font-nunito">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirm-password" className="font-nunito">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full font-nunito"
          >
            {isUpdatingPassword ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* System Information */}
      <Card className="glass-card p-6 border border-border md:col-span-2">
        <h2 className="text-xl font-bold mb-4">System Information</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm font-nunito text-muted-foreground">Admin Email</div>
            <div className="text-base font-mono mt-1">{currentEmail}</div>
          </div>
          
          <div>
            <div className="text-sm font-nunito text-muted-foreground">Account Type</div>
            <div className="text-base mt-1">Administrator</div>
          </div>

          <div>
            <div className="text-sm font-nunito text-muted-foreground">From Email</div>
            <div className="text-base font-mono mt-1">hello@noctuary.ink</div>
          </div>

          <div>
            <div className="text-sm font-nunito text-muted-foreground">Domain</div>
            <div className="text-base font-mono mt-1">noctuary.ink</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm font-nunito text-blue-200">
            <strong>Security Note:</strong> After changing your email or password, you'll need to log in again with your new credentials.
          </p>
        </div>
      </Card>
    </div>
  );
}