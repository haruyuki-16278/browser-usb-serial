let port;
let disconnectFlag;

async function onClickConnect() {
  try {
    disconnectFlag = false;
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    while (port.readable) {
      const reader = port.readable.getReader();

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) { break; }
          const inputValue = new TextDecoder().decode(value);
          console.log(inputValue);
        }
      }
      catch (error) {
        if (error.message === "The device has been lost." && disconnectFlag) return;
        console.table(error);
      }
      finally {
        reader.releaseLock();
      }
    }
  }
  catch (error) {
    console.error(error);
  }
}

async function onClickDisconnect() {
  try {
    disconnectFlag = true;
    await port.forget();
    window.alert('disconnected');
  }
  catch (error) {
    console.error(error);
  }
}

async function sendSerial() {
  const inputElem = document.getElementById('sendInput');
  const text = inputElem.value;
  inputElem.value = '';

  const encoder = new TextEncoder();
  const writer = port.writable.getWriter();
  await writer.write(encoder.encode(text + "\n"));
  writer.releaseLock();
}

