# Developer Quickstart

In this tutorial we are going to build a simple chat app using XMTP and [Nuxtjs](https://nuxt.com/). We are going to be chatting to a bot for simplicity. The bot is going to be a simple echo bot that will reply with the same message we send.

### Demo App

[<div class="div-header-github-link"></div> xmtp-quickstart-nuxtjs](https://github.com/fabriguespe/xmtp-quickstart-nuxtjs)

```bash
git clone git@github.com:fabriguespe/xmtp-quickstart-nuxtjs.git
cd xmtp-quickstart-nuxtjs
npm install
npm run dev
```

### Getting started

The first step involves creating and configuring the Next.js application.

To generate a new Next.js app, execute the following command in your terminal:

```bash
npx nuxi@latest init my-app
```

### Learning Objectives:

- Setting up the ConnectWallet button
- Signing in with XMTP
- Loading a conversation
- Sending a message

### Install dependencies

```bash
npm install @xmtp/xmtp-js ethers@5.7.0
```

### Configuring the client

First we need to initialize XMTP client using as signer our wallet connection of choice.

```tsx
// Function to connect to the wallet
async connectWallet() {
  // Check if the ethereum object exists on the window object
  if (typeof window.ethereum !== "undefined") {
    try {
      // Request access to the user's Ethereum accounts
      await window.ethereum.enable();

      // Instantiate a new ethers provider with Metamask
      this.provider = new ethers.providers.Web3Provider(window.ethereum);

      // Get the signer from the ethers provider
      this.signer = this.provider.getSigner();

      // Update the isConnected data property based on whether we have a signer
      this.isConnected = !!this.signer;
    } catch (error) {
      console.error("User rejected request");
    }
  } else {
    console.error("Metamask not found");
  }
}
// Function to initialize XMTP
async initXmtp(signer) {
  // Create a new XMTP client with the signer
  const xmtp = await Client.create(signer, { env: "production" });

  // Start a new conversation
  this.newConversation(xmtp, PEER_ADDRESS);

  // Update the isOnNetwork data property based on whether we have an address
  this.isOnNetwork = !!xmtp.address;

  // Store the XMTP client reference
  this.clientRef = xmtp;
}
```

### Display connect with XMTP

Now that we have the wrapper we can add a button that will sign our user in with XMTP.

```tsx
<div>
  <!-- Section to connect to the wallet, shown if not connected -->
  <div v-if="!isConnected" class="thirdWeb">
      <button @click="connectWallet" class="btnXmtp">Connect Wallet</button>
  </div>
    <!-- Section to connect to XMTP, shown if connected to wallet but not to XMTP -->
  <div v-if="isConnected && !isOnNetwork" class="xmtp">
      <button @click="initXmtp" class="btnXmtp">Connect to XMTP</button>
    </div>
</div>
```

```tsx
// Function to initialize XMTP
async initXmtp(signer) {
  // Create a new XMTP client with the signer
  const xmtp = await Client.create(signer, { env: "production" });

  // Start a new conversation
  this.newConversation(xmtp, PEER_ADDRESS);

  // Update the isOnNetwork data property based on whether we have an address
  this.isOnNetwork = !!xmtp.address;

  // Store the XMTP client reference
  this.clientRef = xmtp;
}

```

### Load conversation and messages

Now using our hooks we are going to use the state to listen when XMTP is connected.

Later we are going to load our conversations and we are going to simulate starting a conversation with one of our bots

```tsx
// Function to start a new conversation
async newConversation(xmtp_client, addressTo) {
  // Check if we can message the given address
  if (await xmtp_client?.canMessage(PEER_ADDRESS)) {
    // Create a new conversation with the given address
    const conversation = await xmtp_client.conversations.newConversation(
      addressTo,
    );

    // Store the conversation reference
    this.convRef = conversation;

    // Start streaming messages from this conversation
    this.streamMessages();

    // Get the existing messages from the conversation
    const messages = await conversation.messages();

    // Store the messages
    this.messages = messages;
  } else {
    console.log("Can't message because is not on the network.");
  }
}
```

### Listen to conversations

In your component initialize the hook to listen to conversations

```tsx

// Function to stream messages from conversation
async streamMessages() {
  // Start streaming messages from the conversation
  const newStream = await this.convRef.streamMessages();

  // Iterate over each message in the stream
  for await (const msg of newStream) {
    // Check if this message already exists in our messages array
    const exists = this.messages.find((m) => m.id === msg.id);

    // If the message doesn't exist, add it to our messages array
    if (!exists) {
      this.messages.push(msg);
    }
  }
}
```

#### Troubleshooting

The Node Buffer API must be polyfilled in some cases. To do so, add the buffer dependency to your project and then polyfill it in your entry file.

##### VueCLI

If you are usign older versions of Vue which used vue-cli proceed with these steps:

1. Install the webpack package:

```bash
npm install --save-dev webpack
```

2. Then, in your vue.config.js, add the following:

```jsx
const webpack = require("webpack");

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
    ],
  },
  transpileDependencies: true,
};
```

This configuration tells Webpack to provide Buffer whenever it's used, without having to explicitly import it.

3. Then, in your main.js:

```jsx
import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;
```

##### Vite

1. Create a `polyfills.js` file with the following code

```tsx
import { Buffer } from "buffer";
window.Buffer = window.Buffer ?? Buffer;
```

2. Insert it into your `index.js` on the first line

```tsx
import "./polyfills";
```

##### NuxtJS

1. Update nuxt.config.js

```tsx
export default {
  build: {
    extend(config, { isClient }) {
      if (isClient) {
        config.node = {
          Buffer: true,
        };
      }
    },
  },
};
```

2. Create a `polyfills.js` file with the following code

```tsx
import { Buffer } from "buffer";
window.Buffer = window.Buffer ?? Buffer;
```

3. Insert it into your `app.vue` on the first line

```tsx
import "./polyfills";
```
