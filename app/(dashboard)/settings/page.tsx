'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Input } from '../../../components/ui/Input.tsx';
import { Building, Shield, Save, Cloud } from 'lucide-react';
import { toast } from '../../../components/ui/Sonner.tsx';
import { ImageUpload } from '../../../components/shared/ImageUpload.tsx';

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('Acme Technologies Inc.');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD ($)');
  const [fiscalYear, setFiscalYear] = useState('January - December');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Workspace settings updated successfully');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tenant organization branding, Cloudinary logo assets, locale, and security settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base">Organization Profile & Branding</CardTitle>
          </div>
          <CardDescription>Update your company identifier, logo on Cloudinary, and reporting defaults.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Organization Name
              </label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>

            {/* Cloudinary Organization Logo Upload */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Cloud className="h-4 w-4 text-sky-500" />
                <span>Organization Logo (Cloudinary Media Storage)</span>
              </div>
              <ImageUpload
                value={logoUrl}
                onChange={(url) => setLogoUrl(url)}
                onRemove={() => setLogoUrl(null)}
                folder="organization_logos"
                label=""
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Default Reporting Currency
                </label>
                <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Fiscal Cycle
                </label>
                <Input value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} />
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-800 dark:text-indigo-300 flex items-center space-x-2">
              <Shield className="h-4 w-4 shrink-0 text-indigo-600" />
              <span>
                All database documents, lead queues, and opportunity stages remain strictly partitioned under this tenant ID with MongoDB.
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-2">
            <Button type="submit" className="space-x-1.5">
              <Save className="h-4 w-4" />
              <span>Save Workspace Settings</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
