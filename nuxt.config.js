import { Buffer } from "buffer";

export default {
  build: {
    extend(config, { isClient }) {
      if (isClient) {
        config.node = {
          Buffer: Buffer,
        };
      }
    },
  },
};
