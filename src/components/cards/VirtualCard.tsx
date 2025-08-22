import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, CreditCard, Plus } from 'lucide-react';
import { formatPEPU } from '@/lib/web3';
import { useAccount, useReadContract } from 'wagmi';
import { PEPU_TOKEN_ADDRESS, ERC20_ABI } from '@/lib/web3';

interface CardDetails {
  number: string;
  expiry: string;
  cvv: string;
  holderName: string;
  balance?: bigint;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface VirtualCardProps {
  cardDetails: CardDetails;
  onTopUp: () => void;
}

export function VirtualCard({ cardDetails, onTopUp }: VirtualCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { address } = useAccount();
  
  // Fetch PEPU balance
  const { data: balance } = useReadContract({
    address: PEPU_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    watch: true
  });

  const maskCardNumber = (number: string) => {
    if (!showDetails) {
      return `•••• •••• •••• ${number.slice(-4)}`;
    }
    return number.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const maskCVV = (cvv: string) => {
    return showDetails ? cvv : '•••';
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-6 h-6" />
              <span className="font-medium">PEPU Card</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              {showDetails ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-white/70 mb-1">Balance</p>
              <p className="text-2xl font-bold">
                {balance ? formatPEPU(balance) : '0.00'} PEPU
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/70 mb-1">Card Number</p>
                <p className="font-mono tracking-wider">
                  {maskCardNumber(cardDetails.number)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-white/70 mb-1">Expires</p>
                <p>{showDetails ? cardDetails.expiry : '••/••'}</p>
              </div>
              
              <div>
                <p className="text-xs text-white/70 mb-1">Card Holder</p>
                <p>{cardDetails.holderName || '•••• •••••'}</p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-white/70 mb-1">CVV</p>
                <p className="font-mono">{maskCVV(cardDetails.cvv)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={onTopUp}
          className="w-full max-w-xs"
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Top Up Balance
        </Button>
      </div>
    </div>
  );
}
