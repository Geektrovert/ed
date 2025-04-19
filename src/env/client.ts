import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
	client: {},
	runtimeEnv: import.meta.env,
	clientPrefix: "VITE_",
});
