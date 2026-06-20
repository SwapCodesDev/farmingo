'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

interface SimulatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: 'cod' | 'card' | 'upi' | null;
  total: number;
  formData: any;
  onCompletePayment: () => Promise<void>;
  onSuccessStep: () => void;
}

export default function SimulatorDialog({
  open,
  onOpenChange,
  paymentMethod,
  total,
  formData,
  onCompletePayment,
  onSuccessStep,
}: SimulatorDialogProps) {
  const [simulationState, setSimulationState] = useState<'loading' | 'otp_entry' | 'upi_qr' | 'cod_slide' | 'success' | 'failure'>('loading');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [upiTimer, setUpiTimer] = useState(180);
  const [otpTimer, setOtpTimer] = useState(59);

  // Slider States
  const [slideConfirmed, setSlideConfirmed] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [startX, setStartX] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const hasCompleted = useRef(false);

  // Reset simulator states when dialog opens
  useEffect(() => {
    if (open && paymentMethod) {
      hasCompleted.current = false;
      setOtpValue('');
      setOtpError('');
      setUpiTimer(180);
      setOtpTimer(59);
      setSlideConfirmed(false);
      setSlideProgress(0);
      setIsSliding(false);

      if (paymentMethod === 'card') {
        setSimulationState('loading');
        const timer = setTimeout(() => {
          setSimulationState('otp_entry');
        }, 1500);
        return () => clearTimeout(timer);
      } else if (paymentMethod === 'upi') {
        setSimulationState('upi_qr');
      } else if (paymentMethod === 'cod') {
        setSimulationState('cod_slide');
      }
    }
  }, [open, paymentMethod]);

  // UPI Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (open && paymentMethod === 'upi' && simulationState === 'upi_qr') {
      interval = setInterval(() => {
        setUpiTimer((prev) => {
          if (prev <= 1) {
            setSimulationState('failure');
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open, paymentMethod, simulationState]);

  // OTP Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (open && paymentMethod === 'card' && simulationState === 'otp_entry') {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setOtpError('OTP expired. Please click resend.');
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open, paymentMethod, simulationState]);

  const handleOrderCreation = async () => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;
    setSimulationState('loading');
    try {
      await onCompletePayment();
      setSimulationState('success');
      setTimeout(() => {
        onOpenChange(false);
        onSuccessStep();
      }, 2000);
    } catch (error) {
      hasCompleted.current = false;
      setSimulationState('failure');
    }
  };

  const handleVerifyOtp = () => {
    if (otpTimer === 0) {
      setOtpError('OTP has expired. Please click resend.');
      return;
    }
    if (otpValue === '000000') {
      setSimulationState('failure');
    } else if (otpValue.length === 6) {
      handleOrderCreation();
    } else {
      setOtpError('Please enter a valid 6-digit OTP code.');
    }
  };

  const handleResendOtp = () => {
    setOtpValue('');
    setOtpError('');
    setOtpTimer(59);
    setSimulationState('loading');
    setTimeout(() => {
      setSimulationState('otp_entry');
    }, 1000);
  };

  // Slider Mouse/Touch Event Handlers
  const handleStart = (clientX: number) => {
    if (slideConfirmed || hasCompleted.current) return;
    setIsSliding(true);
    setStartX(clientX - slideProgress);
  };

  const handleMove = (clientX: number) => {
    if (!isSliding || slideConfirmed || !trackRef.current || hasCompleted.current) return;
    const maxSlide = trackRef.current.clientWidth - 56; // 48px size + margin
    const deltaX = Math.max(0, Math.min(maxSlide, clientX - startX));
    setSlideProgress(deltaX);

    if (deltaX >= maxSlide - 5) {
      setSlideConfirmed(true);
      setSlideProgress(maxSlide);
      setIsSliding(false);
      handleOrderCreation();
    }
  };

  const handleEnd = () => {
    if (!isSliding) return;
    setIsSliding(false);
    if (!trackRef.current) return;
    const maxSlide = trackRef.current.clientWidth - 56;
    if (slideProgress < maxSlide - 5) {
      setSlideProgress(0);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && simulationState !== 'loading' && simulationState !== 'success') {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Secure Payment Gateway</span>
          </DialogTitle>
          <DialogDescription>
            {paymentMethod === 'card' ? '3D Secure Card Verification' :
             paymentMethod === 'upi' ? 'UPI Unified Payments Interface' :
             paymentMethod === 'cod' ? 'Cash on Delivery Confirmation' :
             'Secure checkout processing'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center justify-center text-center">
          {simulationState === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-sm font-medium text-foreground">Processing secure transaction...</p>
              <p className="text-xs text-muted-foreground">Please do not refresh this page or close the window.</p>
            </div>
          )}

          {simulationState === 'success' && (
            <div className="space-y-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto animate-in zoom-in" />
              <h3 className="text-lg font-bold text-emerald-500">Payment Authorized!</h3>
              <p className="text-sm font-medium text-muted-foreground animate-pulse">Processing your order...</p>
            </div>
          )}

          {simulationState === 'failure' && (
            <div className="space-y-4 w-full">
              <XCircle className="h-16 w-16 text-destructive mx-auto animate-in zoom-in" />
              <h3 className="text-lg font-bold text-destructive">Transaction Declined</h3>
              <p className="text-sm text-muted-foreground">The simulated transaction could not be processed.</p>
              <div className="flex justify-center gap-4 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={hasCompleted.current}>
                  Back to Checkout
                </Button>
                {paymentMethod === 'card' && (
                  <Button onClick={handleResendOtp} disabled={hasCompleted.current}>Retry Payment</Button>
                )}
                {paymentMethod === 'upi' && (
                  <Button onClick={() => { setSimulationState('upi_qr'); setUpiTimer(180); }} disabled={hasCompleted.current}>Retry UPI</Button>
                )}
              </div>
            </div>
          )}

          {simulationState === 'otp_entry' && paymentMethod === 'card' && (
            <div className="space-y-6 w-full text-left">
              <div className="bg-muted p-4 rounded-md text-sm space-y-2 border border-muted-foreground/15">
                <div className="flex justify-between font-semibold">
                  <span>Merchant:</span>
                  <span>Farmingo India</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Amount:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Card Number:</span>
                  <span>XXXX XXXX XXXX {formData?.cardNumber?.slice(-4)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Enter the 6-digit OTP sent to your phone:</p>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-lg tracking-[0.5em] font-mono h-12"
                />
                {otpError && (
                  <p className="text-xs text-destructive font-medium">{otpError}</p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Time remaining: <span className="font-semibold text-foreground">0:{otpTimer.toString().padStart(2, '0')}</span>
                </p>
              </div>

              <div className="bg-accent/40 border border-accent rounded-md p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Simulation Tips:</p>
                <p>• Enter any 6 digits (e.g. 123456) to simulate a <span className="text-emerald-500 font-semibold">Successful Checkout</span>.</p>
                <p>• Enter <span className="text-destructive font-mono font-semibold">000000</span> to simulate a <span className="text-destructive font-semibold">Failed / Declined Transaction</span>.</p>
              </div>

              <div className="flex gap-4 pt-2">
                <Button variant="outline" className="w-1/2" onClick={() => onOpenChange(false)} disabled={hasCompleted.current}>
                  Cancel
                </Button>
                <Button
                  className="w-1/2"
                  onClick={handleVerifyOtp}
                  disabled={otpValue.length !== 6 || otpTimer === 0 || hasCompleted.current}
                >
                  Verify OTP
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={handleResendOtp}
                >
                  Didn't receive the OTP? Resend Code
                </button>
              </div>
            </div>
          )}

          {simulationState === 'upi_qr' && paymentMethod === 'upi' && (
            <div className="space-y-6 w-full">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Scan QR code using Google Pay, PhonePe, or BHIM</p>
                <p className="text-lg font-bold mt-1 text-primary">Amount: ₹{total.toFixed(2)}</p>
              </div>

              {/* SVG QR Code */}
              <div className="relative p-2 bg-white rounded-lg inline-block border shadow-inner">
                <svg className="w-44 h-44" viewBox="0 0 100 100">
                  <rect x="10" y="10" width="25" height="25" fill="#000" />
                  <rect x="15" y="15" width="15" height="15" fill="#fff" />
                  <rect x="18" y="18" width="9" height="9" fill="#000" />

                  <rect x="65" y="10" width="25" height="25" fill="#000" />
                  <rect x="70" y="15" width="15" height="15" fill="#fff" />
                  <rect x="73" y="18" width="9" height="9" fill="#000" />

                  <rect x="10" y="65" width="25" height="25" fill="#000" />
                  <rect x="15" y="70" width="15" height="15" fill="#fff" />
                  <rect x="18" y="73" width="9" height="9" fill="#000" />

                  <rect x="40" y="10" width="5" height="5" fill="#000" />
                  <rect x="50" y="15" width="5" height="5" fill="#000" />
                  <rect x="45" y="25" width="5" height="5" fill="#000" />
                  <rect x="55" y="20" width="5" height="5" fill="#000" />
                  <rect x="10" y="40" width="5" height="5" fill="#000" />
                  <rect x="25" y="45" width="5" height="5" fill="#000" />
                  <rect x="20" y="50" width="5" height="5" fill="#000" />

                  <rect x="45" y="45" width="10" height="10" fill="#000" />
                  <rect x="65" y="40" width="5" height="5" fill="#000" />
                  <rect x="80" y="45" width="5" height="5" fill="#000" />

                  <rect x="40" y="65" width="5" height="5" fill="#000" />
                  <rect x="50" y="75" width="5" height="5" fill="#000" />
                  <rect x="55" y="70" width="5" height="5" fill="#000" />

                  <rect x="70" y="65" width="5" height="5" fill="#000" />
                  <rect x="75" y="80" width="5" height="5" fill="#000" />
                  <rect x="85" y="70" width="5" height="5" fill="#000" />
                  <rect x="80" y="85" width="5" height="5" fill="#000" />

                  <rect x="42.5" y="42.5" width="15" height="15" fill="#fff" />
                  <circle cx="50" cy="50" r="5" fill="#15803d" />
                </svg>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground animate-pulse flex items-center justify-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  Awaiting payment confirmation...
                </p>
                <p className="text-xs font-semibold text-destructive">
                  QR expires in: {Math.floor(upiTimer / 60)}:{(upiTimer % 60).toString().padStart(2, '0')}
                </p>
              </div>

              <div className="bg-accent/40 border border-accent rounded-md p-3 text-xs text-muted-foreground space-y-1 text-left">
                <p className="font-semibold text-foreground">Simulation Tips:</p>
                <p>• Click the "Simulate App Approval" button to mimic authorization inside the UPI App.</p>
                <p>• Let the countdown run down or click Cancel to simulate checkout expiration.</p>
              </div>

              <div className="flex gap-4 pt-2">
                <Button variant="outline" className="w-1/2" onClick={() => onOpenChange(false)} disabled={hasCompleted.current}>
                  Cancel
                </Button>
                <Button className="w-1/2" onClick={handleOrderCreation} disabled={hasCompleted.current}>
                  Simulate App Approval
                </Button>
              </div>
            </div>
          )}

          {simulationState === 'cod_slide' && paymentMethod === 'cod' && (
            <div className="space-y-6 w-full">
              <div className="bg-muted p-4 rounded-md text-sm space-y-2 border border-muted-foreground/15 text-left">
                <div className="flex justify-between font-semibold">
                  <span>Payment Mode:</span>
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Amount to Pay:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1 border-t mt-1">
                  Pay via cash or UPI directly to the delivery executive upon package arrival.
                </p>
              </div>

              {/* Tactile confirmation slider using React event handlers */}
              <div
                ref={trackRef}
                className="relative w-full h-14 bg-muted rounded-full border border-muted-foreground/20 overflow-hidden flex items-center justify-center select-none mt-6"
                onMouseMove={(e) => handleMove(e.clientX)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchMove={(e) => {
                  if (e.touches.length > 0) {
                    handleMove(e.touches[0].clientX);
                  }
                }}
                onTouchEnd={handleEnd}
              >
                <span className="text-sm font-semibold text-muted-foreground animate-pulse px-8">
                  {slideConfirmed ? 'Confirmed!' : 'Slide to Confirm Order'}
                </span>

                <div
                  className="absolute left-1 top-1 bottom-1 bg-primary rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing text-primary-foreground font-bold transition-all w-12 h-12 shadow"
                  style={{
                    transform: `translateX(${slideProgress}px)`,
                  }}
                  onMouseDown={(e) => handleStart(e.clientX)}
                  onTouchStart={(e) => {
                    if (e.touches.length > 0) {
                      handleStart(e.touches[0].clientX);
                    }
                  }}
                >
                  →
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)} disabled={hasCompleted.current}>
                  Cancel and Change Payment Method
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
