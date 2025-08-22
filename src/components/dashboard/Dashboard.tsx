import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VirtualCard } from '@/components/cards/VirtualCard';
import { CreateCardFlow } from '@/components/cards/CreateCardFlow';
import { TopUpFlow } from '@/components/cards/TopUpFlow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCredentialsForSubdomain, getCurrentSubdomain } from '@/lib/auth';
import { LogOut } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [showTopUp, setShowTopUp] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const subdomain = getCurrentSubdomain();
  const credentials = getCredentialsForSubdomain();
  const userData = credentials.userData;

  const handleCardCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderCardStatus = () => {
    if (userData?.isCardPending) {
      return (
        <Card className="w-full max-w-md mx-auto shadow-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Card Creation Pending</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your card is being processed. You will receive details within 24 hours.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }

    if (userData?.hasCard && userData?.cardDetails) {
      return (
        <VirtualCard
          cardDetails={userData.cardDetails}
          onTopUp={() => setShowTopUp(true)}
        />
      );
    }

    return <CreateCardFlow onCardCreated={handleCardCreated} />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Virtual Card Manager
            </h1>
            <p className="text-sm text-muted-foreground">
              {subdomain}.card.pepuns.xyz
            </p>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {renderCardStatus()}
        </div>
      </main>

      {/* Top Up Modal */}
      <TopUpFlow
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
      />
    </div>
  );
}