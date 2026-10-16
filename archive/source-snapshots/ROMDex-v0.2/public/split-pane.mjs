export function splitLayout(height, state, defaultWorkHeight, minWork = 240, minDetails = 96) {
  const available = Math.max(0, height - 10);
  const minimum = Math.min(minWork, available * .6);
  const maximum = Math.max(minimum, available - Math.min(minDetails, available * .25));
  const ratio = Number.isFinite(state?.ratio) ? Math.max(0, Math.min(1, state.ratio)) : null;
  const work = state?.collapsed ? available : Math.max(minimum, Math.min(maximum, ratio === null ? defaultWorkHeight : ratio * available));
  return { available, minimum, maximum, work, details: available - work, collapsed: !!state?.collapsed };
}

export class TraySplit {
  constructor({ host, handle, details, preference, onChange }) {
    this.host = host;
    this.handle = handle;
    this.details = details;
    this.onChange = onChange;
    this.state = { ratio: Number.isFinite(preference?.ratio) ? preference.ratio : null, collapsed: preference?.collapsed === true };
    this.active = null;
    this.expanded = false;
    this.observer = new ResizeObserver(() => this.apply());
    this.observer.observe(host);
    handle.addEventListener('pointerdown', event => this.start(event));
    handle.addEventListener('pointermove', event => this.move(event));
    handle.addEventListener('pointerup', event => this.finish(event));
    handle.addEventListener('pointercancel', event => this.finish(event, true));
    handle.addEventListener('lostpointercapture', event => this.finish(event, true));
    handle.addEventListener('keydown', event => this.key(event));
    window.addEventListener('blur', () => this.finish(null, true));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && this.active) { event.preventDefault(); this.finish(null, true); }
    });
    this.apply();
  }

  layout() {
    const height = this.host.getBoundingClientRect().height;
    const defaultHeight = innerWidth <= 700 ? Math.max(180, innerHeight * .35)
      : height - Math.max(innerWidth <= 1000 ? 270 : 235, innerHeight * (innerWidth <= 1000 ? .39 : .34)) - 124;
    const work = this.host.querySelector('#work-tray');
    const table = getComputedStyle(work.querySelector('.table-scroll'));
    const frame = getComputedStyle(work);
    const minimumWork = work.querySelector('.work-header').offsetHeight + work.querySelector('.work-footer').offsetHeight
      + work.querySelector('thead').offsetHeight + 50 + parseFloat(table.paddingTop) + parseFloat(table.paddingBottom)
      + parseFloat(frame.borderTopWidth) + parseFloat(frame.borderBottomWidth) + parseFloat(frame.paddingTop) + parseFloat(frame.paddingBottom);
    return splitLayout(height, this.state, defaultHeight, Math.max(220, minimumWork));
  }

  apply() {
    const layout = this.layout();
    this.host.style.setProperty('--work-height', layout.work + 'px');
    this.host.classList.toggle('details-collapsed', layout.collapsed);
    this.details.hidden = layout.collapsed;
    this.handle.setAttribute('aria-valuenow', String(layout.available ? Math.round(layout.work / layout.available * 100) : 0));
    this.handle.setAttribute('aria-valuetext', layout.collapsed ? 'Details Collapsed. Drag Up to Reopen.' : `Work ${Math.round(layout.work)} Pixels; Details ${Math.round(layout.details)} Pixels`);
    this.handle.querySelector('.split-hint').textContent = layout.collapsed ? 'Details · Drag Up to Reopen' : '';
    const expand = document.getElementById('detail-expand');
    expand.setAttribute('aria-label', this.expanded ? 'Restore Details Tray Size' : 'Expand Details Tray');
    expand.title = expand.getAttribute('aria-label');
  }

  commit() { this.onChange?.({ ...this.state }); }

  collapse() { this.state.collapsed = true; this.expanded = false; this.apply(); this.commit(); }

  reopen() { if (!this.state.collapsed) return; this.state.collapsed = false; this.apply(); this.commit(); }

  toggleExpanded() {
    if (this.expanded) this.state = { ratio: this.beforeExpanded, collapsed: false };
    else { this.beforeExpanded = this.state.ratio; this.state = { ratio: 0, collapsed: false }; }
    this.expanded = !this.expanded;
    this.apply(); this.commit();
  }

  start(event) {
    if (event.button !== 0 || this.active) return;
    event.preventDefault(); event.stopPropagation();
    const rect = this.host.getBoundingClientRect();
    this.active = { pointerId: event.pointerId, offset: event.clientY - rect.top - this.layout().work, initial: { ...this.state }, expanded: this.expanded };
    this.handle.focus({ preventScroll: true });
    this.handle.setPointerCapture(event.pointerId);
    document.body.classList.add('pane-resizing');
  }

  move(event) {
    if (!this.active || event.pointerId !== this.active.pointerId) return;
    event.preventDefault(); event.stopPropagation();
    const desired = event.clientY - this.host.getBoundingClientRect().top - this.active.offset;
    const layout = this.layout();
    this.expanded = false;
    if (desired >= layout.available - 24) this.state.collapsed = true;
    else this.state = { ratio: layout.available ? Math.max(layout.minimum, Math.min(layout.maximum, desired)) / layout.available : 0, collapsed: false };
    this.apply();
  }

  finish(event, cancel = false) {
    if (!this.active || (event && event.pointerId !== this.active.pointerId)) return;
    const active = this.active; this.active = null;
    if (cancel) { this.state = active.initial; this.expanded = active.expanded; }
    if (this.handle.hasPointerCapture(active.pointerId)) this.handle.releasePointerCapture(active.pointerId);
    document.body.classList.remove('pane-resizing');
    this.apply(); if (!cancel) this.commit();
  }

  key(event) {
    const layout = this.layout();
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'End') { this.collapse(); return; }
    if (event.key === 'Enter' || event.key === ' ') this.state.collapsed = !this.state.collapsed;
    else {
      const desired = event.key === 'Home' ? layout.minimum : layout.work + (event.key === 'ArrowUp' ? -1 : 1) * (event.shiftKey ? 80 : 24);
      if (desired >= layout.available - 24 && event.key === 'ArrowDown') this.state.collapsed = true;
      else this.state = { ratio: layout.available ? Math.max(layout.minimum, Math.min(layout.maximum, desired)) / layout.available : 0, collapsed: false };
    }
    this.expanded = false; this.apply(); this.commit();
  }
}
