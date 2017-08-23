let isSupported;
const files = [];

if (self.fetch) isSupported = true;
else isSupported = false;

function send(type, payload) {
  postMessage({
    type,
    payload,
  });
}

function progressReport(progress) {
  send('progress', progress);
}

function completedUpload() {
  send('complete');
}

onmessage = function onMessage(event) {
  const { data } = event;
  switch (data.type) {
    default: break;
    case 'setup': {
      send('initialized', isSupported);
      break;
    }
    case 'load': {
      const id = files.length;
      send('loaded', id);
      break;
    }
    case 'push': {
      send('sending');
      break;
    }
  }
};
