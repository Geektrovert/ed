import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		OPENAI_API_KEY: z.string().min(1),
		OPENAI_BASE_URL: z.string().min(1).url(),
		BLOB_READ_WRITE_TOKEN: z.string().min(1),
		KV_URL: z.string().min(1).url(),
		KV_REST_API_READ_ONLY_TOKEN: z.string().min(1),
		REDIS_URL: z.string().min(1).url(),
		KV_REST_API_TOKEN: z.string().min(1),
		KV_REST_API_URL: z.string().min(1).url(),
	},
	runtimeEnv: import.meta.env,
});
