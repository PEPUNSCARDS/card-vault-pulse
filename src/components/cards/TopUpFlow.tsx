import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MIN_TOPUP_AMOUNT } from '@/lib/web3';
import { sendTopUpNotification } from '@/lib/telegram';
import { getCredentialsForSubdomain } from '@/lib/auth';

interface TopUpFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopUpFlow({ isOpen, onClose }: TopUpFlowProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'amount' | 'payment' | 'success'>('amount');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount < MIN_TOPUP_AMOUNT) {
      toast({
        title: "Amount too low",
        description: `Minimum top-up amount is $${MIN_TOPUP_AMOUNT}`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setStep('payment');
    
    // Simulate payment processing
    setTimeout(async () => {
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      setTxHash(mockTxHash);
      setIsProcessing(false);
      
      // Send notification
      try {
        const credentials = getCredentialsForSubdomain();
        
        const success = await sendTopUpNotification({
          email: credentials.email,
          amount,
          txHash: mockTxHash,
        });

        if (success) {
          setStep('success');
          toast({
            title: "Top-up successful",
            description: `$${amount} has been added to your card`,
          });
          
          setTimeout(() => {
            onClose();
            resetForm();
          }, 3000);
        } else {
          toast({
            title: "Notification failed",
            description: "Top-up completed but notification failed",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to send notification:', error);
        toast({
          title: "Notification failed",
          description: "Top-up completed but notification failed",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const resetForm = () => {
    setStep('amount');
    setAmount('');
    setTxHash('');
    setIsProcessing(false);
  };

  const renderStepContent = () => {
    switch (step) {
      case 'amount':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Minimum $${MIN_TOPUP_AMOUNT}`}
                min={MIN_TOPUP_AMOUNT}
                step="0.01"
                className="bg-input border-border"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum top-up amount is ${MIN_TOPUP_AMOUNT} USDC
            </p>
            <Button
              onClick={handlePayment}
              variant="gradient"
              className="w-full"
              disabled={!amount || parseFloat(amount) < MIN_TOPUP_AMOUNT || !isConnected}
            >
              {!isConnected ? 'Connect Wallet' : `Top Up $${amount || '0'} USDC`}
            </Button>
          </div>
        );

      case 'payment':
        return (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold">
              Processing Payment...
            </div>
            <p className="text-sm text-muted-foreground">
              Confirming your transaction on the blockchain...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold text-green-400">
              ✓ Top-up Successful!
            </div>
            <p className="text-sm text-muted-foreground">
              ${amount} has been added to your virtual card
            </p>
            <p className="text-xs text-muted-foreground">
              TX: {txHash.substring(0, 10)}...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Top Up Card</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add funds to your virtual card
          </DialogDescription>
        </DialogHeader>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}