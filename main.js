document.addEventListener('alpine:init', () => {
  Alpine.data('props', () => ({
    port: undefined,
    disconnectFlag: true,

    addMessage(text) {
      const textarea = document.getElementById('outputArea');
      textarea.value += text;
      textarea.scrollTop = textarea.scrollHeight;
    },

    async onClickConnect() {
      try {
        this.disconnectFlag = false;
        this.port = await navigator.serial.requestPort();
        await this.port.open({ baudRate: 115200 });

        while (this.port.readable) {
          const reader = this.port.readable.getReader();

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) { break; }
              const inputValue = new TextDecoder().decode(value);
              this.addMessage(inputValue);
            }
          }
          catch (error) {
            if (error.message === "The device has been lost." && this.disconnectFlag) return;
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
    },

    async onClickDisconnect() {
      try {
        this.disconnectFlag = true;
        await this.port.forget();
        window.alert('disconnected');
      }
      catch (error) {
        console.error(error);
      }
    },

    async sendSerial() {
      const inputElem = document.getElementById('sendInput');
      const text = inputElem.value;
      inputElem.value = '';

      const encoder = new TextEncoder();
      if (this.port.writable) {
        const writer = this.port.writable.getWriter();
        await writer.write(encoder.encode(text + "\n"));
        writer.releaseLock();
      }
      else {
        window.alert('device unavailable');
      }
    }

  }))
})

