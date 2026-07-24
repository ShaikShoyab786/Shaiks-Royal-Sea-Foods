import React from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

interface CartToastOptions {
  productName: string;
  navigate: (path: string) => void;
}

export function showCartToast({ productName, navigate }: CartToastOptions) {
  toast.custom(
    (id) => (
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <div className="flex items-start gap-3 p-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/15">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">
              Added to cart
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{productName}</p>
          </div>
          <button
            onClick={() => toast.dismiss(id)}
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors text-lg leading-none mt-0.5 px-1"
          >
            ×
          </button>
        </div>

        <div className="border-t border-border/50 flex">
          <button
            onClick={() => {
              toast.dismiss(id);
              navigate('/products');
            }}
            className="flex-1 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/50 transition-colors duration-150"
          >
            Continue Shopping
          </button>
          <div className="w-px bg-border/50" />
          <button
            onClick={() => {
              toast.dismiss(id);
              navigate('/checkout');
            }}
            className="flex-1 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors duration-150 flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Checkout
          </button>
        </div>
      </div>
    ),
    { duration: 6000 }
  );
}
