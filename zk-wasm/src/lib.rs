use plonky2::{field::types::Field, hash::{hash_types::HashOut, poseidon::PoseidonHash}, iop::{target::Target, witness::{PartialWitness, WitnessWrite}}, plonk::{circuit_builder::CircuitBuilder, circuit_data::{CircuitConfig, CircuitData}, config::{GenericConfig, Hasher, PoseidonGoldilocksConfig}, proof::{Proof, ProofWithPublicInputs}}};
use wasm_bindgen::prelude::*;
use plonky2::field::goldilocks_field::GoldilocksField;
use wasm_bindgen_test::*;

#[wasm_bindgen]
pub fn print_string(pass: String) ->  String{
    pass
}

#[wasm_bindgen]
pub fn generate_proof(username: u32, password: String) -> String{

    const D: usize = 2;
    type C = PoseidonGoldilocksConfig;
    type F = <C as GenericConfig<D>>::F;

    let mut bytes = password.as_bytes().to_vec();
    bytes.resize(16, 0);

    let mut result = Vec::with_capacity(2);
    for chunk in bytes.chunks(8) {
        let mut buffer = [0u8; 8];
        for (i, &byte) in chunk.iter().enumerate() {
            buffer[i] = byte;
        }
        result.push(u64::from_le_bytes(buffer));
    }

    let mut hashes: Vec<HashOut<GoldilocksField>> = vec![];
    for byt in result.iter(){
        hashes.push(PoseidonHash::hash_no_pad(&[Field::from_canonical_u64(*byt)]));
    }

    let inp = [F::from_canonical_u64(result[0]), F::from_canonical_u64(result[1])];
    println!("{:?}", inp);
    let user: HashOut<GoldilocksField> = PoseidonHash::hash_no_pad(&[Field::from_canonical_u32(username)]);


    

    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F,D>::new(config);

    let inputs: [Target; 2] = builder.add_virtual_target_arr();
    let outputs = builder.add_virtual_hashes(2);
    let username = builder.add_virtual_hash();

    for i in 0..2{
        let hash = builder.hash_n_to_hash_no_pad::<PoseidonHash>([inputs[i]].to_vec());
        builder.connect_hashes(hash, outputs[i]);
    }

    builder.register_public_inputs(&outputs[0].elements);
    builder.register_public_inputs(&outputs[1].elements);
    builder.register_public_inputs(&username.elements);

    let mut pw = PartialWitness::new();
    pw.set_target_arr(&inputs, &inp);
    pw.set_hash_target(outputs[0], hashes[0]);
    pw.set_hash_target(outputs[1], hashes[1]);
    pw.set_hash_target(username, user);


    let data: CircuitData<F,C,D> = builder.build::<C>();
    let mut proof = data.prove(pw).unwrap();
    proof.public_inputs = vec![];
    serde_json::to_string(&proof).unwrap()

}

#[wasm_bindgen]
pub fn verify_proof(proof: String, pub_inputs: Vec<String>, pub_username: u32) -> bool{
    const D: usize = 2;
    type C = PoseidonGoldilocksConfig;
    type F = <C as GenericConfig<D>>::F;
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F,D>::new(config);

    let inputs: [Target; 2] = builder.add_virtual_target_arr();
    let outputs = builder.add_virtual_hashes(2);
    let username = builder.add_virtual_hash();

    for i in 0..2{
        let hash = builder.hash_n_to_hash_no_pad::<PoseidonHash>([inputs[i]].to_vec());
        builder.connect_hashes(hash, outputs[i]);
    }

    builder.register_public_inputs(&outputs[0].elements);
    builder.register_public_inputs(&outputs[1].elements);
    builder.register_public_inputs(&username.elements);
    let data: CircuitData<F,C,D> = builder.build::<C>();
    let mut proof:ProofWithPublicInputs<F,C,D> = serde_json::from_str(&proof).unwrap();
    let pub_inputs: Vec<u64> = pub_inputs.into_iter().filter_map(|s| s.parse::<u64>().ok()).collect();
    proof.public_inputs = pub_inputs.iter().map(|num| F::from_canonical_u64(*num)).collect();
    proof.public_inputs.extend(PoseidonHash::hash_no_pad(&[F::from_canonical_u32(pub_username)]).elements);
    
    data.verify(proof).unwrap();

    true
}

pub mod tests{
    use crate::generate_proof;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    pub fn pass(){
        generate_proof(123, String::from("123"));
    }

}