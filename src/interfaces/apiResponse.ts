export type ApiResponse<T = any> = {
	message: string;
	status: number;
	data?: T;
	pagination?: {
		page: number;
		limit: number;
		total: number;
	};
};
