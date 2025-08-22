"use client";

import { useCallback } from 'react';
import { Button, Stack, Typography } from '@mui/material';

type StartScreenProps = {
  onStart: () => void;
};

export default function StartScreen({ onStart }: StartScreenProps) {
  const handleStart = useCallback(() => {
    onStart();
  }, [onStart]);

  return (
    <div className="kiosk-shell">
      <div className="kiosk-hero modern-card" style={{ padding: '48px', color: '#fff', background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 className="kiosk-title" style={{ color: '#fff', WebkitTextFillColor: 'unset', background: 'none' }}>Ricohpel - Exponovatech 2025</h1>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 800,
            color: '#ffffff',
            mb: 2,
            fontSize: { xs: '1.75rem', sm: '2.25rem' }
          }}
        >
          Gerador de Avatar Profissional
        </Typography>
        <Typography
          variant="h6"
          sx={{
            maxWidth: '820px',
            mx: 'auto',
            lineHeight: 1.6,
            fontSize: { xs: '1rem', sm: '1.125rem' },
            color: 'rgba(255,255,255,0.9)',
            mb: 4
          }}
        >
          Toque em INICIAR para criar seu avatar 3D com base na sua foto e preferências.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="kiosk-actions" sx={{ justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            className="modern-button start-button btn-danger"
            onClick={handleStart}
            sx={{ minWidth: '340px', borderRadius: '9999px', paddingY: '22px', fontSize: '2rem', color: '#fff' }}
          >
            INICIAR
          </Button>
        </Stack>
        <div className="kiosk-footnote" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <span>Totem interativo • Toque para navegar</span>
        </div>
      </div>
    </div>
  );
} 