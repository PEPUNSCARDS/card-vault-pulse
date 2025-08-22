import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MIN_CARD_CREATION_AMOUNT, USDC_TOKEN_ADDRESS, TREASURY_ADDRESS, parseUSDC } from '@/lib/web3';
import { sendCardCreationNotification } from '@/lib/telegram';
import { getCredentialsForSubdomain } from '@/lib/auth';
import { erc20Abi } from 'viem';

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
  const chainId = useChainId();
  const { toast } = useToast();

  const { 
    data: hash,
    isPending: isApprovePending,
    writeContract: approve,
    isError: isApproveError,
    error: approveError
  } = useWriteContract();

  const { 
    isSuccess: isApproveSuccess,
    isError: isApproveTxError,
    error: approveTxError
  } = useWaitForTransactionReceipt({ hash });

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
    
    try {
      const amount = parseUSDC(MIN_CARD_CREATION_AMOUNT.toString());
      
      toast({
        title: "Approving USDC",
        description: "Please approve the USDC spending in your wallet",
      });

      // Approve USDC spending
      approve({
        address: USDC_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [TREASURY_ADDRESS, amount],
        chainId: chainId,
      });

    } catch (error) {
      console.error('Approval failed:', error);
      setIsProcessing(false);
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Failed to approve USDC spending",
        variant: "destructive",
      });
    }
  };

  // Handle approval success/error
  useEffect(() => {
    if (isApproveSuccess) {
      setTxHash(hash);
      setIsProcessing(false);
      setStep('details');
      toast({
        title: "Approval successful",
        description: `Transaction confirmed: ${hash.substring(0, 10)}...`,
      });
    } else if (isApproveError || isApproveTxError) {
      const error = approveError || approveTxError;
      console.error('Approval error:', error);
      setIsProcessing(false);
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Failed to approve USDC spending",
        variant: "destructive",
      });
    }
  }, [isApproveSuccess, isApproveError, isApproveTxError, approveError, approveTxError, hash, toast]);

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
        throw new Error("Failed to submit card creation request");
      }
    } catch (error) {
      console.error('Failed to submit details:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit card details. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full max-w-xs mx-auto">
        Create Virtual Card
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Virtual Card</DialogTitle>
            <DialogDescription>
              {step === 'connect' && 'Connect your wallet to create a new virtual card'}
              {step === 'payment' && 'Approve USDC payment for card creation'}
              {step === 'details' && 'Enter your card details'}
              {step === 'pending' && 'Your card is being created'}
            </DialogDescription>
          </DialogHeader>

          {step === 'connect' && (
            <div className="flex flex-col items-center py-4">
              <ConnectButton />
              {isConnected && (
                <Button 
                  onClick={() => setStep('payment')} 
                  className="mt-4 w-full"
                >
                  Continue to Payment
                </Button>
              )}
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    Approve the payment of {MIN_CARD_CREATION_AMOUNT} USDC to create your virtual card
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handlePayment} 
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Approve USDC'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSubmitDetails} 
                className="w-full mt-4"
                disabled={!firstName || !lastName || isProcessing}
              >
                {isProcessing ? 'Submitting...' : 'Submit Details'}
              </Button>
            </div>
          )}

          {step === 'pending' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <h3 className="text-lg font-medium">Creating Your Card</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your virtual card is being created. This may take a moment...
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
