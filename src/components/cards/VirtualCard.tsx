import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, CreditCard } from 'lucide-react';

interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  holderName: string;
}

interface VirtualCardProps {
  cardDetails: CardDetails;
  onTopUp: () => void;
}

export function VirtualCard({ cardDetails, onTopUp }: VirtualCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const maskCardNumber = (number: string) => {
    if (!showDetails) {
      return number.replace(/\d(?=\d{4})/g, '*');
    }
    return number;
  };

  const maskCVV = (cvv: string) => {
    return showDetails ? cvv : '***';
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="relative overflow-hidden bg-gradient-card shadow-card border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
        <CardContent className="relative p-6">
          <div className="flex justify-between items-start mb-8">
            <CreditCard className="w-8 h-8 text-white" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-white hover:bg-white/10"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="text-white font-mono text-lg tracking-wider">
              {maskCardNumber(cardDetails.number)}
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wide">
                  Card Holder
                </div>
                <div className="text-white font-semibold">
                  {cardDetails.holderName}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-white/70 uppercase tracking-wide">
                  Expires
                </div>
                <div className="text-white font-semibold">
                  {cardDetails.expiry}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-white/70 uppercase tracking-wide">
                  CVV
                </div>
                <div className="text-white font-semibold">
                  {maskCVV(cardDetails.cvv)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button
        onClick={onTopUp}
        variant="gradient"
        size="lg"
        className="w-full"
      >
        Top Up Card
      </Button>
    </div>
  );
}