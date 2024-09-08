import { solidityPackedKeccak256 } from "ethers";
import { AuthRollup, User, WebService } from "./types";
import {MerkleTree} from "merkletreejs";

export const constructTree = (state: AuthRollup): string => {
    const webServiceHashes = Object.entries(state.webServices).map(
        ([id, webService]) => solidityPackedKeccak256(["string","string"], [id, getServiceHash(webService)]));
    const rollupRoot = new MerkleTree(webServiceHashes).getHexRoot()
    return rollupRoot;
}

const getServiceHash = (webService: WebService): string => {
    const hashes = Object.entries(webService.users).map(([id, user]) => solidityPackedKeccak256(["string", "string"], [id, getUserHash(user)]));
    const serviceRoot = new MerkleTree([webService.admin, webService.id, ...hashes]).getHexRoot();
    return serviceRoot;
}

const getUserHash = (user: User): string => {
    const userRoot = new MerkleTree([...user.password, user.lastLoginTimestamp, user.totalLogins, ...user.pendingLogins, user.username]).getHexRoot();
    return userRoot;
}