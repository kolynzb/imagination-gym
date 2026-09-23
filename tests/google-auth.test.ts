import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cancelGoogleSignInPrompt, disableAutomaticGoogleSignIn, renderGoogleButton } from '../src/lib/googleAuth';

describe('Google returning sign-in', () => {
  const id = { initialize: vi.fn(), renderButton: vi.fn(), prompt: vi.fn(), cancel: vi.fn(), disableAutoSelect: vi.fn() };
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client');
    vi.stubGlobal('window', { google: { accounts: { id } } });
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('requests a fresh Google credential and delivers it through the normal callback', async () => {
    const success = vi.fn();
    expect(await renderGoogleButton({ clientWidth: 280 } as HTMLElement, success)).toBe(true);
    expect(id.initialize).toHaveBeenCalledWith(expect.objectContaining({ auto_select: true }));
    expect(id.prompt).toHaveBeenCalledOnce();
    const credential = `header.${btoa(JSON.stringify({ name: 'Artist', sub: 'account-a' }))}.signature`;
    id.initialize.mock.calls[0][0].callback({ credential });
    expect(success).toHaveBeenCalledWith({ credential, profile: { name: 'Artist', sub: 'account-a', email: '', picture: '' } });
  });

  it('keeps the manual button available when the browser blocks One Tap', async () => {
    id.prompt.mockImplementation(() => { throw new Error('blocked'); });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(await renderGoogleButton({ clientWidth: 280 } as HTMLElement, vi.fn())).toBe(true);
    expect(id.renderButton).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('disables auto-selection and cancels the prompt on explicit sign-out', () => {
    disableAutomaticGoogleSignIn();
    expect(id.disableAutoSelect).toHaveBeenCalledOnce();
    expect(id.cancel).toHaveBeenCalledOnce();
  });

  it('cancels a dismissed view without disabling future automatic sign-in', () => {
    cancelGoogleSignInPrompt();
    expect(id.cancel).toHaveBeenCalledOnce();
    expect(id.disableAutoSelect).not.toHaveBeenCalled();
  });
});
