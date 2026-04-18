import { Card } from './ui/card';
import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Database,
  Globe,
  Download,
  Upload,
  Link,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const integrations = [
  {
    name: 'SAP ERP',
    icon: Database,
    status: 'connected',
    description: 'Financial and operational data',
    lastSync: '2 hours ago'
  },
  {
    name: 'IoT Sensors',
    icon: Link,
    status: 'connected',
    description: 'Real-time energy monitoring',
    lastSync: 'Live'
  },
  {
    name: 'Power BI',
    icon: Globe,
    status: 'connected',
    description: 'Business intelligence integration',
    lastSync: '1 hour ago'
  },
  {
    name: 'Salesforce',
    icon: Database,
    status: 'disconnected',
    description: 'CRM and customer data',
    lastSync: 'Never'
  }
];

export function Settings() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    anomalyDetection: true,
    weeklyReports: true,
    complianceDeadlines: true,
    supplierUpdates: false
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Configure your ESG platform preferences and integrations</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="size-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="size-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Database className="size-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="size-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-4 mt-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Company Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="EcoTech Industries Pvt Ltd" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" defaultValue="Manufacturing & Technology" className="mt-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headquarters">Headquarters</Label>
                  <Input id="headquarters" defaultValue="Mumbai, India" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Input id="employees" defaultValue="2,500" className="mt-2" />
                </div>
              </div>

              <div>
                <Label htmlFor="fiscalYear">Fiscal Year End</Label>
                <Input id="fiscalYear" defaultValue="March 31" className="mt-2" />
              </div>

              <div>
                <Label htmlFor="description">Company Description</Label>
                <textarea
                  id="description"
                  rows={4}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  defaultValue="Leading sustainable technology and manufacturing company committed to achieving net-zero emissions by 2040."
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">ESG Targets</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emissionTarget">Monthly Emission Target (tCO₂e)</Label>
                  <Input id="emissionTarget" type="number" defaultValue="1250" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="reductionGoal">Annual Reduction Goal (%)</Label>
                  <Input id="reductionGoal" type="number" defaultValue="15" className="mt-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="netZeroYear">Net Zero Target Year</Label>
                  <Input id="netZeroYear" type="number" defaultValue="2040" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="renewableTarget">Renewable Energy Target (%)</Label>
                  <Input id="renewableTarget" type="number" defaultValue="80" className="mt-2" />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-teal-600 w-48">
              {isSaving ? <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" /> : null}
              {isSaving ? 'Saving...' : 'Save Company Settings'}
            </Button>
          </div>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4 mt-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">User Profile</h3>
            <div className="flex items-center gap-6 mb-6">
              <div className="size-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                A
              </div>
              <div>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Arjun" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Sharma" className="mt-2" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="arjun.sharma@ecotech.com" className="mt-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="ESG Manager" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" defaultValue="Sustainability" className="mt-2" />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-teal-600 w-32">
              {isSaving ? <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" /> : null}
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">Email Alerts</p>
                  <p className="text-sm text-gray-600">Receive important updates via email</p>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">Anomaly Detection Alerts</p>
                  <p className="text-sm text-gray-600">Get notified when AI detects unusual emissions</p>
                </div>
                <Switch
                  checked={notifications.anomalyDetection}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, anomalyDetection: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">Weekly Summary Reports</p>
                  <p className="text-sm text-gray-600">Receive weekly performance summaries</p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">Compliance Deadlines</p>
                  <p className="text-sm text-gray-600">Reminders for regulatory filing deadlines</p>
                </div>
                <Switch
                  checked={notifications.complianceDeadlines}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, complianceDeadlines: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">Supplier ESG Updates</p>
                  <p className="text-sm text-gray-600">Notifications when supplier scores change</p>
                </div>
                <Switch
                  checked={notifications.supplierUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, supplierUpdates: checked })}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-teal-600 w-56">
              {isSaving ? <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" /> : null}
              {isSaving ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </div>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-4 mt-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Connected Systems</h3>
            <div className="space-y-3">
              {integrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <Icon className="size-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{integration.name}</p>
                          {integration.status === 'connected' ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <Check className="size-3 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                              Disconnected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Last sync: {integration.lastSync}</p>
                      </div>
                    </div>
                    <div>
                      {integration.status === 'connected' ? (
                        <Button variant="outline" size="sm">Configure</Button>
                      ) : (
                        <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600">
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">API Access</h3>
            <div className="space-y-4">
              <div>
                <Label>API Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input value="sk_live_••••••••••••••••••••••••1a2b3c" readOnly />
                  <Button variant="outline">Copy</Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">Use this key to integrate with external systems</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="size-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-blue-900 mb-2">Need Custom Integration?</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Our platform supports custom integrations with your existing systems through REST APIs, webhooks, and direct database connections.
                </p>
                <Button variant="outline" size="sm" className="border-blue-300">
                  Contact Support
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4 mt-6">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Security & Privacy</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" className="mt-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" className="mt-2" />
                </div>
              </div>

              <Button variant="outline">Update Password</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Enable 2FA</p>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <Switch />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Data Management</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => toast.success('Data export started. You will receive an email when ready.')}>
                <Download className="size-4" />
                Export All Data
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Upload className="size-4" />
                Import Historical Data
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-red-200 bg-red-50">
            <h3 className="font-bold text-lg mb-4 text-red-900">Danger Zone</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-red-900">Delete Account</p>
                  <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
