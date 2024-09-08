import { StateMachine } from "@stackr/sdk/machine";
import { AuthRollupState } from "./state";
import * as genesis from "../../genesis-state.json";
import { transitions } from "./transitions";
import { AuthRollup } from "./types";

const machine = new StateMachine({
    id: "AuthRollup",
    stateClass: AuthRollupState,
    initialState: genesis.state as AuthRollup,
    on: transitions
})

export {machine};