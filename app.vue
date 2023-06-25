<template>
  <!-- The div for the entire Home component -->
  <div class="Home">
    <!-- Section to connect to the wallet, shown if not connected -->
    <div v-if="!isConnected" class="thirdWeb">
      <button @click="connectWallet" class="btnXmtp">Connect Wallet</button>
    </div>
    <!-- Section to connect to XMTP, shown if connected to wallet but not to XMTP -->
    <div v-if="isConnected && !isOnNetwork" class="xmtp">
      <button @click="initXmtp" class="btnXmtp">Connect to XMTP</button>
    </div>
    <!-- Display the Chat component if connected to both wallet and XMTP and messages exist -->
    <template v-if="isConnected && isOnNetwork && messages">
      <Chat
        :client="clientRef"
        :conversation="convRef"
        :messageHistory="messages"
      />
    </template>
  </div>
</template>

<script>
import "./polyfills";
import { Client } from "@xmtp/xmtp-js";
import { ethers } from "ethers";
import Chat from "./components/Chat.vue";
// Address of the peer to connect to
const PEER_ADDRESS = "0x937C0d4a6294cdfa575de17382c7076b579DC176";

export default {
  data() {
    return {
      // Placeholder to store XMTP client
      clientRef: false,
      // Flag for if the wallet is connected
      isConnected: false,
      // Flag for if connected to XMTP
      isOnNetwork: false,
      // Placeholder to store the conversation messages
      messages: null,
      // Placeholder to store conversation reference
      convRef: false,
    };
  },
  async mounted() {
    // On the client-side only (after the component has been mounted), we try to connect to the wallet and initialize XMTP.
    if (process.client) {
      // When component is loaded, connect to the wallet and initialize XMTP
      await this.connectWallet();
      this.initXmtp(this.signer);
    }
  },
  methods: {
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
    },
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
    },
    // Function to start a new conversation
    async newConversation(xmtp_client, addressTo) {
      // Check if we can message the given address
      if (await xmtp_client?.canMessage(PEER_ADDRESS)) {
        // Create a new conversation with the given address
        const conversation = await xmtp_client.conversations.newConversation(
          addressTo
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
    },
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
    },
  },

  components: {
    // Define the child component
    Chat,
  },
};
</script>
