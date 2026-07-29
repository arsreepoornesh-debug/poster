"use client";

import React from "react";

export interface PosterVariantOption {
  id?: string;
  sizeName: string;
  priceAdjustment: number;
  offerPrice?: number | null;
  stock: number;
  frameAvailable: boolean;
  isDefault?: boolean;
}

interface VariantSelectorProps {
  variants: PosterVariantOption[];
  selectedVariant: PosterVariantOption | null;
  onSelectVariant: (variant: PosterVariantOption) => void;
  withFrame: boolean;
  onToggleFrame: (withFrame: boolean) => void;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
  withFrame,
  onToggleFrame,
}: VariantSelectorProps) {
  return (
    <div className="space-y-5 text-xs">
      <div className="space-y-2">
        <label className="font-bold text-foreground block uppercase tracking-wider text-[11px]">
          Select Poster Size
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {variants.map((v, idx) => {
            const isSelected = selectedVariant?.sizeName === v.sizeName;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectVariant(v)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? "border-brand-600 bg-brand-500/10 ring-2 ring-brand-500/20 font-bold"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <span className="text-foreground">{v.sizeName}</span>
                {v.priceAdjustment > 0 && (
                  <span className="text-[10px] text-muted-foreground mt-1">
                    +₹{v.priceAdjustment}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <label className="font-bold text-foreground block uppercase tracking-wider text-[11px]">
          Frame Options
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onToggleFrame(false)}
            className={`p-3 rounded-xl border text-left transition-all ${
              !withFrame
                ? "border-brand-600 bg-brand-500/10 ring-2 ring-brand-500/20 font-bold"
                : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <p className="text-foreground">Print Only (No Frame)</p>
            <p className="text-[10px] text-muted-foreground">Standard roll packing</p>
          </button>
          <button
            type="button"
            onClick={() => onToggleFrame(true)}
            className={`p-3 rounded-xl border text-left transition-all ${
              withFrame
                ? "border-brand-600 bg-brand-500/10 ring-2 ring-brand-500/20 font-bold"
                : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <p className="text-foreground">Premium Frame (+₹499)</p>
            <p className="text-[10px] text-muted-foreground">Matte black wood frame</p>
          </button>
        </div>
      </div>
    </div>
  );
}
