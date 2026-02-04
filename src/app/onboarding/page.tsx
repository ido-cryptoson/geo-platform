'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Store, Users, Search, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getSampleQueries } from '@/services/query-generator';
import { Business } from '@/types/database';

type Step = 'business' | 'competitors' | 'preview' | 'complete';

interface FormData {
  businessName: string;
  cuisineType: string;
  city: string;
  neighborhood: string;
  websiteUrl: string;
  competitors: string[];
}

const CUISINE_TYPES = [
  'Italian',
  'Mexican',
  'Japanese',
  'Chinese',
  'Indian',
  'Thai',
  'American',
  'French',
  'Mediterranean',
  'Korean',
  'Vietnamese',
  'Greek',
  'Other',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('business');
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    cuisineType: '',
    city: '',
    neighborhood: '',
    websiteUrl: '',
    competitors: ['', '', ''],
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...formData.competitors];
    newCompetitors[index] = value;
    updateFormData('competitors', newCompetitors);
  };

  const canProceed = () => {
    switch (step) {
      case 'business':
        return formData.businessName && formData.cuisineType && formData.city;
      case 'competitors':
        return true; // Competitors are optional
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (step === 'business') setStep('competitors');
    else if (step === 'competitors') setStep('preview');
    else if (step === 'preview') handleComplete();
  };

  const prevStep = () => {
    if (step === 'competitors') setStep('business');
    else if (step === 'preview') setStep('competitors');
  };

  const handleComplete = async () => {
    setIsLoading(true);

    // In production, this would save to Supabase and run initial tracking
    // For now, we'll simulate a delay and redirect to dashboard
    await new Promise(resolve => setTimeout(resolve, 2000));

    setStep('complete');
    setIsLoading(false);

    // Redirect to dashboard after a moment
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  // Generate preview business object
  const previewBusiness: Business = {
    id: 'preview',
    user_id: 'preview',
    name: formData.businessName,
    slug: formData.businessName.toLowerCase().replace(/\s+/g, '-'),
    cuisine_type: formData.cuisineType,
    city: formData.city,
    neighborhood: formData.neighborhood || undefined,
    website_url: formData.websiteUrl || undefined,
    is_active: true,
    tracking_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const sampleQueries = formData.businessName && formData.city
    ? getSampleQueries(previewBusiness)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { key: 'business', label: 'Business', icon: Store },
              { key: 'competitors', label: 'Competitors', icon: Users },
              { key: 'preview', label: 'Preview', icon: Search },
            ].map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.key;
              const isComplete =
                (s.key === 'business' && ['competitors', 'preview', 'complete'].includes(step)) ||
                (s.key === 'competitors' && ['preview', 'complete'].includes(step)) ||
                (s.key === 'preview' && step === 'complete');

              return (
                <div key={s.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isComplete
                        ? 'bg-green-600 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      isActive || isComplete ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                  {index < 2 && (
                    <div
                      className={`w-12 h-0.5 mx-4 ${
                        isComplete ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        {step === 'business' && (
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your restaurant</CardTitle>
              <CardDescription>
                We'll use this information to track your visibility in AI search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={e => updateFormData('businessName', e.target.value)}
                  placeholder="e.g., Mario's Italian Kitchen"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine Type *
                </label>
                <select
                  value={formData.cuisineType}
                  onChange={e => updateFormData('cuisineType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select cuisine type</option>
                  {CUISINE_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => updateFormData('city', e.target.value)}
                    placeholder="e.g., San Francisco"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Neighborhood
                  </label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={e => updateFormData('neighborhood', e.target.value)}
                    placeholder="e.g., North Beach"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={e => updateFormData('websiteUrl', e.target.value)}
                  placeholder="https://yourrestaurant.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'competitors' && (
          <Card>
            <CardHeader>
              <CardTitle>Who are your competitors?</CardTitle>
              <CardDescription>
                We'll track how you compare against them in AI recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[0, 1, 2].map(index => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competitor {index + 1}
                  </label>
                  <input
                    type="text"
                    value={formData.competitors[index]}
                    onChange={e => updateCompetitor(index, e.target.value)}
                    placeholder={`e.g., ${
                      index === 0
                        ? "Tony's Pizza"
                        : index === 1
                        ? 'Caffe Roma'
                        : 'Trattoria Bella'
                    }`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
              <p className="text-sm text-gray-500">
                Leave empty if you don't know your competitors yet. You can add them later.
              </p>
            </CardContent>
          </Card>
        )}

        {step === 'preview' && (
          <Card>
            <CardHeader>
              <CardTitle>Preview your tracking setup</CardTitle>
              <CardDescription>
                Here's what we'll track for {formData.businessName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Business Details</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <p>
                    <span className="text-gray-500">Name:</span> {formData.businessName}
                  </p>
                  <p>
                    <span className="text-gray-500">Cuisine:</span> {formData.cuisineType}
                  </p>
                  <p>
                    <span className="text-gray-500">Location:</span>{' '}
                    {formData.neighborhood
                      ? `${formData.neighborhood}, ${formData.city}`
                      : formData.city}
                  </p>
                  {formData.websiteUrl && (
                    <p>
                      <span className="text-gray-500">Website:</span> {formData.websiteUrl}
                    </p>
                  )}
                </div>
              </div>

              {formData.competitors.filter(c => c).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Competitors to Track</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-1">
                      {formData.competitors
                        .filter(c => c)
                        .map((comp, i) => (
                          <li key={i}>• {comp}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Sample Queries We'll Track
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {sampleQueries.slice(0, 5).map((query, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Search className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{query}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    + {Math.max(0, sampleQueries.length - 5)} more queries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-600 mb-4">
                We're setting up your tracking. Redirecting to your dashboard...
              </p>
              <div className="animate-pulse">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        {step !== 'complete' && (
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={step === 'business'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                step === 'business'
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={nextStep}
              disabled={!canProceed() || isLoading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg ${
                canProceed() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </>
              ) : step === 'preview' ? (
                <>
                  Start Tracking
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
