/**
 * Stepper Component
 * Composant stepper/wizard amélioré
 */

'use client';

import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
  optional?: boolean;
  disabled?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  showStepNumbers?: boolean;
  allowNavigation?: boolean;
}

export function Stepper({
  steps,
  currentStep,
  onStepChange,
  orientation = 'horizontal',
  className,
  showStepNumbers = true,
  allowNavigation = true,
}: StepperProps) {
  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  const handleStepClick = (index: number) => {
    if (!allowNavigation) return;
    const step = steps[index];
    if (step.disabled) return;
    if (index <= currentStep || step.optional) {
      onStepChange?.(index);
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex gap-6', className)}>
        {/* Steps */}
        <div className="flex flex-col gap-4 min-w-[200px]">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isClickable = allowNavigation && !step.disabled && (index <= currentStep || step.optional);

            return (
              <div key={step.id} className="relative">
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-5 top-10 w-0.5',
                      status === 'completed' ? 'bg-blue-500' : 'bg-slate-700'
                    )}
                    style={{ height: 'calc(100% + 1rem)' }}
                  />
                )}

                {/* Step */}
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-start gap-3 text-left w-full',
                    isClickable && 'cursor-pointer',
                    !isClickable && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {/* Icon/Number */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors',
                      status === 'completed' && 'bg-blue-500 border-blue-500',
                      status === 'current' && 'bg-blue-500/20 border-blue-500',
                      status === 'upcoming' && 'bg-slate-800 border-slate-600'
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : showStepNumbers ? (
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          status === 'current' ? 'text-blue-400' : 'text-slate-400'
                        )}
                      >
                        {index + 1}
                      </span>
                    ) : (
                      step.icon
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          status === 'current' && 'text-blue-400',
                          status === 'completed' && 'text-slate-200',
                          status === 'upcoming' && 'text-slate-400'
                        )}
                      >
                        {step.label}
                      </span>
                      {step.optional && (
                        <span className="text-xs text-slate-400">(Optionnel)</span>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {steps[currentStep]?.content}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = allowNavigation && !step.disabled && (index <= currentStep || step.optional);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex items-center gap-2',
                    isClickable && 'cursor-pointer',
                    !isClickable && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {/* Icon/Number */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors',
                      status === 'completed' && 'bg-blue-500 border-blue-500',
                      status === 'current' && 'bg-blue-500/20 border-blue-500',
                      status === 'upcoming' && 'bg-slate-800 border-slate-600'
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : showStepNumbers ? (
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          status === 'current' ? 'text-blue-400' : 'text-slate-400'
                        )}
                      >
                        {index + 1}
                      </span>
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          status === 'current' && 'text-blue-400',
                          status === 'completed' && 'text-slate-200',
                          status === 'upcoming' && 'text-slate-400'
                        )}
                      >
                        {step.label}
                      </span>
                      {step.optional && (
                        <span className="text-xs text-slate-400">(Optionnel)</span>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-xs text-slate-400">{step.description}</p>
                    )}
                  </div>
                </button>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4',
                    status === 'completed' ? 'bg-blue-500' : 'bg-slate-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {steps[currentStep]?.content}
      </div>
    </div>
  );
}

