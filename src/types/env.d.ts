export interface EnvVariables {
	NODE_ENV: "development" | "production" | "test";
	PORT: string;
	MONGO_URI: string;
	JWT_SECRET: string;
	REFRESH_SECRET: string;
	ACCESS_TOKEN_EXPIRES_IN: string;
	REFRESH_TOKEN_EXPIRES_IN: string;
	FRONTEND_URL: string;
}

declare module EnvVariables {
	interface EnvVariables {
		NODE_ENV: "development" | "production" | "test";
		PORT: string;
		MONGO_URI: string;
		JWT_SECRET: string;
		REFRESH_SECRET: string;
		ACCESS_TOKEN_EXPIRES_IN: string;
		REFRESH_TOKEN_EXPIRES_IN: string;
		FRONTEND_URL: string;
	}
}
