import React, { useRef, useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import {
  UserRole,
  useGetContent,
  useUpdateContent,
  uploadContentImage,
  type QualityCard,
  type JourneyStep,
  type EventCta,
  type ProductsHero,
} from '@workspace/api-client-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Upload, ImageIcon, Loader2, CheckCircle, ChevronDown, ChevronUp,
  Award, MapPin, CalendarDays, Image as ImageLucide, Phone,
} from 'lucide-react';

// ─── Small helper: image upload button ────────────────────────────────────────

function ImageUploadSlot({
  label,
  currentSrc,
  uploading,
  onUpload,
}: {
  label: string;
  currentSrc: string;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div
        className="relative rounded-xl overflow-hidden border border-border/50 bg-secondary/10 aspect-square cursor-pointer hover:border-primary/40 transition-colors duration-200"
        onClick={() => inputRef.current?.click()}
      >
        <img src={currentSrc} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          {uploading ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <Upload className="h-6 w-6 text-primary" />
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }}
      />
    </div>
  );
}

// ─── Section toggle wrapper ───────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-border/50 bg-card mb-6">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen(p => !p)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="font-serif text-lg">{title}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
            </div>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  useRequireAuth([UserRole.admin]);
  const { token } = useAuthStore();

  // ── Hero banner state ──
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
      setHeroPreview(`/images/hero.jpg?t=${Date.now()}`);
      toast.success('Hero image updated!', { duration: 4000 });
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setHeroUploading(false);
    }
  };

  // ── Royal Standard state ──
  const { data: rsData } = useGetContent<QualityCard[]>('royal_standard');
  const updateRS = useUpdateContent<QualityCard[]>('royal_standard');
  const [rsCards, setRsCards] = useState<QualityCard[]>([]);
  const [rsImgUploading, setRsImgUploading] = useState<boolean[]>([false, false, false, false]);
  const [rsSaving, setRsSaving] = useState(false);

  useEffect(() => { if (rsData) setRsCards(rsData); }, [rsData]);

  const handleRsFieldChange = (idx: number, field: keyof QualityCard, val: string) => {
    setRsCards(prev => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  };

  const handleRsImageUpload = async (idx: number, file: File) => {
    setRsImgUploading(prev => prev.map((v, i) => i === idx ? true : v));
    try {
      const url = await uploadContentImage('royal_standard', idx, file, token || '');
      setRsCards(prev => prev.map((c, i) => i === idx ? { ...c, image: `${url}?t=${Date.now()}` } : c));
      toast.success('Image updated!');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setRsImgUploading(prev => prev.map((v, i) => i === idx ? false : v));
    }
  };

  const handleRsSave = async () => {
    setRsSaving(true);
    try {
      await updateRS.mutateAsync({ value: rsCards, token: token || '' });
      toast.success('Royal Standard section saved!');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setRsSaving(false);
    }
  };

  // ── Journey Steps state ──
  const { data: jsData } = useGetContent<JourneyStep[]>('journey_steps');
  const updateJS = useUpdateContent<JourneyStep[]>('journey_steps');
  const [jsSteps, setJsSteps] = useState<JourneyStep[]>([]);
  const [jsImgUploading, setJsImgUploading] = useState<boolean[]>([false, false, false]);
  const [jsSaving, setJsSaving] = useState(false);

  useEffect(() => { if (jsData) setJsSteps(jsData); }, [jsData]);

  const handleJsFieldChange = (idx: number, field: keyof JourneyStep, val: string) => {
    setJsSteps(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  };

  const handleJsImageUpload = async (idx: number, file: File) => {
    setJsImgUploading(prev => prev.map((v, i) => i === idx ? true : v));
    try {
      const url = await uploadContentImage('journey_steps', idx, file, token || '');
      setJsSteps(prev => prev.map((s, i) => i === idx ? { ...s, image: `${url}?t=${Date.now()}` } : s));
      toast.success('Image updated!');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setJsImgUploading(prev => prev.map((v, i) => i === idx ? false : v));
    }
  };

  const handleJsSave = async () => {
    setJsSaving(true);
    try {
      await updateJS.mutateAsync({ value: jsSteps, token: token || '' });
      toast.success('Journey section saved!');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setJsSaving(false);
    }
  };

  // ── Event CTA state ──
  const { data: ctaData } = useGetContent<EventCta>('event_cta');
  const updateCta = useUpdateContent<EventCta>('event_cta');
  const [ctaForm, setCtaForm] = useState<EventCta>({ phone: '919908352959', backgroundImage: '/images/event-hero.png' });
  const [ctaImgUploading, setCtaImgUploading] = useState(false);
  const [ctaSaving, setCtaSaving] = useState(false);

  useEffect(() => { if (ctaData) setCtaForm(ctaData); }, [ctaData]);

  const handleCtaImageUpload = async (file: File) => {
    setCtaImgUploading(true);
    try {
      const url = await uploadContentImage('event_cta', 0, file, token || '');
      setCtaForm(prev => ({ ...prev, backgroundImage: `${url}?t=${Date.now()}` }));
      toast.success('Background image updated!');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setCtaImgUploading(false);
    }
  };

  const handleCtaSave = async () => {
    setCtaSaving(true);
    try {
      await updateCta.mutateAsync({ value: ctaForm, token: token || '' });
      toast.success('Event CTA section saved!');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setCtaSaving(false);
    }
  };

  // ── Products Hero state ──
  const { data: phData } = useGetContent<ProductsHero>('products_hero');
  const updatePH = useUpdateContent<ProductsHero>('products_hero');
  const [phBg, setPhBg] = useState('/images/products-hero.png');
  const [phImgUploading, setPhImgUploading] = useState(false);

  useEffect(() => { if (phData) setPhBg(phData.backgroundImage); }, [phData]);

  const handlePhImageUpload = async (file: File) => {
    setPhImgUploading(true);
    try {
      const url = await uploadContentImage('products_hero', 0, file, token || '');
      const newUrl = `${url}?t=${Date.now()}`;
      setPhBg(newUrl);
      await updatePH.mutateAsync({ value: { backgroundImage: url }, token: token || '' });
      toast.success('Products hero image updated!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setPhImgUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl">
        <h1 className="font-serif text-3xl font-bold mb-1">Site Settings</h1>
        <p className="text-muted-foreground mb-8">Manage branding, images and text across your storefront.</p>

        {/* ── Hero Banner Image ── */}
        <Card className="border-border/50 bg-card mb-6">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Hero Banner Image</CardTitle>
            <CardDescription>
              Full-width background image on your home page. Recommended: 1920×800 px.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-border/50 bg-secondary/20">
              <img key={heroPreview} src={heroPreview} alt="Current hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3">
                <span className="text-xs bg-background/80 backdrop-blur px-2 py-1 rounded-md text-muted-foreground">
                  Current hero image
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                disabled={heroUploading} onClick={() => heroInputRef.current?.click()}>
                {heroUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {heroUploading ? 'Uploading…' : 'Upload New Hero Image'}
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP · Max 10 MB</p>
            </div>
            <input ref={heroInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden" onChange={handleHeroUpload} />
          </CardContent>
        </Card>

        {/* ── Royal Standard Section ── */}
        <SectionCard
          icon={Award}
          title="Royal Standard Section"
          description="Edit the 4 quality cards shown on the home page."
        >
          <div className="space-y-8 pt-2">
            {rsCards.map((card, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/40 bg-background/50 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Card {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
                  <ImageUploadSlot
                    label="Card Image"
                    currentSrc={card.image}
                    uploading={rsImgUploading[i]}
                    onUpload={file => handleRsImageUpload(i, file)}
                  />
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Title</Label>
                      <Input value={card.title} onChange={e => handleRsFieldChange(i, 'title', e.target.value)}
                        className="bg-background/50 border-primary/20 focus:border-primary/50" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Short Description (card)</Label>
                      <Textarea value={card.desc} rows={2} onChange={e => handleRsFieldChange(i, 'desc', e.target.value)}
                        className="bg-background/50 border-primary/20 focus:border-primary/50 resize-none text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Full Detail (popup modal)</Label>
                      <Textarea value={card.detail} rows={3} onChange={e => handleRsFieldChange(i, 'detail', e.target.value)}
                        className="bg-background/50 border-primary/20 focus:border-primary/50 resize-none text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button onClick={handleRsSave} disabled={rsSaving || rsCards.length === 0}
              className="gap-2 rounded-full shadow-md shadow-primary/20">
              {rsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {rsSaving ? 'Saving…' : 'Save Royal Standard'}
            </Button>
          </div>
        </SectionCard>

        {/* ── Journey Steps Section ── */}
        <SectionCard
          icon={MapPin}
          title="Journey to Your Table"
          description="Edit the 3 steps shown in the 'How It Works' section."
        >
          <div className="space-y-8 pt-2">
            {jsSteps.map((step, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/40 bg-background/50 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Step {i + 1}</p>
                <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4">
                  <ImageUploadSlot
                    label="Step Image"
                    currentSrc={step.image}
                    uploading={jsImgUploading[i]}
                    onUpload={file => handleJsImageUpload(i, file)}
                  />
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Title</Label>
                      <Input value={step.title} onChange={e => handleJsFieldChange(i, 'title', e.target.value)}
                        className="bg-background/50 border-primary/20 focus:border-primary/50" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Short Description (card)</Label>
                      <Textarea value={step.desc} rows={2} onChange={e => handleJsFieldChange(i, 'desc', e.target.value)}
                        className="bg-background/50 border-primary/20 focus:border-primary/50 resize-none text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Full Detail (popup modal)</Label>
                      <Textarea value={step.detail} rows={3} onChange={e => handleJsFieldChange(i, 'detail', e.target.value)}
                        className="bg-background/50 border-primary/20 focus:border-primary/50 resize-none text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button onClick={handleJsSave} disabled={jsSaving || jsSteps.length === 0}
              className="gap-2 rounded-full shadow-md shadow-primary/20">
              {jsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {jsSaving ? 'Saving…' : 'Save Journey Section'}
            </Button>
          </div>
        </SectionCard>

        {/* ── Hosting an Event CTA ── */}
        <SectionCard
          icon={CalendarDays}
          title="Hosting an Event CTA"
          description="Background image and contact number shown on the event section."
        >
          <div className="space-y-6 pt-2">
            {/* Background image */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Background Image</Label>
              <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden border border-border/50 bg-secondary/20 mb-3">
                <img src={ctaForm.backgroundImage} alt="Event CTA background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/70 to-transparent pointer-events-none" />
              </div>
              <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                disabled={ctaImgUploading} onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=(e:any) => handleCtaImageUpload(e.target.files[0]); i.click(); }}>
                {ctaImgUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {ctaImgUploading ? 'Uploading…' : 'Change Background'}
              </Button>
            </div>

            {/* Phone number */}
            <div className="max-w-sm">
              <Label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> WhatsApp / Call Number (digits only, with country code)
              </Label>
              <Input
                value={ctaForm.phone}
                onChange={e => setCtaForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                placeholder="919908352959"
                className="bg-background/50 border-primary/20 focus:border-primary/50 font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Example: 919908352959 (91 = India country code, then 10-digit number)
              </p>
            </div>

            <Button onClick={handleCtaSave} disabled={ctaSaving}
              className="gap-2 rounded-full shadow-md shadow-primary/20">
              {ctaSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {ctaSaving ? 'Saving…' : 'Save Event CTA'}
            </Button>
          </div>
        </SectionCard>

        {/* ── Products Hero ── */}
        <SectionCard
          icon={ImageLucide}
          title="Products Page Hero"
          description="Cinematic background image shown at the top of the products page."
        >
          <div className="space-y-4 pt-2">
            <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-border/50 bg-secondary/20">
              <img src={phBg} alt="Products hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/25 to-background/80 pointer-events-none" />
              <div className="absolute bottom-3 left-3">
                <span className="text-xs bg-background/80 backdrop-blur px-2 py-1 rounded-md text-muted-foreground">
                  Current products hero
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                disabled={phImgUploading}
                onClick={() => {
                  const i = document.createElement('input');
                  i.type = 'file';
                  i.accept = 'image/jpeg,image/jpg,image/png,image/webp';
                  i.onchange = (e: any) => handlePhImageUpload(e.target.files[0]);
                  i.click();
                }}
              >
                {phImgUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {phImgUploading ? 'Uploading…' : 'Upload Products Hero'}
              </Button>
              <p className="text-xs text-muted-foreground">JPG, PNG, WebP · Max 10 MB</p>
            </div>
          </div>
        </SectionCard>

        {/* ── Info card ── */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6 flex items-start gap-4">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">How changes take effect</p>
              <p className="text-sm text-muted-foreground">
                Text changes are saved when you click "Save". Image uploads take effect immediately — no save button needed.
                Changes are reflected on the live site within seconds.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
