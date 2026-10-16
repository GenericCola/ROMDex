export function connectionIndicator({automaticSyncEnabled=true,connected=false,youtrackAvailable=false,serviceAvailable=true}={}) {
  if(!automaticSyncEnabled)return {color:'dark-blue',label:'Auto-Sync Data Is Off'};
  if(!serviceAvailable)return {color:'red',label:'ROMDex Service Is Unavailable'};
  if(!connected)return {color:'red',label:'Connect to YouTrack'};
  if(!youtrackAvailable)return {color:'red',label:'YouTrack Connection Is Unavailable'};
  return {color:'blue',label:'YouTrack Connection Is Healthy'};
}
