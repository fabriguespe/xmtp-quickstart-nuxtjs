<template>
  <div class="Chat">
    <div class="messageContainer">
      <ul class="messageList">
        <li
          v-for="message in uniqueMessages"
          :key="message.id"
          class="messageItem"
          title="Click to log this message to the console"
          @click="logMessage(message)">
          <strong>
            {{ message.senderAddress === client.address ? "You" : "Bot" }}:
          </strong>
          <span>{{ message.content }}</span>
          <span class="date"> ({{ message.sent.toLocaleTimeString() }})</span>
          <span class="eyes">👀</span>
        </li>
      </ul>
    </div>
    <div class="inputContainer">
      <input
        type="text"
        class="inputField"
        @keypress="handleInputChange"
        @input="updateInputValue"
        :value="inputValue"
        placeholder="Type your text here " />
      <button class="sendButton" @click="handleSend">&#128073;</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["client", "messageHistory", "conversation"],
  data() {
    return {
      inputValue: "",
    };
  },
  computed: {
    uniqueMessages() {
      return this.messageHistory.filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
      );
    },
  },
  methods: {
    async handleSend() {
      if (this.inputValue) {
        await this.onSendMessage(this.inputValue);
        this.inputValue = "";
      }
    },
    async onSendMessage(value) {
      return this.conversation.send(value);
    },
    handleInputChange(event) {
      if (event.key === "Enter") {
        this.handleSend();
      }
    },
    updateInputValue(event) {
      this.inputValue = event.target.value;
    },
    logMessage(message) {
      console.log(message);
    },
  },
};
</script>
<style>
#app {
  padding: 0px !important;
}
</style>
<style scoped>
ul {
  list-style-type: none;
}
.messageList {
  padding: 0px;
}
.Chat {
  background-color: white;
  margin: 0;
  color: black;
  padding: 0;
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  justify-content: center;
  margin: 0;
}

.messageContainer {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
}

.inputContainer {
  display: flex;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #ccc;
}

.inputField {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  color: #555;
  box-sizing: border-box;
}

.sendButton {
  background-color: #f7f7f7;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 12px;
  font-size: 16px;
  color: #555;
  cursor: pointer;
  margin-left: 10px;
  outline: none;
}

.sendButton:active {
  background-color: #e5e5e5;
}

.selectedMessage {
  background-color: black;
  color: white;
}
.eyes {
  align-items: center;
  font-size: 12px;
  cursor: pointer;
}
.date {
  color: grey;
  font-size: 12px;
}
</style>
