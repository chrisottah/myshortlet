"use client";

import { InvestorApplicationData } from "@/lib/types/investor-application";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CRYPTO_ASSETS = ["USDT", "USDC", "BTC", "ETH"] as const;

interface StepProps {
  data: InvestorApplicationData;
  onChange: (patch: Partial<InvestorApplicationData>) => void;
}

export function StepBankInfo({ data, onChange }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="font-display text-base text-charcoal">
          Bank details (for withdrawals)
        </h3>

        <div className="space-y-2">
          <Label htmlFor="bankName">Bank name</Label>
          <Input
            id="bankName"
            value={data.bankName}
            onChange={(e) => onChange({ bankName: e.target.value })}
            placeholder="e.g. GTBank"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account number</Label>
          <Input
            id="accountNumber"
            value={data.accountNumber}
            onChange={(e) => onChange({ accountNumber: e.target.value })}
            placeholder="0123456789"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountName">Account name</Label>
          <Input
            id="accountName"
            value={data.accountName}
            onChange={(e) => onChange({ accountName: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-charcoal/10">
        <div>
          <h3 className="font-display text-base text-charcoal">
            Crypto preference (optional)
          </h3>
          <p className="text-xs text-charcoal/50 mt-1">
            You can also withdraw via crypto. This is optional.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cryptoAsset">Preferred asset</Label>
          <Select
            value={data.cryptoAsset}
            onValueChange={(v) =>
              onChange({
                cryptoAsset: (v ?? "") as InvestorApplicationData["cryptoAsset"],
              })
            }
          >
            <SelectTrigger id="cryptoAsset">
              <SelectValue placeholder="Select an asset (optional)" />
            </SelectTrigger>
            <SelectContent>
              {CRYPTO_ASSETS.map((asset) => (
                <SelectItem key={asset} value={asset}>
                  {asset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.cryptoAsset && (
          <div className="space-y-2">
            <Label htmlFor="cryptoNetwork">Preferred network</Label>
            <Input
              id="cryptoNetwork"
              value={data.cryptoNetwork}
              onChange={(e) => onChange({ cryptoNetwork: e.target.value })}
              placeholder="e.g. TRC20, ERC20, BEP20"
            />
          </div>
        )}
      </div>
    </div>
  );
}