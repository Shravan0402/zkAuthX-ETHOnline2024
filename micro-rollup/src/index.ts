import { ActionConfirmationStatus, ActionEvents, ActionSchema, AllowedInputTypes, ConfirmationEvents, MicroRollup } from "@stackr/sdk";
import { HDNodeWallet, Wallet } from "ethers";
import { stackrConfig } from "../stackr.config";
import { CreateNewService, CreateNewUser, NewLogin, VerifyLogin } from "./stackr/actions";
import { machine } from "./stackr/machine";
import { Playground } from "@stackr/sdk/plugins";
import dotenv from "dotenv";
import express, {Express, Request, Response} from "express";
import cors from "cors";
import axios from "axios";
import { writeFileSync } from "fs";

dotenv.config();

const wallet = new Wallet(process.env.PRIVATE_KEY as string)
const app: Express = express()
app.use(cors())
app.use(express.json())

const signMessage = async (
    wallet: Wallet,
    schema: ActionSchema,
    payload: AllowedInputTypes
    ) => {
    const signature = await wallet.signTypedData(
        schema.domain,
        schema.EIP712TypedData.types,
        payload
    );
    return signature;
    };

const mru = await MicroRollup({
    config: stackrConfig,
    actionSchemas: [CreateNewService, CreateNewUser, NewLogin, VerifyLogin],
    stateMachines: [machine],
    stfSchemaMap:{
        createNewService: CreateNewService.identifier,
        createNewUser: CreateNewUser.identifier,
        newLogin: NewLogin.identifier,
        verifyLogin: VerifyLogin.identifier
    }
})
await mru.init();
Playground.init(mru);
const sm = mru.stateMachines.get<typeof machine>(
    "AuthRollup",
)
if(!sm){
    throw new Error("machine not found")
}


app.post("/new-service", async(req: Request, res: Response) => {
    const action_inputs = {
        serviceId: req.body.serviceId
    }
    const signature = await signMessage(wallet, CreateNewService, action_inputs);
    const action = CreateNewService.actionFrom({
        inputs: action_inputs,
        msgSender: wallet.address,
        signature: signature
    })
    await mru.submitAction("createNewService", action)
    res.send(true)
})

app.post("/new-user", async(req: Request, res: Response) => {

    let zk_res = (await axios.get(`http://127.0.0.1:8000/get-pass-hash/${req.body.password}`)).data
    console.log(zk_res)
    const user_inputs = {
        serviceId: "demo",
        userId: req.body.userId,
        hash1: String(zk_res[0]),
        hash2: String(zk_res[1]),
        hash3: String(zk_res[2]),
        hash4: String(zk_res[3]),
        hash5: String(zk_res[4]),
        hash6: String(zk_res[5]),
        hash7: String(zk_res[6]),
        hash8: String(zk_res[7]),
    }
    const user_signature = await signMessage(wallet, CreateNewUser, user_inputs);
    const user_action = CreateNewUser.actionFrom({
        inputs: user_inputs,
        msgSender: wallet.address,
        signature: user_signature
    })
    await mru.submitAction("createNewUser", user_action)
    console.log(sm?.id)
    res.send(true)
})

app.post("/new-login", async(req: Request, res: Response) => {

    let proof = (await axios.get(`http://127.0.0.1:8000/generate-proof/${req.body.userId}/${req.body.password}`)).data
    writeFileSync("proof.json", JSON.stringify(proof, null, 2))
    const login_inputs = {
        serviceId: "demo",
        userId: req.body.userId,
        proof: JSON.stringify(proof)

    }
    const login_signature = await signMessage(wallet, NewLogin, login_inputs);
    const login_action = NewLogin.actionFrom({
        inputs: login_inputs,
        msgSender: wallet.address,
        signature: login_signature
    })
    await mru.submitAction("newLogin", login_action)

    await getEvent(res)
})

async function getEvent(resp:Response){
    mru.events.subscribe(ConfirmationEvents.C1, async(args) => {
        if(args.actionName==="newLogin"){
            let services = sm?.state.webServices
            let payload = Object(args.payload)
            let res = await axios.post(`http://127.0.0.1:8000/verify-proof`, {
                username: Number(args.payload.userId),
                proof: String(args.payload.proof),
                pub_inputs: services[payload.serviceId].users[payload.userId].password
            }).then(async(res) => {
                let data = args.payload
                data.res = true
                const verify_signature = await signMessage(wallet, VerifyLogin, data);
                const verify_action = VerifyLogin.actionFrom({
                    inputs: data,
                    msgSender: wallet.address,
                    signature: verify_signature
                })
                await mru.submitAction("verifyLogin", verify_action)
                resp.send(true)
            }).catch(async(res) => {
                let data = args.payload
                data.res = false
                const verify_signature = await signMessage(wallet, VerifyLogin, data);
                const verify_action = VerifyLogin.actionFrom({
                    inputs: data,
                    msgSender: wallet.address,
                    signature: verify_signature
                })
                await mru.submitAction("verifyLogin", verify_action)
                resp.send(false)
            })
            
        }
    })
}



app.listen(3000, () => {
    console.log(`[server]: Server is running at http://localhost:3000`);
});