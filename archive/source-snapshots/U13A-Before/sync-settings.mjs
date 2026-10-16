// This setting belongs to the local service, so stale or additional windows cannot bypass it.
export class SyncSettings {
  constructor(value={},persist=async()=>{}) {this.enabled=value.enabled!==false;this.persist=persist;}
  async set(enabled){
    if(typeof enabled!=='boolean')throw new Error('Choose On or Off for Auto-Sync Data.');
    await this.persist({enabled});this.enabled=enabled;
  }
  allows(manual=false){return this.enabled||manual===true;}
}
