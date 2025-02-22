export type User = {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	createdAt: string;
	updatedAt: string;
};
export type RegisterPayload = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
};

export type LoginPayload = {
	email: string;
	password: string;
};
export type LoginResponse = {
	token: string;
};
