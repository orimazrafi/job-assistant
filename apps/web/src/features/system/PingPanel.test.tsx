import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithQuery, stubFetch } from '../../test/render';
import { PingPanel } from './PingPanel';

describe('PingPanel', () => {
  it('posts a ping and shows the round-trip time', async () => {
    const fetchMock = stubFetch(200, {
      pong: true,
      processedAt: '2026-01-01T00:00:00.000Z',
      workerPid: 1,
      roundTripMs: 7,
    });

    renderWithQuery(<PingPanel />);
    await userEvent.click(screen.getByRole('button', { name: 'Ping worker' }));

    expect(await screen.findByText('Worker answered in 7 ms.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/system/ping',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });

  it('shows the server message when the worker does not answer', async () => {
    stubFetch(504, {
      statusCode: 504,
      error: 'WorkerTimeoutError',
      message: 'Worker did not answer within 5000 ms',
    });

    renderWithQuery(<PingPanel />);
    await userEvent.click(screen.getByRole('button', { name: 'Ping worker' }));

    expect(await screen.findByText('Worker did not answer within 5000 ms')).toBeInTheDocument();
  });
});
