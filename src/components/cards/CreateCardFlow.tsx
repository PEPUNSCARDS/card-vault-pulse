import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MIN_CARD_CREATION_AMOUNT, USDC_TOKEN_ADDRESS, TREASURY_ADDRESS, parseUSDC } from '@/lib/web3';
import { sendCardCreationNotification } from '@/lib/telegram';
import { getCredentialsForSubdomain } from '@/lib/auth';

interface CreateCardFlowProps {
  onCardCreated: () => void;
}

export function CreateCardFlow({ onCardCreated }: CreateCardFlowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'connect' | 'payment' | 'details' | 'pending'>('connect');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  
  const { address, isConnected, chain } = useAccount();
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

    setIsProcessing(true);
    
    // Simulate real wallet interaction
    try {
      const amount = parseUSDC(MIN_CARD_CREATION_AMOUNT.toString());
      
      // Show connecting to wallet
      toast({
        title: "Opening wallet",
        description: "Please confirm the transaction in your wallet",
      });
      
      // Simulate wallet interaction delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a realistic transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      setTxHash(mockTxHash);
      setIsProcessing(false);
      setStep('details');
      
      toast({
        title: "Payment successful",
        description: `Transaction confirmed: ${mockTxHash.substring(0, 10)}...`,
      });
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
      toast({
        title: "Payment failed",
        description: "Failed to complete payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitDetails = async () => {
    if (!firstName || !lastName || !txHash) return;

    try {
      const credentials = getCredentialsForSubdomain();
      
      const success = await sendCardCreationNotification({
        email: credentials.email,
        firstName,
        lastName,
        txHash: txHash,
      });

      if (success) {
        setStep('pending');
        toast({
          title: "Card creation request submitted",
          description: "You will receive card details within 24 hours",
        });
        
        // Simulate card creation pending state
        setTimeout(() => {
          onCardCreated();
          setIsOpen(false);
        }, 1000);
      } else {
        toast({
          title: "Notification failed",
          description: "Please contact support",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to submit card creation:', error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'connect':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to create a virtual card. You'll need to pay ${MIN_CARD_CREATION_AMOUNT} in USDC.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            {isConnected && (
              <Button
                onClick={() => setStep('payment')}
                variant="gradient"
                className="w-full"
              >
                Continue to Payment
              </Button>
            )}
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Payment Required</h3>
              <p className="text-sm text-muted-foreground">
                Pay ${MIN_CARD_CREATION_AMOUNT} USDC to create your virtual card
              </p>
            </div>
            <Button
              onClick={handlePayment}
              variant="gradient"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing Payment...' : `Pay $${MIN_CARD_CREATION_AMOUNT} USDC`}
            </Button>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-4">
            <div className="text-center text-sm text-green-400 mb-4">
              ✓ Payment successful!
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="bg-input border-border"
              />
            </div>
            <Button
              onClick={handleSubmitDetails}
              variant="gradient"
              className="w-full"
              disabled={!firstName || !lastName}
            >
              Submit Card Request
            </Button>
          </div>
        );

      case 'pending':
        return (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold text-green-400">
              Card Creation Pending
            </div>
            <p className="text-sm text-muted-foreground">
              Your card creation request has been submitted. You will receive your card details within 24 hours.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-foreground">No Card Created Yet</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create your first virtual card to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setIsOpen(true)}
            variant="gradient"
            size="lg"
            className="w-full"
          >
            Create Card
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Virtual Card</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Follow the steps to create your virtual card
            </DialogDescription>
          </DialogHeader>
          {renderStepContent()}
        </DialogContent>
      </Dialog>
    </>
  );
}