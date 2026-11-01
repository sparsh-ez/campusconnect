import React, { useEffect, useState, useRef } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  AlertCircle
} from 'lucide-react';
import type { Club, CampusEvent } from '../types';
import type { DemoEventTemplate } from '../data/demoEvents';
import { apiUrl } from '../utils/api';

export interface StageDefinition {
  id: number;
  title: string;
  description: string;
  minDurationMs: number;
}

export const SIMULATION_STAGES: StageDefinition[] = [
  { id: 1, title: 'Initializing agent', description: 'Preparing the event discovery task.', minDurationMs: 1400 },
  { id: 2, title: 'Opening club profile', description: 'Resolving the selected club and its source.', minDurationMs: 1500 },
  { id: 3, title: 'Inspecting recent posts', description: 'Simulating inspection of recent club posts.', minDurationMs: 1800 },
  { id: 4, title: 'Analyzing event information', description: 'Extracting event names, dates, venues, registration details, and status.', minDurationMs: 2000 },
  { id: 5, title: 'Validating events', description: 'Checking required fields, duplicate events, and date consistency.', minDurationMs: 1500 },
  { id: 6, title: 'Saving discoveries', description: 'Persisting the discovered demo events.', minDurationMs: 1400 },
  { id: 7, title: 'Discovery complete', description: 'Showing the number of events discovered.', minDurationMs: 800 },
];

