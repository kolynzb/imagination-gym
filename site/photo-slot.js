/* <photo-slot id="..." placeholder="..." fit="cover|contain">
   Self-contained image drop slot. Stores a downscaled WebP data URL in
   IndexedDB under the slot id, so it survives reload on any static host
   (no authoring runtime, no localStorage quota). */
(() => {
  if (customElements.get('photo-slot')) return;

  const DB = 'imaginationGymPhotos', STORE = 'slots';
  const MAX_DIM = 1400, QUALITY = 0.82;
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'];

  let dbP = null;
  function db() {
    if (dbP) return dbP;
    dbP = new Promise((res, rej) => {
      let req;
      try { req = indexedDB.open(DB, 1); } catch (e) { return rej(e); }
      req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE); };
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    }).catch(() => null);
    return dbP;
  }
  async function idbGet(k) {
    const d = await db(); if (!d || !k) return null;
    return new Promise(res => {
      try {
        const r = d.transaction(STORE, 'readonly').objectStore(STORE).get(k);
        r.onsuccess = () => res(r.result || null);
        r.onerror = () => res(null);
      } catch (e) { res(null); }
    });
  }
  async function idbSet(k, v) {
    const d = await db(); if (!d || !k) return false;
    return new Promise(res => {
      try {
        const tx = d.transaction(STORE, 'readwrite');
        v == null ? tx.objectStore(STORE).delete(k) : tx.objectStore(STORE).put(v, k);
        tx.oncomplete = () => res(true);
        tx.onerror = () => res(false);
      } catch (e) { res(false); }
    });
  }

  async function encode(file) {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return c.toDataURL('image/webp', QUALITY);
    } finally { bitmap.close && bitmap.close(); }
  }

  async function idbDump() {
    const d = await db(); if (!d) return {};
    return new Promise(res => {
      try {
        const out = {};
        const tx = d.transaction(STORE, 'readonly').objectStore(STORE).openCursor();
        tx.onsuccess = e => {
          const c = e.target.result;
          if (!c) return res(out);
          out[c.key] = c.value; c.continue();
        };
        tx.onerror = () => res(out);
      } catch (e) { res({}); }
    });
  }

  window.photoSlots = {
    dump: idbDump,
    async restore(obj) {
      if (!obj || typeof obj !== 'object') return;
      for (const k of Object.keys(obj)) await idbSet(k, obj[k]);
      document.querySelectorAll('photo-slot').forEach(el => el.load && el.load());
    }
  };

  const CSS = `
:host{display:block;position:relative;width:100%;height:100%;min-height:64px;overflow:hidden;
  border-radius:inherit;background:var(--canvas,#e2e2df);color:var(--ink,#070607)}
img{display:none;width:100%;height:100%;object-fit:cover;object-position:center}
:host([fit="contain"]) img{object-fit:contain}
:host([data-filled]) img{display:block}
:host([data-filled]) .empty{display:none}
.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:8px;padding:14px;text-align:center;cursor:pointer;background:transparent;border:0;
  font:inherit;font-size:14px;line-height:1.45;color:var(--ink-55,rgba(7,6,7,.64))}
.empty:hover,:host([data-over]) .empty{color:var(--ink,#070607);background:var(--accent-14,rgba(252,80,0,.14))}
.empty svg{opacity:.65}
.hint{max-width:26ch}
.rm{position:absolute;top:8px;right:8px;width:30px;height:30px;border-radius:15px;border:0;cursor:pointer;
  display:none;align-items:center;justify-content:center;background:var(--ink,#070607);color:var(--canvas,#e2e2df);
  font:inherit;font-size:15px;line-height:1;padding:0}
:host([data-filled]:hover) .rm,:host([data-filled]) .rm:focus-visible{display:flex}
input{display:none}
.busy{position:absolute;inset:auto 0 0 0;height:3px;background:var(--accent,#fc5000);display:none}
:host([data-busy]) .busy{display:block}`;

  const ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';

  class PhotoSlot extends HTMLElement {
    static get observedAttributes() { return ['id', 'placeholder']; }

    connectedCallback() {
      if (this._built) { this.load(); return; }
      this._built = true;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `<style>${CSS}</style>
        <img alt="" />
        <button class="empty" type="button" part="empty">${ICON}<span class="hint"></span></button>
        <button class="rm" type="button" title="Remove image" aria-label="Remove image">✕</button>
        <div class="busy"></div>
        <input type="file" accept="image/*" />`;
      this._img = root.querySelector('img');
      this._hint = root.querySelector('.hint');
      this._input = root.querySelector('input');
      root.querySelector('.empty').addEventListener('click', () => this._input.click());
      root.querySelector('.rm').addEventListener('click', e => { e.stopPropagation(); this.clear(); });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        this._input.value = '';
        if (f) this.ingest(f);
      });
      this.addEventListener('dragover', e => { e.preventDefault(); this.setAttribute('data-over', ''); });
      this.addEventListener('dragleave', () => this.removeAttribute('data-over'));
      this.addEventListener('drop', e => {
        e.preventDefault(); this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this.ingest(f);
      });
      this.syncHint();
      this.load();
    }

    attributeChangedCallback(name) {
      if (!this._built) return;
      if (name === 'placeholder') this.syncHint();
      if (name === 'id') this.load();
    }

    syncHint() {
      if (this._hint) this._hint.textContent = this.getAttribute('placeholder') || 'Drop or choose an image';
    }

    async load() {
      const id = this.id;
      if (!id) return;
      const v = await idbGet(id);
      if (this.id !== id) return;
      this.paint(v);
    }

    paint(url) {
      if (url) { this._img.src = url; this.setAttribute('data-filled', ''); }
      else { this._img.removeAttribute('src'); this.removeAttribute('data-filled'); }
    }

    async ingest(file) {
      if (!file || (file.type && !ACCEPT.includes(file.type))) return;
      const id = this.id;
      if (!id) return;
      this.setAttribute('data-busy', '');
      try {
        const url = await encode(file);
        await idbSet(id, url);
        if (this.id === id) this.paint(url);
      } catch (e) { console.error('photo-slot', e); }
      this.removeAttribute('data-busy');
    }

    async clear() {
      const id = this.id;
      this.paint(null);
      if (id) await idbSet(id, null);
    }
  }
  customElements.define('photo-slot', PhotoSlot);
})();
