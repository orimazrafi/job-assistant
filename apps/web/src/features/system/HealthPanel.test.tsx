import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithQuery, stubFetch } from '../../test/render';
import { HealthPanel } from './HealthPanel';

describe('HealthPanel', () => {
  it('shows each dependency as up when the API is healthy', async () => {
    stubFetch(200, {
      status: 'ok',
      checks: {
        postgres: { status: 'up', latencyMs: 3 },
        mongo: { status: 'up', latencyMs: 4 },
        redis: { status: 'up', latencyMs: 1 },
      },
    });

    renderWithQuery(<HealthPanel />);

    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(screen.getAllByText('up')).toHaveLength(3);
  });

  it('shows a degraded report returned with 503 instead of an error', async () => {
    stubFetch(503, {
      status: 'degraded',
      checks: { redis: { status: 'down', latencyMs: 2000, error: 'timeout' } },
    });

    renderWithQuery(<HealthPanel />);

    expect(await screen.findByText('degraded')).toBeInTheDocument();
    expect(screen.getByText('down')).toBeInTheDocument();
  });

  it('shows an alert when the API cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    renderWithQuery(<HealthPanel />);

    expect(await screen.findByRole('alert')).toHaveTextContent('API is unreachable');
  });
});