interface AgentActivityPanelProps {
  club: Club;
  onCancel: () => void;
  onComplete: (discoveredEvents: CampusEvent[], totalElapsedSeconds: number) => void;
  onBackToClubs: () => void;
  onViewFeed?: () => void;
  onOpenReview?: () => void;
  isCancelled?: boolean;
  onDockUpdate?: (data: {
    club: Club;
    stageName: string;
    stageIndex: number;
    totalStages: number;
    elapsedSeconds: number;
    progressPercent: number;
  } | null) => void;
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  club,
  onCancel,
  onComplete,
  onBackToClubs,
  onViewFeed,
  onOpenReview,
  isCancelled: initialCancelled = false,
  onDockUpdate,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0); // 0-based index for stages 1 to 7
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isCancelled, setIsCancelled] = useState(initialCancelled);
  const [isFinished, setIsFinished] = useState(false);
  const [discoveredTemplates, setDiscoveredTemplates] = useState<DemoEventTemplate[]>([]);
  const [savedEvents, setSavedEvents] = useState<CampusEvent[]>([]);
  const [revealedEventCount, setRevealedEventCount] = useState(0);

  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);
  const cancelledRef = useRef<boolean>(false);

  // Format MM:SS or SS.S
  const formatElapsedTime = (ms: number) => {
    const totalSecs = (ms / 1000).toFixed(1);
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')} (${totalSecs}s)`;
  };

  // 1. Fetch demo templates for this club at start
  useEffect(() => {
    let isMounted = true;
    fetch(apiUrl(`/api/demo/events?clubId=${encodeURIComponent(club.id)}&handle=${encodeURIComponent(club.handle)}&name=${encodeURIComponent(club.name)}`))
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.events) {
          setDiscoveredTemplates(data.events);
        }
      })
      .catch(err => console.warn('Demo events fetch error:', err));

    return () => { isMounted = false; };
  }, [club]);

  // 2. Start elapsed timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      if (!cancelledRef.current) {
        setElapsedMs(Date.now() - startTimeRef.current);
      }
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Sync state to floating DockedAgentBar if student navigates elsewhere
  useEffect(() => {
    if (isFinished || isCancelled) {
      onDockUpdate?.(null);
    } else {
      const progress = Math.round(((currentStageIndex + 1) / SIMULATION_STAGES.length) * 100);
      onDockUpdate?.({
        club,
        stageName: SIMULATION_STAGES[currentStageIndex].title,
        stageIndex: currentStageIndex,
        totalStages: SIMULATION_STAGES.length,
        elapsedSeconds: elapsedMs / 1000,
        progressPercent: progress,
      });
    }
  }, [currentStageIndex, elapsedMs, isFinished, isCancelled, club, onDockUpdate]);

  // 3. Staged simulation sequence
  useEffect(() => {
    let timeoutId: any = null;

    const runStages = async () => {
      // Loop through stages 0 to 6 (stages 1 to 7)
      for (let i = 0; i < SIMULATION_STAGES.length; i++) {
        if (cancelledRef.current) return;

        setCurrentStageIndex(i);

        // Stage 4: Reveal events progressively
        if (i === 3) {
          // Reveal 1st half of events
          setRevealedEventCount(Math.min(2, discoveredTemplates.length));
        }

        // Stage 5: Reveal all events as validation passes
        if (i === 4) {
          setRevealedEventCount(discoveredTemplates.length);
        }

        // Stage 6: Persist demo events to the shared database
        if (i === 5) {
          if (!cancelledRef.current && discoveredTemplates.length > 0) {
            try {
              const res = await fetch(apiUrl('/api/demo/save'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  clubId: club.id,
                  events: discoveredTemplates,
                }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data.events) {
                  setSavedEvents(data.events);
                }
              }
            } catch (saveErr) {
              console.warn('Failed to save demo events:', saveErr);
            }
          }
        }

        // Stage 7: Discovery complete
        if (i === 6) {
          setIsFinished(true);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          const finalDurationSeconds = Number(((Date.now() - startTimeRef.current) / 1000).toFixed(1));
          
          // Notify parent
          onComplete(savedEvents.length > 0 ? savedEvents : (discoveredTemplates as any), finalDurationSeconds);
          return;
        }

        // Wait stage minDurationMs before advancing
        const stageDuration = SIMULATION_STAGES[i].minDurationMs;
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, stageDuration);
        });
      }
    };

    runStages();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [discoveredTemplates]);

  const handleCancelClick = () => {
    cancelledRef.current = true;
    setIsCancelled(true);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    onCancel();
  };

  const currentStage = SIMULATION_STAGES[currentStageIndex];
  const progressPercent = isCancelled 
    ? 0 
    : isFinished 
    ? 100 
    : Math.round(((currentStageIndex + 1) / SIMULATION_STAGES.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top back navigation */}
      <div 
        className="top-nav" 
        onClick={onBackToClubs}
        style={{ width: 'fit-content' }}
        id="back-from-agent-panel"
      >
        <ArrowLeft size={16} />
        <span>Back to Club Selection</span>
      </div>

      {/* Main Agent Activity Card */}
      <div className="scanning-container" style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
        {/* Top Demo Simulation Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(139, 92, 246, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          color: '#c4b5fd',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '16px',
        }}>
          <Sparkles size={13} style={{ color: 'var(--primary-purple)' }} />
          <span>Demo Simulation • Preconfigured Dataset</span>
        </div>

        {/* Animated Scanner Avatar */}
        <div className="scanner-agent-avatar" style={{ marginBottom: '18px' }}>
          <div className="agent-ring-outer" />
          <div className={`agent-ring-pulse ${isCancelled ? 'cancelled' : ''}`} />
          <div className="agent-center-circle" style={{
            backgroundColor: isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.2)',
            borderColor: isCancelled ? 'var(--accent-rose)' : 'var(--primary-purple)',
          }}>
            <Bot size={44} style={{ color: isCancelled ? 'var(--accent-rose)' : '#c4b5fd' }} />
          </div>
        </div>

        {/* Status Header */}
        <h2 className="scanning-title" style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
          {isCancelled 
            ? 'Discovery cancelled' 
            : isFinished 
            ? 'Discovery complete' 
            : currentStage.title}
        </h2>

        <p className="scanning-subtitle" style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {isCancelled ? (
            <span style={{ color: 'var(--accent-rose)' }}>The simulated agent workflow was stopped by the user.</span>
          ) : isFinished ? (
            <span>
              Simulated discovery finished for <strong style={{ color: '#ffffff' }}>{club.name}</strong> ({club.handle}).
            </span>
          ) : (
            <span>
              Simulating agent discovery for <strong style={{ color: 'var(--primary-purple)' }}>{club.name}</strong> ({club.handle})
            </span>
          )}
        </p>

        {/* Metrics Banner: Elapsed Time & Live Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          padding: '12px 20px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          width: '100%',
          maxWidth: '560px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Elapsed: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{formatElapsedTime(elapsedMs)}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isCancelled 
                ? 'var(--accent-rose)' 
                : isFinished 
                ? 'var(--accent-emerald)' 
                : 'var(--primary-purple)',
              boxShadow: isCancelled 
                ? '0 0 8px rgba(239, 68, 68, 0.6)' 
                : '0 0 8px rgba(139, 92, 246, 0.8)',
            }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Status: <strong style={{ color: '#ffffff' }}>
                {isCancelled ? 'Cancelled' : isFinished ? 'Completed' : `Stage ${currentStageIndex + 1} of 7`}
              </strong>
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div style={{ width: '100%', maxWidth: '640px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>Workflow Progress</span>
            <span style={{ fontWeight: 600, color: '#c4b5fd' }}>{progressPercent}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: isCancelled 
                ? 'var(--accent-rose)' 
                : 'linear-gradient(90deg, #8b5cf6, #ec4899)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
        </div>

        {/* Sequential 7 Stages Card */}
        <div className="scanning-timeline-card" style={{ width: '100%', maxWidth: '640px', textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sequential Agent Stages
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {SIMULATION_STAGES.map((stage, idx) => {
              const isPast = !isCancelled && (currentStageIndex > idx || isFinished);
              const isCurrent = !isCancelled && !isFinished && currentStageIndex === idx;

              return (
                <div 
                  key={stage.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isCurrent 
                      ? 'rgba(139, 92, 246, 0.08)' 
                      : 'transparent',
                    border: isCurrent 
                      ? '1px solid rgba(139, 92, 246, 0.3)' 
                      : '1px solid transparent',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Step icon / indicator */}
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    {isCancelled && currentStageIndex === idx ? (
                      <XCircle size={18} style={{ color: 'var(--accent-rose)' }} />
                    ) : isPast ? (
                      <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
                    ) : isCurrent ? (
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid var(--primary-purple)',
                        borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite',
                      }} />
                    ) : (
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {stage.id}
                      </div>
                    )}
                  </div>

                  {/* Stage text & details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: isCurrent ? 700 : 600, 
                      color: isCurrent ? '#ffffff' : isPast ? '#e2e8f0' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span>{stage.title}</span>
                      {isCurrent && (
                        <span style={{ fontSize: '11px', color: 'var(--primary-purple)', fontWeight: 600 }}>
                          • In progress...
                        </span>
                      )}
                      {isPast && (
                        <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 500 }}>
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {stage.id === 7 && isFinished
                        ? (discoveredTemplates.length > 0 
                            ? `${discoveredTemplates.length} event(s) successfully discovered in demo dataset.` 
                            : 'No events found in the demo dataset.')
                        : stage.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progressive Event Extraction Preview (Revealed during stages 4, 5, 6, 7) */}
        {revealedEventCount > 0 && !isCancelled && (
          <div style={{ width: '100%', maxWidth: '640px', textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '12px' 
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Extracted Event Information ({revealedEventCount}/{discoveredTemplates.length})
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                Validated
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {discoveredTemplates.slice(0, revealedEventCount).map((evt, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    animation: 'fadeIn 0.3s ease-out',
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-purple)',
                    flexShrink: 0,
                  }}>
                    <Calendar size={18} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 700, 
                      color: '#ffffff', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {evt.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {evt.date}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} />
                        {evt.venue.split(',')[0]}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(139, 92, 246, 0.12)',
                    color: '#c4b5fd',
                  }}>
                    {evt.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Summary Card (Stage 7) */}
        {isFinished && !isCancelled && (
          <div style={{
            width: '100%',
            maxWidth: '640px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            textAlign: 'left',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <CheckCircle2 size={22} style={{ color: 'var(--accent-emerald)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                {discoveredTemplates.length > 0 
                  ? `${discoveredTemplates.length} events discovered!`
                  : 'No events found in the demo dataset.'}
              </h3>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              {discoveredTemplates.length > 0 ? (
                <>
                  The simulated agent successfully scanned recent posts from <strong style={{ color: '#ffffff' }}>{club.name}</strong>, analyzed event details, validated required fields, and saved the discoveries to the shared campus database.
                </>
              ) : (
                <>
                  The simulated agent inspected the profile for <strong style={{ color: '#ffffff' }}>{club.name}</strong>, but found no event announcements in this demo dataset.
                </>
              )}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              <span>Total elapsed time: <strong style={{ color: '#ffffff' }}>{(elapsedMs / 1000).toFixed(1)}s</strong></span>
              <span>•</span>
              <span>Club: <strong style={{ color: '#ffffff' }}>{club.handle}</strong></span>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {onOpenReview && discoveredTemplates.length > 0 && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={onOpenReview}
                  id="review-discovered-events-btn"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
                >
                  <Sparkles size={15} />
                  <span>Review & Publish ({discoveredTemplates.length})</span>
                </button>
              )}

              {onViewFeed && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onViewFeed}
                  id="view-discovered-feed-btn"
                >
                  <span>View in Campus Feed</span>
                </button>
              )}

              <button
                type="button"
                className="btn-secondary"
                onClick={onBackToClubs}
              >
                Back to Clubs
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Summary */}
        {isCancelled && (
          <div style={{
            width: '100%',
            maxWidth: '640px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            textAlign: 'left',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <AlertCircle size={22} style={{ color: 'var(--accent-rose)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                Discovery cancelled
              </h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              The simulated agent discovery run was cancelled before completion. No additional events were saved.
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={onBackToClubs}
            >
              Return to Clubs
            </button>
          </div>
        )}

        {/* Panel Action Buttons */}
        {!isFinished && !isCancelled && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancelClick}
              style={{
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#f87171',
              }}
              id="cancel-simulation-btn"
            >
              <XCircle size={15} />
              <span>Cancel Discovery</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
