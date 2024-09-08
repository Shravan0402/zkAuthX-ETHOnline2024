import { ActionSchema, SolidityType } from "@stackr/sdk";

export const CreateNewService = new ActionSchema("createNewService", {
    serviceId: SolidityType.STRING
});

export const CreateNewUser = new ActionSchema("createNewUser", {
    serviceId: SolidityType.STRING,
    userId: SolidityType.STRING,
    hash1: SolidityType.STRING,
    hash2: SolidityType.STRING,
    hash3: SolidityType.STRING,
    hash4: SolidityType.STRING,
    hash5: SolidityType.STRING,
    hash6: SolidityType.STRING,
    hash7: SolidityType.STRING,
    hash8: SolidityType.STRING,
});

export const NewLogin = new ActionSchema("newLogin", {
    serviceId: SolidityType.STRING,
    userId: SolidityType.STRING,
    proof: SolidityType.STRING
})

export const VerifyLogin = new ActionSchema("verifyLogin", {
    serviceId: SolidityType.STRING,
    userId: SolidityType.STRING,
    proof: SolidityType.STRING,
    res: SolidityType.BOOL
})