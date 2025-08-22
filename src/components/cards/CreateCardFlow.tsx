import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CARD_CREATION_FEE, PEPU_TOKEN_ADDRESS, TREASURY_ADDRESS, parsePEPU, formatPEPU } from '@/lib/web3';
import { sendCardCreationNotification } from '@/lib/telegram';
import { getCredentialsForSubdomain } from '@/lib/auth';
import { erc20Abi } from 'viem';

interface CreateCardFlowProps {
  onCardCreated: () => void;
}

export function CreateCardFlow({ onCardCreated }: CreateCardFlowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'connect' | 'payment' | 'details' | 'pending'>('connect');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  
  const { address, isConnected } = useAccount();
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
      toast({
        title: "Approving PEPU",
        description: `Please approve ${formatPEPU(CARD_CREATION_FEE)} PEPU for card creation`,
      });

      // Approve PEPU spending
      approve({
        address: PEPU_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [TREASURY_ADDRESS, CARD_CREATION_FEE],
        chainId: chainId,
      });

    } catch (error) {
      console.error('Approval failed:', error);
      setIsProcessing(false);
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Failed to approve PEPU spending",
        variant: "destructive",
      });
    }
  };

  // Handle approval success/error
  useEffect(() => {
    if (isApproveSuccess) {
      setTxHash(hash);
      setIsProcessing(false);
      setStep('pending');
      toast({
        title: "Approval successful",
        description: `Transaction confirmed: ${hash.substring(0, 10)}...`,
      });
      
      // Simulate card creation (replace with actual contract call)
      setTimeout(() => {
        onCardCreated();
        setIsOpen(false);
      }, 3000);
      
    } else if (isApproveError || isApproveTxError) {
      const error = approveError || approveTxError;
      console.error('Approval error:', error);
      setIsProcessing(false);
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Failed to approve PEPU spending",
        variant: "destructive",
      });
    }
  }, [isApproveSuccess, isApproveError, isApproveTxError, approveError, approveTxError, hash, toast, onCardCreated]);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full max-w-xs mx-auto">
        Top Up Card
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Top Up Virtual Card</DialogTitle>
            <DialogDescription>
              {step === 'connect' && 'Connect your wallet to top up your virtual card'}
              {step === 'payment' && `Approve ${formatPEPU(CARD_CREATION_FEE)} PEPU for card top-up`}
              {step === 'pending' && 'Processing your transaction...'}
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
                    Approve the payment of {formatPEPU(CARD_CREATION_FEE)} PEPU to top up your card
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handlePayment} 
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Approve ${formatPEPU(CARD_CREATION_FEE)} PEPU`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'pending' && (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <h3 className="text-lg font-medium">Processing Your Top Up</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your transaction is being processed on the blockchain. This may take a moment...
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
