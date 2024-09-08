export type WebService = {
    id: string,
    admin: string,
    users: Record<string, User>
}

export type User = {
    username: string,
    password: string[],
    pendingLogins: string[],
    totalLogins: number
    lastLoginTimestamp: number
}

export type AuthRollup = {
    webServices: Record<string, WebService>,
    operator: string
}

export type NewService = {
    serviceId: string
}

export type NewUser = {
    serviceId: string,
    userId: string,
    hash1: string,
    hash2: string,
    hash3: string,
    hash4: string,
    hash5: string,
    hash6: string,
    hash7: string,
    hash8: string
}

export type LoginUser = {
    serviceId: string,
    userId: string,
    proof: string,
}

export type VerifyLogin = {
    serviceId: string,
    userId: string,
    proof: string,
    res: boolean
}
