import { REQUIRE, STF, Transitions } from "@stackr/sdk/machine";
import { LoginUser, NewService, NewUser, User, VerifyLogin, WebService } from "./types";
import { AuthRollupState } from "./state";

const createNewService: STF<AuthRollupState, NewService> = {

    handler: ({state, inputs, msgSender}) => {

        const webService: WebService = {
            id: inputs.serviceId,
            admin: msgSender.toString(),
            users: {}
        }
        state.webServices[inputs.serviceId] = webService
        return state
    }
}

const createNewUser: STF<AuthRollupState, NewUser> = {

    handler: ({state, inputs, msgSender}) => {

        REQUIRE(state.webServices[inputs.serviceId].admin.toLocaleLowerCase()===msgSender.toString().toLocaleLowerCase(), "Only service admin can add users");

        const user: User = {
            username: inputs.userId,
            password: [inputs.hash1, inputs.hash2, inputs.hash3, inputs.hash4, inputs.hash5, inputs.hash6, inputs.hash7, inputs.hash8 ],
            pendingLogins:[],
            totalLogins: 0,
            lastLoginTimestamp: -1
        }

        state.webServices[inputs.serviceId].users[inputs.userId] = user;
    
        return state

    }

}

const newLogin: STF<AuthRollupState, LoginUser> = {

    handler: ({state, inputs, msgSender}) => {

        REQUIRE(state.webServices[inputs.serviceId].admin.toLocaleLowerCase()===msgSender.toString().toLocaleLowerCase(), "Only service admin can add users");

        state.webServices[inputs.serviceId].users[inputs.userId].pendingLogins.push(inputs.proof);

        return state
    }

}

const verifyLogin: STF<AuthRollupState, VerifyLogin> = {

    handler: ({state, inputs, msgSender, block}) => {

        REQUIRE(state.operator.toLocaleLowerCase() === msgSender.toLocaleLowerCase(), "Only operator can verify login");

        let index = -1;
        let count = 0;
        for(let i of state.webServices[inputs.serviceId].users[inputs.userId].pendingLogins){
            if(i===inputs.proof){
                index = count;
            }
            count++;
        }
        REQUIRE(index!==-1, "Proof not found")
        state.webServices[inputs.serviceId].users[inputs.userId].pendingLogins.splice(index,1)
        if(inputs.res === true){
            state.webServices[inputs.serviceId].users[inputs.userId].totalLogins++;
            state.webServices[inputs.serviceId].users[inputs.userId].lastLoginTimestamp = block.timestamp
        }

        return state
    }

}

export const transitions: Transitions<AuthRollupState> = {
    newLogin,
    createNewUser,
    createNewService,
    verifyLogin
}