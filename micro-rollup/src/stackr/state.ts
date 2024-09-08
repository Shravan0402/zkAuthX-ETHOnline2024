import { BytesLike, State } from "@stackr/sdk/machine";
import { AuthRollup } from "./types";
import { constructTree } from "./tree";

export class AuthRollupState extends State<AuthRollup>{

    constructor(state: AuthRollup){
        super(state);
    }

    getRootHash(): BytesLike {
        // return(new MerkleTree(["hello"]).getHexRoot())
        return constructTree(this.state)
    }

}