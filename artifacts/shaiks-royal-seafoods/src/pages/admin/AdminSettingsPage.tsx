import React, { useRef, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { UserRole } from '@workspace/api-client-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, ImageIcon, Loader2, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  useRequireAuth([UserRole.admin]);
  const { token } = useAuthStore();

  const [heroUploading, setHeroUploading] = useState(false);
  const [heroPreview, setHeroPreview] = useState('/images/hero.jpg');
  const heroInputRef = useRef<HTMLInputElement>(null);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeroUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/upload/hero', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      // Bust the cache with a timestamp so the new image appears immediately
      setHeroPreview(`/images/hero.jpg?t=${Date.now()}`);
      toast.success('Hero image updated! Reload the home page to see it.', { duration: 5000 });
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setHeroUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-3xl">
        <h1 className="font-serif text-3xl font-bold mb-1">Site Settings</h1>
        <p className="text-muted-foreground mb-8">Manage branding and appearance of your storefront.</p>

        {/* Hero Image Upload */}
        <Card className="border-border/50 bg-card mb-6">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Hero Banner Image</CardTitle>
            <CardDescription>
              This is the full-width background image on your home page. Upload a high-resolution landscape photo (minimum 1920×800 px recommended).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preview */}
            <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-border/50 bg-secondary/20">
              <img
                key={heroPreview}
                src={heroPreview}
                alt="Current hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3">
                <span className="text-xs bg-background/80 backdrop-blur px-2 py-1 rounded-md text-muted-foreground">
                  Current hero image
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                disabled={heroUploading}
                onClick={() => heroInputRef.current?.click()}
              >
                {heroUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {heroUploading ? 'Uploading…' : 'Upload New Hero Image'}
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP · Max 10 MB</p>
            </div>

            <input
              ref={heroInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleHeroUpload}
            />
          </CardContent>
        </Card>

        {/* Info card */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6 flex items-start gap-4">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">How image uploads work</p>
              <p className="text-sm text-muted-foreground">
                Uploaded images are saved directly to the server and served instantly — no external storage needed.
                Product images are stored per product and shown in the customer storefront. The hero image
                replaces the home page background immediately after upload.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
