# zkAuthX

![zkAuthX](https://github.com/user-attachments/assets/f886538c-be3c-4d6c-8350-1eac9941f89b)

## Project Description
zkAuthX is an easy-to-integrate ZK Auth SDK powered by Stackr's Micro-rollup. Previously there were many attempts to build ZK-based authentication systems but were very complex and were never used in real-life cases. To bring ZK into mainstream authentication, we have built this ZK Auth SDK, which is very easy to integrate for devs and provides a similar web2 experience to users while using ZK proving systems at the backend. Micro-rollups are used to store all the details about the authentications. We have tried to build a modular infrastructure that can be used to plug in multiple proof markets making it very feasible and cheap. We have also used Plonky2 to generate efficient ZK proofs proving knowledge of passwords.

## How it's made
The core ZK circuits were developed with the Plonky2 proving system, which is extremely efficient and generates authentication proofs in milliseconds. To expose these zk crates we have used Rocket API. The micro-rollup was built with Stackr's SDK, written in TS. We have used multiple actions like createService, createUser, newLogin, verifyLogin, etc in out micro-rollup. We have also used events-based tracking of actions to make the API responsive to the UI. The frontend was developed with the React framework.
